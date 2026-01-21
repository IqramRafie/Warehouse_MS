from rest_framework.viewsets import ModelViewSet
from django.db import transaction
from inbound.models import InboundTransaction
from inbound.serializers import InboundSerializer
from inventory.models import Product, InventoryLog, Supplier, InventoryBatch
from users.permissions import IsOperator
from audit.utils import log_action
from inventory.utils import check_low_stock
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from inbound.serializers import BulkInboundSerializer
import pandas as pd

class InboundViewSet(ModelViewSet):
    queryset = InboundTransaction.objects.all()
    serializer_class = InboundSerializer
    permission_classes = [IsOperator]

    @transaction.atomic
    def perform_create(self, serializer):
        inbound = serializer.save(created_by=self.request.user)
        product = inbound.product
        quantity_before = product.quantity
        product.quantity += inbound.quantity
        product.save()

        # Create batch if provided
        if inbound.batch_number and inbound.expiry_date:
            InventoryBatch.objects.create(
                product=product,
                batch_number=inbound.batch_number,
                expiry_date=inbound.expiry_date,
                quantity=inbound.quantity
            )

        # Log inventory change
        InventoryLog.objects.create(
            product=product,
            action='adjust',
            quantity_before=quantity_before,
            quantity_after=product.quantity,
            performed_by=self.request.user
        )

        check_low_stock(product, self.request.user)

        log_action(
            self.request.user,
            'INBOUND_CREATE',
            'InboundTransaction',
            inbound.id
        )

class BulkInboundUploadView(APIView):
    permission_classes = [IsOperator]

    def post(self, request):
        serializer = BulkInboundSerializer(data=request.data)
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
            try:
                product = Product.objects.get(sku=row['product_sku'])
                supplier, _ = Supplier.objects.get_or_create(name=row['supplier_name'])
                inbound = InboundTransaction.objects.create(
                    product=product,
                    quantity=row['quantity'],
                    supplier=supplier,
                    receive_date=row['receive_date'],
                    created_by=request.user
                )

                # Update inventory
                quantity_before = product.quantity
                product.quantity += inbound.quantity
                product.save()

                InventoryLog.objects.create(
                    product=product,
                    action='adjust',
                    quantity_before=quantity_before,
                    quantity_after=product.quantity,
                    performed_by=request.user
                )

                check_low_stock(product, request.user)
                created += 1

            except Product.DoesNotExist:
                continue  # Skip invalid

        log_action(
            request.user,
            'BULK_INBOUND_UPLOAD',
            'InboundTransaction',
            created
        )

        return Response(
            {"created_inbounds": created},
            status=status.HTTP_201_CREATED
        )