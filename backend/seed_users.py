import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "server.settings")
django.setup()

from api.models import CustomUser

users_to_create = [
    {'username': 'manager', 'email': 'manager@example.com', 'role': 'manager', 'password': 'password123'},
    {'username': 'dispatcher', 'email': 'dispatcher@example.com', 'role': 'dispatcher', 'password': 'password123'},
    {'username': 'driver', 'email': 'driver@example.com', 'role': 'driver', 'password': 'password123'},
    {'username': 'customer', 'email': 'customer@example.com', 'role': 'customer', 'password': 'password123'},
]

for user_data in users_to_create:
    if not CustomUser.objects.filter(username=user_data['username']).exists():
        CustomUser.objects.create_user(**user_data)
        print(f"Created {user_data['role']}: {user_data['username']}")
    else:
        user = CustomUser.objects.get(username=user_data['username'])
        user.set_password(user_data['password'])
        user.role = user_data['role']
        user.save()
        print(f"Updated {user_data['username']} password and role")
