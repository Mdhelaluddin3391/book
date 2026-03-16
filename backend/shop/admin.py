from django.contrib import admin
from .models import ContactMessage, Order, Product

# Product model ko admin mein register kar rahe hain
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price_inr', 'price_usd', 'is_active')

admin.site.register(ContactMessage)
admin.site.register(Order)