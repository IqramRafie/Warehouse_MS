from django.db import models
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from users.permissions import IsOperator
from inventory.models import Product
from inbound.models import InboundTransaction
from outbound.models import OutboundTransaction
from audit.models import AuditLog

class DashboardSummaryView(APIView):
    permission_classes = [IsOperator]

    def get(self, request):
        total_products = Product.objects.count()

        total_inventory = (
            Product.objects.aggregate(
                total=models.Sum('quantity')
            )['total'] or 0
        )

        low_stock_items = Product.objects.filter(
            quantity__lte=models.F('low_stock_threshold')
        ).count()

        today = timezone.now().date()

        inbound_today = InboundTransaction.objects.filter(receive_date=today).count()
        outbound_today = OutboundTransaction.objects.filter(dispatched_date=today).count()

        # Recent activity feed
        recent_activities = AuditLog.objects.order_by('-timestamp')[:10].values(
            'user__username', 'action', 'entity', 'timestamp', 'details'
        )

        # Daily transaction volume (last 7 days)
        transaction_volume = []
        for i in range(7):
            day = today - timezone.timedelta(days=i)
            inbound_count = InboundTransaction.objects.filter(receive_date=day).aggregate(models.Sum('quantity'))['quantity__sum'] or 0
            outbound_count = OutboundTransaction.objects.filter(dispatched_date=day).aggregate(models.Sum('quantity'))['quantity__sum'] or 0
            transaction_volume.append({
                'date': day.isoformat(),
                'inbound': inbound_count,
                'outbound': outbound_count,
            })

        return Response({
            'total_products': total_products,
            'total_inventory': total_inventory,
            'low_stock_items': low_stock_items,
            'inbound_today': inbound_today,
            'outbound_today': outbound_today,
            'recent_activities': list(recent_activities),
            'transaction_volume': transaction_volume,
        })