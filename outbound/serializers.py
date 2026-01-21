from rest_framework import serializers
from outbound.models import OutboundTransaction

class OutboundSerializer(serializers.ModelSerializer):
    class Meta:
        model = OutboundTransaction
        fields = '__all__'
        read_only_fields = ('created_by',)

class BulkOutboundSerializer(serializers.Serializer):
    file = serializers.FileField()
