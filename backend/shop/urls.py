from django.urls import path
from . import views

urlpatterns = [
    path('api/contact/', views.contact_api, name='contact_api'),
    path('api/create-stripe-checkout/', views.create_stripe_checkout, name='create_stripe_checkout'),
    path('api/create-order/', views.create_order_api, name='create_order_api'),
    path('api/download/<uuid:token>/', views.secure_download_api, name='secure_download_api'),
]