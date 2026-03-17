import json
import os
import stripe
import paypalrestsdk
from django.core.mail import send_mail
from django.conf import settings
from django.http import JsonResponse, FileResponse, Http404, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404

from .models import ContactMessage, Order, Product 

stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')

paypalrestsdk.configure({
    "mode": "sandbox",  
    "client_id": getattr(settings, 'PAYPAL_CLIENT_ID', ''),
    "client_secret": getattr(settings, 'PAYPAL_SECRET', '')
})

@csrf_exempt
def contact_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            ContactMessage.objects.create(name=data.get('name'), email=data.get('email'), message=data.get('message'))
            return JsonResponse({"status": "success", "message": "Aapka message send ho gaya hai!"}, status=201)
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)
    return JsonResponse({"status": "error", "message": "Method not allowed"}, status=405)

@csrf_exempt
def process_real_payment(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            method = data.get('payment_method', 'Card')
            
            # STEP 1: Database se Product fetch karna
            # Hum pehla active product fetch kar rahe hain
            product = Product.objects.filter(is_active=True).first()
            if not product:
                return JsonResponse({"status": "error", "message": "Product currently unavailable."}, status=404)

            # Order create karein (Status Pending rahega)
            order = Order.objects.create(
                name=data.get('name'), 
                email=data.get('email'), 
                phone=data.get('phone'), 
                amount=product.price_inr, # Hardcoded 299 ki jagah database ki price
                currency='INR', 
                payment_method=method,
                payment_status='Pending' 
            )

            # 2. Agar user ne 'Card' select kiya hai -> Stripe Checkout
            if method == 'Card':
                checkout_session = stripe.checkout.Session.create(
                    payment_method_types=['card'],
                    line_items=[{
                        'price_data': {
                            'currency': 'inr',
                            'product_data': {
                                'name': product.name, # Model se naam fetch kiya
                            },
                            'unit_amount': int(product.price_inr * 100), # Paise mein convert kiya
                        },
                        'quantity': 1,
                    }],
                    mode='payment',
                    success_url=f"{settings.FRONTEND_URL}/thank-you.html?token={order.download_token}",
                    cancel_url=f"{settings.FRONTEND_URL}/checkout.html",
                    # STEP 2: Webhook ke liye Metadata add karna
                    metadata={
                        'order_id': order.id
                    }
                )
                
                order.transaction_id = checkout_session.id
                order.save()

                return JsonResponse({"status": "success", "payment_url": checkout_session.url})
            # 3. Agar user ne 'PayPal' select kiya hai -> PayPal Checkout
            elif method == 'PayPal':
                
                # Note: PayPal ka testing environment (Sandbox) kai baar INR me error deta hai. 
                # Isliye integration ke liye hum yahan USD use kar rahe hain. Live mode me aap account settings ke hisab se badal sakte hain.
                usd_amount = "3.99" 
                
                payment = paypalrestsdk.Payment({
                    "intent": "sale",
                    "payer": {
                        "payment_method": "paypal"
                    },
                    "redirect_urls": {
                        "return_url": f"{settings.FRONTEND_URL}/thank-you.html?token={order.download_token}",
                        "cancel_url": f"{settings.FRONTEND_URL}/checkout.html"
                    },
                    "transactions": [{
                        "item_list": {
                            "items": [{
                                "name": "Ultimate Kids Workbook (PDF)",
                                "sku": "workbook_001",
                                "price": usd_amount,
                                "currency": "USD",
                                "quantity": 1
                            }]
                        },
                        "amount": {
                            "total": usd_amount,
                            "currency": "USD"
                        },
                        "description": "Kids Learning Workbook PDF Purchase"
                    }]
                })

                # Payment create karein aur approval link dhundhein
                if payment.create():
                    approval_url = None
                    for link in payment.links:
                        if link.rel == "approval_url":
                            approval_url = str(link.href)
                            break
                    
                    # PayPal ka generated ID order me save karein
                    order.transaction_id = payment.id
                    order.save()

                    return JsonResponse({"status": "success", "payment_url": approval_url})
                else:
                    # Agar PayPal ki taraf se error aati hai
                    error_msg = payment.error.get('message', 'PayPal payment initilization failed.')
                    return JsonResponse({"status": "error", "message": error_msg}, status=400)

        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)
            
    return JsonResponse({"status": "error", "message": "Method not allowed"}, status=405)

