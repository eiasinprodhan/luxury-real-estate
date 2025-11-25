from django.urls import path
from .views import (
    UserRegistrationView,
    UserProfileView,
    UserBookingHistoryView,
    UserPaymentHistoryView,
)

app_name = 'users'

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('bookings/', UserBookingHistoryView.as_view(), name='booking-history'),
    path('payments/', UserPaymentHistoryView.as_view(), name='payment-history'),
]