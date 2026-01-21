from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


class Supplier(models.Model):
    name = models.CharField(max_length=255)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=100)
    tags = models.JSONField(default=list, blank=True)  # List of tags
    description = models.TextField(blank=True)
    quantity = models.IntegerField(default=0)
    low_stock_threshold = models.IntegerField(default=10)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True)
    is_archived = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.sku} - {self.name}"


class InventoryLog(models.Model):
    ACTION_CHOICES = (
        ("create", "Create"),
        ("update", "Update"),
        ("archive", "Archive"),
        ("adjust", "Adjust"),
    )

    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    quantity_before = models.IntegerField()
    quantity_after = models.IntegerField()
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)


class InventoryBatch(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    batch_number = models.CharField(max_length=100)
    expiry_date = models.DateField()
    quantity = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'batch_number')

    def __str__(self):
        return f"{self.product.name} - Batch {self.batch_number}"
