from django.urls import path
from . import views

urlpatterns = [
    path('api/contact/', views.contact_api, name='contact_api'),
    path('api/process-payment/', views.process_real_payment, name='process_payment'),
    path('api/execute-paypal/', views.execute_paypal_payment, name='execute_paypal'),
    path('api/webhook/stripe/', views.stripe_webhook, name='stripe_webhook'),
    path('api/webhook/paypal/', views.paypal_webhook, name='paypal_webhook'),
    path('api/download/<uuid:token>/', views.secure_download_api, name='secure_download_api'),
    path('api/product-details/', views.get_product_details, name='product_details'),
]