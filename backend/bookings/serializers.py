from rest_framework import serializers
from .models import Booking
from properties.serializers import PropertyListSerializer
from users.serializers import UserSerializer

class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ('property', 'visit_date', 'visit_time', 'notes')
    
    def validate(self, attrs):
        property_obj = attrs.get('property')
        visit_date = attrs.get('visit_date')
        
        # Check property availability
        if not property_obj.is_available():
            raise serializers.ValidationError("Property is not available")
        
        # Check date availability
        if not property_obj.check_availability(visit_date, visit_date):
            raise serializers.ValidationError("Property is already booked for this date")
        
        return attrs
    
    def create(self, validated_data):
        # Add user from context
        validated_data['user'] = self.context['request'].user
        booking = Booking(**validated_data)
        booking.calculate_amounts()
        booking.save()
        return booking


class BookingSerializer(serializers.ModelSerializer):
    property = PropertyListSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    amounts = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = '__all__'
    
    def get_amounts(self, obj):
        return {
            'base_amount': float(obj.base_amount),
            'service_fee': float(obj.service_fee),
            'tax_amount': float(obj.tax_amount),
            'total_amount': float(obj.total_amount),
        }