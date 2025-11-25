from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Booking
from .serializers import BookingSerializer, BookingCreateSerializer


class BookingViewSet(viewsets.ModelViewSet):
    """Booking management"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin_user():
            return Booking.objects.all()
        return Booking.objects.filter(user=user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        return BookingSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking"""
        booking = self.get_object()
        
        if not booking.can_be_canceled():
            return Response(
                {'error': 'Booking cannot be canceled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            booking.update_status('canceled')
            serializer = self.get_serializer(booking)
            return Response(serializer.data)
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )