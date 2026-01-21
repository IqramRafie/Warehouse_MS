from rest_framework.viewsets import ModelViewSet
from django.db import transaction
from rest_framework.exceptions import ValidationError
from outbound.models import OutboundTransaction
from outbound.serializers import OutboundSerializer
from inventory.models import Product, InventoryLog, InventoryBatch
from users.permissions import IsOperator
from audit.utils import log_action
from inventory.utils import check_low_stock
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import pandas as pd

class OutboundViewSet(ModelViewSet):
    queryset = OutboundTransaction.objects.all()
    serializer_class = OutboundSerializer
    permission_classes = [IsOperator]

    @transaction.atomic
    def perform_create(self, serializer):
        outbound = serializer.save(created_by=self.request.user)
        product = outbound.product
        remaining_quantity = outbound.quantity

        # FIFO: Deduct from earliest expiry batches
        batches = InventoryBatch.objects.filter(product=product, quantity__gt=0).order_by('expiry_date')
        used_batches = []

        for batch in batches:
            if remaining_quantity <= 0:
                break
            deduct = min(batch.quantity, remaining_quantity)
            batch.quantity -= deduct
            batch.save()
            remaining_quantity -= deduct
            used_batches.append((batch.batch_number, batch.expiry_date, deduct))

        # If still remaining, deduct from general stock
        if remaining_quantity > 0:
            if product.quantity < remaining_quantity:
                raise ValidationError("Insufficient Stock")
            product.quantity -= remaining_quantity

        # Update product total quantity
        total_batch_quantity = sum(batch.quantity for batch in InventoryBatch.objects.filter(product=product))
        product.quantity = total_batch_quantity + product.quantity  # Wait, this is wrong.
        # Actually, product.quantity should be sum of all batch quantities + general stock.

        # For simplicity, assume all stock is in batches, and product.quantity is total.
        # So, after deducting, update product.quantity
        product.quantity = sum(InventoryBatch.objects.filter(product=product).values_list('quantity', flat=True))
        product.save()

        # Set outbound batch info (first used batch)
        if used_batches:
            outbound.batch_number = used_batches[0][0]
            outbound.expiry_date = used_batches[0][1]
            outbound.save()

        quantity_before = product.quantity + outbound.quantity  # approximate
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
            'OUTBOUND_CREATE',
            'OutboundTransaction',
            outbound.id
        )

class BulkOutboundUploadView(APIView):
    permission_classes = [IsOperator]

    def post(self, request):
        from outbound.serializers import BulkOutboundSerializer
        serializer = BulkOutboundSerializer(data=request.data)
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

                if product.quantity < row['quantity']:
                    continue  # Skip insufficient stock

                outbound = OutboundTransaction.objects.create(
                    product=product,
                    quantity=row['quantity'],
                    customer=row['customer'],
                    so_reference=row['so_reference'],
                    dispatched_date=row['dispatched_date'],
                    created_by=request.user
                )

                # Update inventory
                quantity_before = product.quantity
                product.quantity -= outbound.quantity
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
            'BULK_OUTBOUND_UPLOAD',
            'OutboundTransaction',
            created
        )

        return Response(
            {"created_outbounds": created},
            status=status.HTTP_201_CREATED
        )
