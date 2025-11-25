from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import EmailValidator

class User(AbstractUser):
    """Custom User Model with OOP principles"""
    
    USER_TYPES = (
        ('customer', 'Customer'),
        ('admin', 'Admin'),
    )
    
    email = models.EmailField(
        unique=True,
        validators=[EmailValidator()],
        db_index=True
    )
    phone = models.CharField(max_length=20, blank=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPES, default='customer')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['username']),
        ]
    
    def __str__(self):
        return self.email
    
    def get_booking_history(self):
        """OOP Method: Get user's booking history"""
        return self.bookings.select_related('property').order_by('-created_at')
    
    def get_payment_history(self):
        """OOP Method: Get user's payment history"""
        from payments.models import Payment
        return Payment.objects.filter(
            booking__user=self
        ).select_related('booking__property').order_by('-created_at')
    
    def is_admin_user(self):
        """Check if user is admin"""
        return self.user_type == 'admin' or self.is_staff