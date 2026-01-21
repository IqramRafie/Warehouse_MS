from rest_framework import serializers
from inventory.models import Product, Supplier

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class InventorySerializer(serializers.ModelSerializer):
    products = ProductSerializer(read_only=True)

    class Meta:

        fields = '__all__'

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

class BulkUploadSerializer(serializers.Serializer):
    file = serializers.FileField()