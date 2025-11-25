from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator
import uuid

class Category(models.Model):
    """Hierarchical Category Tree for DFS traversal"""
    
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children'
    )
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'Categories'
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['parent']),
        ]
    
    def __str__(self):
        return self.name
    
    def get_all_children(self):
        """DFS Algorithm: Get all descendant categories"""
        children = []
        stack = [self]
        
        while stack:
            current = stack.pop()
            children.append(current)
            # Add children to stack (DFS)
            for child in current.children.all():
                stack.append(child)
        
        return children[1:]  # Exclude self
    
    def get_path(self):
        """Get hierarchical path"""
        path = [self.name]
        current = self.parent
        while current:
            path.insert(0, current.name)
            current = current.parent
        return ' > '.join(path)


class Property(models.Model):
    """Property Model with OOP principles"""
    
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('sold', 'Sold'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=300, db_index=True)
    description = models.TextField()
    location = models.CharField(max_length=255)
    
    # Category relationship
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name='properties'
    )
    
    # Property details
    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    bedrooms = models.PositiveIntegerField()
    bathrooms = models.PositiveIntegerField()
    square_feet = models.PositiveIntegerField(null=True, blank=True)
    
    # Amenities as JSON
    amenities = models.JSONField(default=list)
    
    # Images
    featured_image = models.ImageField(upload_to='properties/', blank=True, null=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # 3D Model URL (for Three.js)
    model_3d_url = models.URLField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'properties'
        verbose_name_plural = 'Properties'
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['status']),
            models.Index(fields=['price']),
            models.Index(fields=['category']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def is_available(self):
        """OOP Method: Check if property is available"""
        return self.status == 'active'
    
    def check_availability(self, start_date, end_date):
        """Algorithm: Check availability for date range"""
        from bookings.models import Booking
        
        overlapping_bookings = Booking.objects.filter(
            property=self,
            status__in=['pending', 'paid'],
            visit_date__range=[start_date, end_date]
        )
        
        return not overlapping_bookings.exists()
    
    def get_similar_properties(self, limit=5):
        """Algorithm: Get similar properties using category tree (DFS)"""
        from django.core.cache import cache
        
        cache_key = f'similar_properties_{self.id}'
        cached_result = cache.get(cache_key)
        
        if cached_result:
            return cached_result
        
        # Get all categories in the tree
        if self.category:
            related_categories = self.category.get_all_children()
            related_categories.append(self.category)
            
            similar = Property.objects.filter(
                category__in=related_categories,
                status='active'
            ).exclude(id=self.id)[:limit]
        else:
            similar = Property.objects.filter(
                status='active',
                price__range=[self.price * 0.8, self.price * 1.2]
            ).exclude(id=self.id)[:limit]
        
        # Cache for 1 hour
        cache.set(cache_key, similar, 3600)
        return similar


class PropertyImage(models.Model):
    """Additional property images"""
    
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(upload_to='properties/gallery/')
    caption = models.CharField(max_length=255, blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'property_images'
        ordering = ['order']
    
    def __str__(self):
        return f"{self.property.name} - Image {self.order}"