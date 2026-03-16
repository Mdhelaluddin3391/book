from django.contrib import admin
from .models import ContactMessage, Order

admin.site.register(ContactMessage)
admin.site.register(Order)