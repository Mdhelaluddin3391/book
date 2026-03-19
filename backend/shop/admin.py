from django.contrib import admin
from django.contrib import messages
from .models import ContactMessage, Order, Product
from .views import send_order_email  

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'mrp_usd', 'price_usd', 'is_active')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'amount', 'payment_status', 'created_at')
    list_filter = ('payment_status', 'created_at')
    search_fields = ('id' , 'name', 'email', 'transaction_id')
    # manulay gmail send korar lge ikata
    actions = ['manual_resend_email']

    @admin.action(description="Manual: Resend Email with PDF to selected Orders")
    def manual_resend_email(self, request, queryset):
        success_count = 0
        
        for order in queryset:
            try:
                 # orginal mail korb
                send_order_email(order) 
                success_count += 1
            except Exception as e:
                self.message_user(request, f"Error sending email to {order.email}: {str(e)}", level=messages.ERROR)
        
        if success_count > 0:
            self.message_user(request, f"Successfully sent emails to {success_count} customer(s).", level=messages.SUCCESS)

admin.site.register(ContactMessage)