def send_order_email(order):
    """
    Yeh function customer ko successful payment ke baad email bhejega.
    """
    subject = 'Your Kids Learning Workbook is Ready for Download!'
    # Dynamic link banayenge token ka use karke
    download_link = f"{settings.FRONTEND_URL}/thank-you.html?token={order.download_token}"
    
    message = f"""
    Hello {order.name},

    Thank you for purchasing the Ultimate Kids Workbook! Your payment was successful.
    
    You can download your PDF file anytime using the secure link below:
    {download_link}

    Note: Please do not share this link with others.

    If you have any questions, reply to this email.

    Best Regards,
    Kids Workbook Team
    """
    
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [order.email], # Customer ka email
            fail_silently=False,
        )
        print(f"✅ Email successfully sent to {order.email}")
    except Exception as e:
        print(f"❌ Failed to send email to {order.email}. Error: {e}")

@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    event = None

    endpoint_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', '')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        return HttpResponse(status=400) 
    except stripe.error.SignatureVerificationError as e:
        return HttpResponse(status=400) 

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        
        order_id = session.get('metadata', {}).get('order_id')
        if order_id:
            try:
                order = Order.objects.get(id=order_id)
                # Agar order pehle se Completed nahi hai, tabhi aage badho
                if order.payment_status != 'Completed':
                    order.payment_status = 'Completed'
                    order.save()
                    print(f"✅ Stripe Order {order.id} Successfully Completed!")
                    
                    # YAHAN EMAIL BHEJNE WALA FUNCTION CALL KIYA HAI
                    send_order_email(order)
                    
            except Order.DoesNotExist:
                pass 

    return HttpResponse(status=200)
@csrf_exempt
def paypal_webhook(request):
    try:
        payload = json.loads(request.body)
        event_type = payload.get('event_type')

        if event_type == 'PAYMENT.SALE.COMPLETED':
            resource = payload.get('resource', {})
            parent_payment_id = resource.get('parent_payment')

            if parent_payment_id:
                try:
                    order = Order.objects.get(transaction_id=parent_payment_id)
                    # Agar order pehle se Completed nahi hai, tabhi aage badho
                    if order.payment_status != 'Completed':
                        order.payment_status = 'Completed'
                        order.save()
                        print(f"✅ PayPal Order {order.id} Successfully Completed!")
                        
                        # YAHAN EMAIL BHEJNE WALA FUNCTION CALL KIYA HAI
                        send_order_email(order)
                        
                except Order.DoesNotExist:
                    print(f"❌ Order with ID {parent_payment_id} not found.")

        return HttpResponse(status=200)

    except Exception as e:
        print(f"PayPal Webhook Error: {e}")
        return HttpResponse(status=400)
    
    
# ==================== SECURE DOWNLOAD ====================
def secure_download_api(request, token):
    order = get_object_or_404(Order, download_token=token)
    
    # STEP 3: API Ko Secure Karna - Check if payment is really completed
    if order.payment_status != 'Completed':
        return JsonResponse({
            "error": "Access Denied. Aapki payment abhi tak verify nahi hui hai."
        }, status=403)

    filepath = os.path.join(settings.BASE_DIR, 'protected_media', 'books', 'ReadMap.pdf')
    if os.path.exists(filepath):
        return FileResponse(open(filepath, 'rb'), as_attachment=True, filename='Kids_Learning_Workbook.pdf')
    else:
        raise Http404("File not found on server.")