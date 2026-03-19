import json
import os
import logging
import stripe
import paypalrestsdk
from django.core.mail import send_mail
from django.conf import settings
from django.http import JsonResponse, FileResponse, Http404, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from .models import ContactMessage, Order, Product 
from django.core.mail import EmailMultiAlternatives
import os
import threading


logger = logging.getLogger(__name__)

stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')

paypalrestsdk.configure({
    "mode": getattr(settings, 'PAYPAL_MODE', 'sandbox'),  
    "client_id": getattr(settings, 'PAYPAL_CLIENT_ID', ''),
    "client_secret": getattr(settings, 'PAYPAL_SECRET', '')
})

def get_product_details(request):
    products = Product.objects.all()
    
    products_data = []
    for product in products:
        products_data.append({
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "image_url": product.image_url,
            "mrp_usd": product.mrp_usd,
            "price_usd": product.price_usd,
            "is_active": product.is_active
        })
        
    return JsonResponse({"products": products_data})

@csrf_exempt
def contact_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            ContactMessage.objects.create(
                name=data.get('name'), 
                email=data.get('email'), 
                message=data.get('message')
            )
            return JsonResponse({"status": "success", "message": "Aapka message send ho gaya hai!"}, status=201)
        except Exception as e:
            logger.error(f"Contact API Error: {str(e)}")
            return JsonResponse({"status": "error", "message": str(e)}, status=400)
    return JsonResponse({"status": "error", "message": "Method not allowed"}, status=405)


@csrf_exempt
def process_real_payment(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            method = data.get('payment_method', 'Card')
            product_id = data.get('product_id') 
            
            if product_id:
                product = Product.objects.filter(id=product_id, is_active=True).first()
            else:
                product = Product.objects.filter(is_active=True).first()

            if not product:
                return JsonResponse({"status": "error", "message": "Product currently unavailable."}, status=404)

            order = Order.objects.create(
                product=product,
                name=data.get('name'), 
                email=data.get('email'), 
                phone=data.get('phone'), 
                amount=product.price_usd,
                currency='USD',
                payment_method=method,
                payment_status='Pending' 
            )

            if method == 'Card':
                checkout_session = stripe.checkout.Session.create(
                    payment_method_types=['card'],
                    line_items=[{
                        'price_data': {
                            'currency': 'usd',
                            'product_data': {
                                'name': product.name,
                            },
                            'unit_amount': int(product.price_usd * 100), 
                        },
                        'quantity': 1,
                    }],
                    mode='payment',
                    success_url=f"{settings.FRONTEND_URL}/thank-you.html?token={order.download_token}&orderId={order.id}",
                    cancel_url=f"{settings.FRONTEND_URL}/checkout.html",
                    metadata={
                        'order_id': str(order.id)
                    }
                )
                
                order.transaction_id = checkout_session.id
                order.save()

                return JsonResponse({"status": "success", "payment_url": checkout_session.url})

            elif method == 'PayPal':
                usd_amount = str(product.price_usd)
                
                payment = paypalrestsdk.Payment({
                    "intent": "sale",
                    "payer": {
                        "payment_method": "paypal"
                    },
                    "redirect_urls": {
                        "return_url": f"{settings.FRONTEND_URL}/thank-you.html?token={order.download_token}&orderId={order.id}",
                        "cancel_url": f"{settings.FRONTEND_URL}/checkout.html"
                    },
                    "transactions": [{
                        "item_list": {
                            "items": [{
                                "name": product.name,
                                "sku": f"product_{product.id}",
                                "price": usd_amount,
                                "currency": "USD",
                                "quantity": 1
                            }]
                        },
                        "amount": {
                            "total": usd_amount,
                            "currency": "USD"
                        },
                        "description": f"{product.name} PDF Purchase"
                    }]
                })

                if payment.create():
                    approval_url = None
                    for link in payment.links:
                        if link.rel == "approval_url":
                            approval_url = str(link.href)
                            break
                    
                    order.transaction_id = payment.id
                    order.save()

                    return JsonResponse({"status": "success", "payment_url": approval_url})
                else:
                    error_msg = payment.error.get('message', 'PayPal payment initialization failed.')
                    logger.error(f"PayPal Init Error: {payment.error}")
                    return JsonResponse({"status": "error", "message": error_msg}, status=400)

        except Exception as e:
            logger.error(f"Payment Processing Error: {str(e)}")
            return JsonResponse({"status": "error", "message": str(e)}, status=400)
            
    return JsonResponse({"status": "error", "message": "Method not allowed"}, status=405)

def send_order_email(order):
    """
    Customer ko successful payment ke baad ek professional HTML email bhejta hai aur PDF attach karta hai.
    """
    subject = f'Order #{order.id} Confirmed: Your {order.product.name} is Ready!'
    download_link = f"{settings.FRONTEND_URL}/thank-you.html?token={order.download_token}&orderId={order.id}"
    
    html_message = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <div style="background-color: #2C3E50; padding: 20px; text-align: center; border-bottom: 4px solid #E74C3C;">
                <h1 style="color: #F1C40F; margin: 0; font-size: 24px;"> {order.product.name}</h1>
            </div>
            <div style="padding: 30px; color: #333333;">
                <h2 style="color: #2C3E50; font-size: 20px;">Hello {order.name},</h2>
                <p style="font-size: 16px; line-height: 1.6;">Thank you for your purchase! Your payment was successful.</p>
                
                <p style="font-size: 18px; font-weight: bold; color: #E74C3C; background: #f8f9fa; padding: 12px; border-radius: 5px; text-align: center; border: 1px dashed #E74C3C;">
                    Your Order ID: #{order.id}
                </p>

                <p style="font-size: 16px; line-height: 1.6;">We have attached your Workbook to this email. You can also click the button below to download it:</p>
                <div style="text-align: center; margin: 35px 0;">
                    <a href="{download_link}" style="background-color: #E74C3C; color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 5px; font-size: 18px; font-weight: bold; display: inline-block;"> Download Workbook Now</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

    plain_message = f"""
    Hello {order.name},
    
    Thank you for your purchase! 
    Your Order ID is: #{order.id}
    
    Your {order.product.name} is ready. We have attached the PDF to this email. 
    You can also download your workbook here: {download_link}
    
    Need help? Just reply to this email and mention your Order ID.
    """
    
    try:
        # emil crate
        msg = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[order.email]
        )
        
        # style add
        msg.attach_alternative(html_message, "text/html")
        
        # pdf add
        if order.product and order.product.pdf_file:
            pdf_path = order.product.pdf_file.path
            if os.path.exists(pdf_path):
                msg.attach_file(pdf_path)
            else:
                logger.warning(f"PDF attachment failed: File not found at {pdf_path}")

        # send
        msg.send(fail_silently=False)
        logger.info(f"HTML Email with PDF successfully sent to {order.email}")
        
    except Exception as e:
        logger.error(f"Failed to send HTML email to {order.email}. Error: {str(e)}")
        raise e 

