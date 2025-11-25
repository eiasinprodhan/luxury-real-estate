from django.db import models
from django.contrib.auth import get_user_model
from properties.models import Property
from decimal import Decimal
import uuid

User = get_user_model()

class Booking(models.Model):
    """Booking Model with business logic"""
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('canceled', 'Canceled'),
        ('completed', 'Completed'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    
    # Visit/viewing date
    visit_date = models.DateField()
    visit_time = models.TimeField(null=True, blank=True)
    
    # Pricing
    base_amount = models.DecimalField(max_digits=12, decimal_places=2)
    service_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Additional info
    notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'bookings'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['property']),
            models.Index(fields=['status']),
            models.Index(fields=['visit_date']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Booking {self.id} - {self.user.email}"
    
    def calculate_amounts(self, service_fee_percent=5, tax_percent=10):
        """Algorithm: Calculate booking amounts"""
        self.base_amount = Decimal(str(self.property.price))
        
        # Calculate service fee (5% of base)
        self.service_fee = self.base_amount * Decimal(str(service_fee_percent / 100))
        
        # Calculate subtotal
        subtotal = self.base_amount + self.service_fee
        
        # Calculate tax
        self.tax_amount = subtotal * Decimal(str(tax_percent / 100))
        
        # Calculate total
        self.total_amount = subtotal + self.tax_amount
        
        return {
            'base_amount': float(self.base_amount),
            'service_fee': float(self.service_fee),
            'subtotal': float(subtotal),
            'tax_amount': float(self.tax_amount),
            'total_amount': float(self.total_amount),
        }
    
    def update_status(self, new_status):
        """OOP Method: Update booking status with validation"""
        valid_transitions = {
            'pending': ['paid', 'canceled'],
            'paid': ['completed', 'canceled'],
            'completed': [],
            'canceled': [],
        }
        
        if new_status not in valid_transitions.get(self.status, []):
            raise ValueError(f"Cannot transition from {self.status} to {new_status}")
        
        self.status = new_status
        self.save()
        return True
    
    def can_be_canceled(self):
        """Check if booking can be canceled"""
        return self.status in ['pending', 'paid']
    
    def save(self, *args, **kwargs):
        # Auto-calculate amounts on first save
        if not self.pk and self.property:
            self.calculate_amounts()
        super().save(*args, **kwargs)