from rest_framework import serializers
from .models import Payment
from bookings.serializers import BookingSerializer

class PaymentSerializer(serializers.ModelSerializer):
    booking = BookingSerializer(read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ('id', 'transaction_id', 'status', 'raw_response', 
                          'created_at', 'updated_at')


class PaymentCreateSerializer(serializers.Serializer):
    booking_id = serializers.UUIDField()
    provider = serializers.ChoiceField(choices=['stripe', 'bkash'])
    currency = serializers.CharField(default='USD', max_length=3)
    
    def validate_provider(self, value):
        if value.lower() not in ['stripe', 'bkash']:
            raise serializers.ValidationError("Invalid payment provider")
        return value.lower()