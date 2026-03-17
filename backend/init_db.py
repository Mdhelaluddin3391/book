import os
import django

# Django setup initialize karna zaroori hai
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Aap apne admin details yahan set kar sakte hain
USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@example.com')
PASSWORD = os.environ.get('ADMIN_PASSWORD', 'Admin@12345')

# Check karna ki superuser pehle se toh nahi bana hai (taki next time error na aaye)
if not User.objects.filter(username=USERNAME).exists():
    print(f"Creating superuser: {USERNAME}...")
    User.objects.create_superuser(username=USERNAME, email=EMAIL, password=PASSWORD)
    print("Superuser successfully created!")
else:
    print(f"Superuser '{USERNAME}' pehle se maujud hai. Skipping...")