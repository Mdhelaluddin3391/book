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

stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')

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
                    # Payment success hone par seedha Thank You page par token ke sath bhejein
                    success_url=f"{settings.FRONTEND_URL}/thank-you.html?token={order.download_token}",
                    cancel_url=f"{settings.FRONTEND_URL}/checkout.html",
                )
                
                # Transaction ID save karein
                order.transaction_id = checkout_session.id
                order.save()

                return JsonResponse({"status": "success", "payment_url": checkout_session.url})

            # 3. Agar user ne 'PayPal' select kiya hai
            elif method == 'PayPal':
                # PayPal ke liye aapko PayPal REST SDK integrate karna hoga.
                # Abhi ke liye hum ek dummy URL bhej rahe hain structure dikhane ke liye.
                paypal_payment_url = "https://www.sandbox.paypal.com/checkoutnow?token=dummy_token"
                return JsonResponse({"status": "success", "payment_url": paypal_payment_url})

        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)
            
    return JsonResponse({"status": "error", "message": "Method not allowed"}, status=405)



# ==================== SECURE DOWNLOAD ====================
def secure_download_api(request, token):
    order = get_object_or_404(Order, download_token=token)
    if order.payment_status != 'Completed':
        raise Http404("Payment pending or failed. Aap abhi file download nahi kar sakte.")

    filepath = os.path.join(settings.BASE_DIR, 'protected_media', 'books', 'ReadMap.pdf')
    if os.path.exists(filepath):
        return FileResponse(open(filepath, 'rb'), as_attachment=True, filename='Kids_Learning_Workbook.pdf')
    else:
        raise Http404("File not found on server.")