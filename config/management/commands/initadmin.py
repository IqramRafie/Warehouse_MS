__author__ = 'dkarchmer@gmail.com'

from django.conf import settings
from django.core.management.base import BaseCommand
from users.models import User
import os

class Command(BaseCommand):

    def handle(self, *args, **options):
        if not User.objects.filter(is_superuser=True).exists():
            username = os.getenv('DJANGO_SUPERUSER_USERNAME', 'admin')
            email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'admin@gmail.com')
            password = os.getenv('DJANGO_SUPERUSER_PASSWORD', 'admin')
            try:
                admin = User.objects.create_superuser(email=email, username=username, password=password)
                admin.save()
                self.stdout.write(self.style.SUCCESS('Superuser created successfully.'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Failed to create superuser: {e}'))
        else:
            self.stdout.write('Superuser already exists.')