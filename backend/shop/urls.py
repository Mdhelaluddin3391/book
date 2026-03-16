from django.urls import path
from . import views

urlpatterns = [
    path('api/contact/', views.contact_api, name='contact_api'),
    path('api/create-razorpay-order/', views.create_razorpay_order, name='create_razorpay_order'),
    path('api/verify-razorpay/', views.verify_razorpay, name='verify_razorpay'),
    path('api/create-stripe-checkout/', views.create_stripe_checkout, name='create_stripe_checkout'),
    path('api/verify-stripe/', views.verify_stripe, name='verify_stripe'),
    path('api/verify-paypal/', views.verify_paypal, name='verify_paypal'),
    path('api/download/<uuid:token>/', views.secure_download_api, name='secure_download_api'),
]