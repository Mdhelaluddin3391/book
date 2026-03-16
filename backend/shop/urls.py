from django.urls import path
from . import views

urlpatterns = [
    path('api/contact/', views.contact_api, name='contact_api'),
    path('api/create-order/', views.create_order_api, name='create_order_api'),
]