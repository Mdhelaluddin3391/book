from django.contrib import admin
from .models import ContactMessage, Order, Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'mrp_usd', 'price_usd', 'is_active')

admin.site.register(ContactMessage)
admin.site.register(Order)