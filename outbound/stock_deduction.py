from django.db import transaction
from rest_framework.exceptions import ValidationError
from apps.inventory.models import Inventory

@transaction.atomic
def process_outbound(product, quantity):
    inventory = Inventory.objects.select_for_update().get(product=product)

    if inventory.quantity < quantity:
        raise ValidationError('Insufficient stock')

    inventory.quantity -= quantity
    inventory.save()