from django.urls import path
from . import views

urlpatterns = [
    path('api/contact/', views.contact_api, name='contact_api'),
    path('api/process-payment/', views.process_real_payment, name='process_payment'),
    path('api/download/<uuid:token>/', views.secure_download_api, name='secure_download_api'),
]