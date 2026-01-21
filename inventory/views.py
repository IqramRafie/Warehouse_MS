from rest_framework.viewsets import ModelViewSet
from inventory.models import Product, Supplier
from inventory.serializers import ProductSerializer, SupplierSerializer, BulkUploadSerializer
from users.permissions import IsOperator
from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter

import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from audit.utils import log_action

class ProductViewSet(ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsOperator]
    filter_backends = []
    filterset_fields = []
    search_fields = []

class SupplierViewSet(ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsOperator]

class BulkProductUploadView(APIView):
    permission_classes = [IsOperator]

    def post(self, request):
        serializer = BulkUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file = serializer.validated_data['file']

        if file.name.endswith('.csv'):
            df = pd.read_csv(file)
        elif file.name.endswith('.xlsx'):
            df = pd.read_excel(file)
        else:
            return Response(
                {"error": "File type not supported."},
                status=status.HTTP_400_BAD_REQUEST
            )

        created = 0

        for _, row in df.iterrows():
            product, is_new = Product.objects.get_or_create(
                sku=row['sku'],
                defaults={
                    'name': row['name'],
                    'category': row['category'],
                    'description': row.get('description', ''),
                    'low_stock_threshold': row.get('low_stock_threshold', 10),
                }
            )

            if is_new:
                created += 1

        log_action(
            request.user,
            'BULK_PRODUCT_UPLOAD',
            'Product',
            created
        )

        return Response(
            {"created_products": created},
            status=status.HTTP_201_CREATED
        )

class LowStockAlertView(APIView):
    permission_classes = [IsOperator]

    def get(self, request):
        alerts = Product.objects.filter(
            quantity__lte=models.F('low_stock_threshold')
        )

        data = [
            {
                'sku': product.sku,
                'name': product.name,
                'quantity': product.quantity,
                'threshold': product.low_stock_threshold,
            }
            for product in alerts
        ]

        return  Response(data)