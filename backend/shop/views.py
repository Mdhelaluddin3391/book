import json, os, stripe, razorpay, requests
from django.http import JsonResponse, FileResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import ContactMessage, Order

# --- API KEYS (Inhe baad mein .env file mein daal lena) ---
stripe.api_key = "sk_test_Aapki_Stripe_Secret_Key"
RAZORPAY_KEY_ID = "rzp_test_Aapki_Razorpay_Key"
RAZORPAY_KEY_SECRET = "Aapki_Razorpay_Secret"
PAYPAL_CLIENT_ID = "Aapki_PayPal_Client_ID"
PAYPAL_SECRET = "Aapki_PayPal_Secret"

# Initialize Razorpay Client
rzp_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

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


# ==================== RAZORPAY ====================
@csrf_exempt
def create_razorpay_order(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            # Order DB mein Pending create karein
            order = Order.objects.create(
                name=data.get('name'), email=data.get('email'), phone=data.get('phone'), 
                amount=299.00, currency='INR', payment_method='Razorpay'
            )
            # Razorpay API par order create karein
            rzp_order = rzp_client.order.create({
                "amount": int(order.amount * 100), # Paise mein
                "currency": "INR",
                "receipt": str(order.id)
            })
            order.razorpay_order_id = rzp_order['id']
            order.save()

            return JsonResponse({
                "status": "success", "order_id": rzp_order['id'], "db_order_id": order.id, "token": order.download_token
            })
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)

@csrf_exempt
def verify_razorpay(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            # Signature verify karein
            rzp_client.utility.verify_payment_signature({
                'razorpay_order_id': data.get('razorpay_order_id'),
                'razorpay_payment_id': data.get('razorpay_payment_id'),
                'razorpay_signature': data.get('razorpay_signature')
            })
            # Agar error nahi aayi, toh payment asli hai
            order = Order.objects.get(razorpay_order_id=data.get('razorpay_order_id'))
            order.payment_status = 'Completed'
            order.save()
            return JsonResponse({"status": "success"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": "Payment Verification Failed!"}, status=400)


# ==================== STRIPE ====================
@csrf_exempt
def create_stripe_checkout(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            order = Order.objects.create(
                name=data.get('name'), email=data.get('email'), phone=data.get('phone'), 
                amount=3.99, currency='USD', payment_method='Stripe'
            )
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {'name': 'Kids Learning Workbook (Digital PDF)'},
                        'unit_amount': 399, 
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=f"http://127.0.0.1:5500/frontend/thank-you.html?session_id={{CHECKOUT_SESSION_ID}}&token={order.download_token}",
                cancel_url="http://127.0.0.1:5500/frontend/checkout.html",
            )
            order.stripe_session_id = session.id
            order.save()
            return JsonResponse({'id': session.id})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def verify_stripe(request):
    # Jab user thank you page par aayega toh wahan se ye API call hogi verification ke liye
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            session_id = data.get('session_id')
            session = stripe.checkout.Session.retrieve(session_id)
            
            if session.payment_status == 'paid':
                order = Order.objects.get(stripe_session_id=session_id)
                order.payment_status = 'Completed'
                order.save()
                return JsonResponse({"status": "success"})
            return JsonResponse({"status": "error", "message": "Payment not completed"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)


# ==================== PAYPAL ====================
@csrf_exempt
def verify_paypal(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            order = Order.objects.create(
                name=data.get('name'), email=data.get('email'), phone=data.get('phone'), 
                amount=3.99, currency='USD', payment_method='PayPal', paypal_order_id=data.get('paypal_order_id'),
                payment_status='Completed' # Frontend PayPal SDK ne already verify kar diya hai 
            )
            return JsonResponse({"status": "success", "token": order.download_token})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)


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