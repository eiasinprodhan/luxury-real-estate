from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    UserProfileSerializer
)

User = get_user_model()


class UserRegistrationView(generics.CreateAPIView):
    """User Registration"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserBookingHistoryView(APIView):
    """Get user's booking history"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        from bookings.serializers import BookingSerializer
        bookings = request.user.get_booking_history()
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)


class UserPaymentHistoryView(APIView):
    """Get user's payment history"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        from payments.serializers import PaymentSerializer
        payments = request.user.get_payment_history()
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)