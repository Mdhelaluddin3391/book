from django.contrib import admin
from django.contrib import messages
from .models import ContactMessage, Order, Product
from .views import send_order_email  

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'mrp_usd', 'price_usd', 'is_active')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    # Admin panel mein yeh columns dikhenge
    list_display = ('id', 'name', 'email', 'amount', 'payment_status', 'created_at')
    
    # Filter aur search box add kar rahe hain taki user asani se mil jaye
    list_filter = ('payment_status', 'created_at')
    search_fields = ('name', 'email', 'transaction_id')
    
    # Naya manual action add kar rahe hain
    actions = ['manual_resend_email']

    @admin.action(description="Manual: Resend Email with PDF to selected Orders")
    def manual_resend_email(self, request, queryset):
        success_count = 0
        
        for order in queryset:
            try:
                send_order_email(order)  # Email bhejne wala function call kiya
                success_count += 1
            except Exception as e:
                # Agar kisi ek ko bhejne mein error aayi toh admin panel mein error show karega
                self.message_user(request, f"Error sending email to {order.email}: {str(e)}", level=messages.ERROR)
        
        if success_count > 0:
            # Success message show karega
            self.message_user(request, f"Successfully sent emails to {success_count} customer(s).", level=messages.SUCCESS)

admin.site.register(ContactMessage)