@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', '')

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except ValueError as e:
        logger.error("Stripe Webhook Error: Invalid payload")
        return HttpResponse(status=400) 
    except stripe.error.SignatureVerificationError as e:
        logger.error("Stripe Webhook Error: Invalid signature")
        return HttpResponse(status=400) 

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        order_id = session.get('metadata', {}).get('order_id')
        
        if order_id:
            try:
                order = Order.objects.get(id=order_id)
                if order.payment_status != 'Completed':
                    order.payment_status = 'Completed'
                    order.save()
                    logger.info(f"Stripe Order {order.id} Successfully Completed!")
                    
                    email_thread = threading.Thread(target=send_order_email, args=(order,))
                    email_thread.start()
                    
            except Order.DoesNotExist:
                logger.warning(f"Stripe Webhook: Order {order_id} not found.")

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
                    if order.payment_status != 'Completed':
                        order.payment_status = 'Completed'
                        order.save()
                        logger.info(f"PayPal Order {order.id} Successfully Completed!")
                        send_order_email(order) 
                except Order.DoesNotExist:
                    logger.warning(f"PayPal Webhook: Order with transaction ID {parent_payment_id} not found.")

        return HttpResponse(status=200)

    except Exception as e:
        logger.error(f"PayPal Webhook Error: {str(e)}")
        return HttpResponse(status=400)
    
def secure_download_api(request, token):
    order = get_object_or_404(Order, download_token=token)
    
    if order.payment_status != 'Completed':
        return JsonResponse({
            "error": "Access Denied. Aapki payment abhi tak verify nahi hui hai."
        }, status=403)

    product = order.product
    if not product or not product.pdf_file:
        raise Http404("Product ya uski file database mein nahi mili.")
    
    filepath = product.pdf_file.path

    if os.path.exists(filepath):
        safe_filename = product.name.replace(" ", "_") + ".pdf"
        return FileResponse(open(filepath, 'rb'), as_attachment=True, filename=safe_filename)
    else:
        logger.error(f"File missing on server: {filepath}")
        raise Http404(f"File server par nahi mili! Path check karein: {filepath}")
    
@csrf_exempt
def execute_paypal_payment(request):
    if request.method == 'OPTIONS':
        return JsonResponse({'status': 'ok'})

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            payment_id = data.get('paymentId')
            payer_id = data.get('PayerID')
            token = data.get('token')
            
            payment = paypalrestsdk.Payment.find(payment_id)
            
            if payment.execute({"payer_id": payer_id}):
                order = get_object_or_404(Order, download_token=token)
                
                if order.payment_status != 'Completed':
                    order.payment_status = 'Completed'
                    order.save()
                    print(f"PayPal Order {order.id} Successfully Executed & Completed!")
                    email_thread = threading.Thread(target=send_order_email, args=(order,))
                    email_thread.start()
                    
                return JsonResponse({"status": "success"})
            else:
                print(f"PayPal Execute Error: {payment.error}")
                return JsonResponse({"status": "error", "message": "Payment execution failed."})
                
        except Exception as e:
            print(f"Execute PayPal Exception: {str(e)}")
            return JsonResponse({"status": "error", "message": str(e)})
            
    return JsonResponse({"status": "error", "message": "Method not allowed"}, status=405)