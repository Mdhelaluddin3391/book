from django.db import models
from django.core.files.storage import FileSystemStorage
from django.conf import settings
import uuid
import os

PROTECTED_MEDIA_ROOT = os.path.join(settings.BASE_DIR, 'protected_media')
protected_storage = FileSystemStorage(location=PROTECTED_MEDIA_ROOT)

class Product(models.Model):
    name = models.CharField(max_length=200, default="Kids Learning Workbook")
    pdf_file = models.FileField(upload_to='books/', storage=protected_storage)
    description = models.TextField(default="500+ pages of logic activities for ages 3-8.", blank=True)
    image_url = models.URLField(default="https://crevvo.com/wp-content/uploads/2024/02/14000-Kids-Worksheets.webp", blank=True)
    mrp_usd = models.DecimalField(max_digits=10, decimal_places=2, default=25.00) 
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
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    # phone = models.CharField(max_length=15)
    
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=3.99) 
    currency = models.CharField(max_length=10, default='USD')
    payment_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    transaction_id = models.CharField(max_length=255, blank=True, null=True)
    
    download_token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    download_count = models.IntegerField(default=0)
    MAX_DOWNLOADS = 3

    def __str__(self):
        return f"Order {self.id} - {self.name} ({self.payment_status})"