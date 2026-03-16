from django.db import models
from django.core.files.storage import FileSystemStorage
from django.conf import settings
import uuid
import os

protected_storage = FileSystemStorage(location=os.path.join(settings.BASE_DIR, 'protected_media'))



class Product(models.Model):
    name = models.CharField(max_length=200, default="Kids Learning Workbook")
    # FileField mein humne apna secure 'protected_storage' laga diya hai
    pdf_file = models.FileField(upload_to='books/', storage=protected_storage)
    price_inr = models.DecimalField(max_digits=10, decimal_places=2, default=299.00)
    price_usd = models.DecimalField(max_digits=10, decimal_places=2, default=3.99)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
    

class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.name}"

class Order(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Failed', 'Failed'),
    )

    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=3.99) 
    currency = models.CharField(max_length=10, default='USD')
    payment_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    stripe_session_id = models.CharField(max_length=200, blank=True, null=True)
    paypal_order_id = models.CharField(max_length=200, blank=True, null=True)
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True)
    
    download_token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.id} - {self.name} ({self.payment_status})"