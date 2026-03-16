import json, os
from django.http import JsonResponse, FileResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import ContactMessage, Order
import stripe
import json
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Order
import json, os
from django.http import JsonResponse, FileResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import ContactMessage, Order
import stripe
import paypalrestsdk



stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')

paypalrestsdk.configure({
    "mode": "sandbox",  # Jab aap live jayenge tab isko "live" kar dijiyega
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
            
            # 1. Order create karein (Status Pending rahega)
            order = Order.objects.create(
                name=data.get('name'), 
                email=data.get('email'), 
                phone=data.get('phone'), 
                amount=299.00, 
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
                                'name': 'Ultimate Kids Workbook (PDF)',
                            },
                            'unit_amount': 29900, # Paise mein hota hai (299.00 * 100)
                        },
                        'quantity': 1,
                    }],
                    mode='payment',
                    success_url=f"{settings.FRONTEND_URL}/thank-you.html?token={order.download_token}",
                    cancel_url=f"{settings.FRONTEND_URL}/checkout.html",
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




# ==================== SECURE DOWNLOAD ====================
def secure_download_api(request, token):
    order = get_object_or_404(Order, download_token=token)
    
    # Optional: Yahan aap verify kar sakte hain ki payment success hui hai ya nahi using API. 
    # Abhi hum maan rahe hain ki agar user thank-you page par aaya hai, to success hai.
    # Lekin strictly speaking, PayPal IPN ya Webhook se status 'Completed' karna best practice hai.

    filepath = os.path.join(settings.BASE_DIR, 'protected_media', 'books', 'ReadMap.pdf')
    if os.path.exists(filepath):
        return FileResponse(open(filepath, 'rb'), as_attachment=True, filename='Kids_Learning_Workbook.pdf')
    else:
        raise Http404("File not found on server.")