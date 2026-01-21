from rest_framework import serializers
from inbound.models import InboundTransaction

class InboundSerializer(serializers.ModelSerializer):
    class Meta:
        model = InboundTransaction
        fields = '__all__'
        read_only_fields = ('created_by',)

class BulkInboundSerializer(serializers.Serializer):
    file = serializers.FileField()

