from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import ContactMessage, Order
import json

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