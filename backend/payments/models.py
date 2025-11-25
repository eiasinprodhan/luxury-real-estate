from django.db import models
from bookings.models import Booking
import uuid

class Payment(models.Model):
    """Payment Model"""
    
    PROVIDER_CHOICES = (
        ('stripe', 'Stripe'),
        ('bkash', 'bKash'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES)
    transaction_id = models.CharField(max_length=255, unique=True, db_index=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Store raw API responses
    raw_response = models.JSONField(default=dict)
    
    # Metadata
    metadata = models.JSONField(default=dict)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payments'
        indexes = [
            models.Index(fields=['booking']),
            models.Index(fields=['transaction_id']),
            models.Index(fields=['status']),
            models.Index(fields=['provider']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Payment {self.id} - {self.provider}"