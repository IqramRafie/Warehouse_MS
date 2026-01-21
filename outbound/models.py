from django.db import models
from inventory.models import Product
from users.models import User

class OutboundTransaction(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    customer = models.CharField(max_length=255)
    so_reference = models.CharField(max_length=100)
    dispatched_date = models.DateField()
    batch_number = models.CharField(max_length=100, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    ref_document = models.FileField(upload_to="outbound_docs/", null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    