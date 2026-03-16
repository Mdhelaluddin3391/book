from django.http import JsonResponse, FileResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import ContactMessage, Order
import json
import os
import stripe

# Aapki Stripe ki SECRET KEY yahan aayegi (Abhi ke liye test key use karein)
stripe.api_key = "sk_test_Aapki_Stripe_Secret_Key_Yahan_Dalein"
# Contact Us form ka data save karne ke liye API
@csrf_exempt
def contact_api(request):
    if request.method == 'POST':
        try:
            # Frontend se aaya hua JSON data read karna
            data = json.loads(request.body)
            name = data.get('name')
            email = data.get('email')
            message = data.get('message')

            # Database mein save karna
            ContactMessage.objects.create(name=name, email=email, message=message)
            
            return JsonResponse({"status": "success", "message": "Aapka message send ho gaya hai!"}, status=201)
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)
            
    return JsonResponse({"status": "error", "message": "Only POST requests are allowed"}, status=405)

# Checkout form ka data save karne ke liye API
@csrf_exempt
def create_order_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name')
            email = data.get('email')
            phone = data.get('phone')

            # Order ko database mein 'Pending' status ke sath save karna
            order = Order.objects.create(name=name, email=email, phone=phone, amount=299.00)
            
            # Note: Next step mein hum yahan Razorpay (Payment Gateway) ka code add karenge
            return JsonResponse({
                "status": "success", 
                "message": "Order created successfully!", 
                "order_id": order.id
            }, status=201)
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)

    return JsonResponse({"status": "error", "message": "Only POST requests are allowed"}, status=405)
@csrf_exempt
def create_stripe_checkout(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name')
            email = data.get('email')
            phone = data.get('phone')

            # 1. Database mein Pending order save karein
            order = Order.objects.create(
                name=name, email=email, phone=phone, 
                amount=3.99, currency='USD', payment_method='Stripe'
            )

            # 2. Stripe Checkout Session create karein
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': 'Kids Learning Workbook (Digital PDF)',
                        },
                        'unit_amount': 399, # Note: Stripe mein amount cents mein hota hai (399 = $3.99)
                    },
                    'quantity': 1,
                }],
                mode='payment',
                # Payment successful hone par user kahan jayega:
                success_url=f"http://127.0.0.1:5500/frontend/thank-you.html?session_id={{CHECKOUT_SESSION_ID}}&token={order.download_token}",
                # Payment cancel hone par:
                cancel_url="http://127.0.0.1:5500/frontend/checkout.html",
            )

            # 3. Session ID ko order mein save kar lein
            order.stripe_session_id = session.id
            order.save()

            # Frontend ko session id bhej dein
            return JsonResponse({'id': session.id})
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Only POST requests are allowed"}, status=405)



def secure_download_api(request, token):
    # Token ke basis par order find karo
    order = get_object_or_404(Order, download_token=token)

    # SECURE CHECK: Check karo ki payment 'Completed' hai ya nahi
    if order.payment_status != 'Completed':
        raise Http404("Payment pending or failed. Aap abhi file download nahi kar sakte.")

    # File ka path find karo
    filepath = os.path.join(settings.BASE_DIR, 'protected_media', 'kids_workbook.pdf')
    
    # Agar file exist karti hai toh secure tarike se return karo
    if os.path.exists(filepath):
        # FileResponse Django ka built-in function hai secure file serving ke liye
        return FileResponse(open(filepath, 'rb'), as_attachment=True, filename='Kids_Learning_Workbook.pdf')
    else:
        raise Http404("File not found on server.")