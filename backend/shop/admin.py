from django.contrib import admin
from django.contrib import messages
from django.db.models import Sum
from .models import ContactMessage, Order, Product
from .views import send_order_email

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'mrp_usd', 'price_usd', 'is_active')
    search_fields = ('name', 'description')
    list_filter = ('is_active',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'name',  'email', 'product', 'amount', 'payment_status', 'transaction_id', 'created_at')
    
    list_filter = ('payment_status', 'created_at', 'product')
    
    date_hierarchy = 'created_at'
    
    search_fields = ('id', 'name', 'email', 'transaction_id', 'product__name')
    
    readonly_fields = ('download_token', 'created_at', 'download_count')
    
    fieldsets = (
        ('Customer Details', {
            'fields': ('name', 'email')
        }),
        ('Order & Payment Details', {
            'fields': ('product', 'amount', 'currency', 'payment_status', 'payment_method', 'transaction_id')
        }),
        ('System Information', {
            'fields': ('download_token', 'download_count', 'created_at'),
            'classes': ('collapse',) 
        }),
    )

    actions = ['manual_resend_email', 'mark_as_completed']

    @admin.action(description="Manual: Resend Email with PDF to selected Orders")
    def manual_resend_email(self, request, queryset):
        success_count = 0
        for order in queryset:
            try:
                send_order_email(order) 
                success_count += 1
            except Exception as e:
                self.message_user(request, f"Error sending email to {order.email}: {str(e)}", level=messages.ERROR)
        
        if success_count > 0:
            self.message_user(request, f"Successfully sent emails to {success_count} customer(s).", level=messages.SUCCESS)

    @admin.action(description="Mark selected orders as Completed")
    def mark_as_completed(self, request, queryset):
        updated = queryset.update(payment_status='Completed')
        self.message_user(request, f"{updated} order(s) successfully marked as Completed.", level=messages.SUCCESS)

    def changelist_view(self, request, extra_context=None):
        response = super().changelist_view(request, extra_context=extra_context)
        
        try:
            qs = response.context_data['cl'].queryset
            
            completed_orders = qs.filter(payment_status='Completed')
            total_sales = completed_orders.aggregate(Sum('amount'))['amount__sum'] or 0.00
            total_orders_count = completed_orders.count()
            
            messages.info(request, f"SALES SUMMARY (For Current View): Total Completed Orders: {total_orders_count} | Total Revenue: ${total_sales:.2f}")
        except (AttributeError, KeyError):
            pass
            
        return response

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'created_at')
    search_fields = ('name', 'email', 'message')
    list_filter = ('created_at',)
    readonly_fields = ('name', 'email', 'message', 'created_at')