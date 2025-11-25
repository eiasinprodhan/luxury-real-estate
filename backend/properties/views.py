from rest_framework import viewsets, filters, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Property
from .serializers import (
    CategorySerializer,
    PropertyListSerializer,
    PropertyDetailSerializer,
    PropertyCreateUpdateSerializer
)


class IsAdminOrReadOnly(permissions.BasePermission):
    """Custom permission: Admin can edit, others can only read"""

    def has_permission(self, request, view):
        # Allow read-only access (GET, HEAD, OPTIONS) for everyone
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions require authenticated admin user
        return (
                request.user and
                request.user.is_authenticated and
                request.user.is_admin_user()
        )


class CategoryViewSet(viewsets.ModelViewSet):
    """Category CRUD with DFS traversal"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'

    @action(detail=True, methods=['get'])
    def children(self, request, slug=None):
        """Get all descendant categories using DFS"""
        category = self.get_object()
        children = category.get_all_children()
        serializer = self.get_serializer(children, many=True)
        return Response(serializer.data)


class PropertyViewSet(viewsets.ModelViewSet):
    """Property CRUD operations"""
    queryset = Property.objects.select_related('category').prefetch_related('images')
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'category', 'bedrooms', 'bathrooms']
    search_fields = ['name', 'description', 'location']
    ordering_fields = ['price', 'created_at', 'name']

    def get_serializer_class(self):
        if self.action == 'list':
            return PropertyListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return PropertyCreateUpdateSerializer
        return PropertyDetailSerializer

    def get_serializer_context(self):
        """Add request to serializer context for building absolute URLs"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def _is_admin(self):
        """Helper method to check if current user is admin"""
        user = self.request.user
        return (
                user and
                user.is_authenticated and
                user.is_admin_user()
        )

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')

        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # Only show active properties to non-admin users
        # FIX: Check is_authenticated BEFORE calling is_admin_user()
        if not self._is_admin():
            queryset = queryset.filter(status='active')

        return queryset

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def similar(self, request, slug=None):
        """Get similar properties using category tree (DFS + Cache)"""
        try:
            property_obj = self.get_object()

            # Check if method exists on model
            if hasattr(property_obj, 'get_similar_properties'):
                similar = property_obj.get_similar_properties()
            else:
                # Fallback: get properties from same category
                similar = Property.objects.filter(
                    status='active'
                ).exclude(id=property_obj.id)

                if property_obj.category:
                    similar = similar.filter(category=property_obj.category)

                similar = similar[:6]

            serializer = PropertyListSerializer(
                similar,
                many=True,
                context={'request': request}
            )
            return Response(serializer.data)
        except Exception as e:
            print(f"Error in similar: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def check_availability(self, request, slug=None):
        """Check property availability"""
        try:
            property_obj = self.get_object()
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')

            if not start_date or not end_date:
                return Response(
                    {'error': 'start_date and end_date required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if method exists on model
            if hasattr(property_obj, 'check_availability'):
                is_available = property_obj.check_availability(start_date, end_date)
            else:
                # Default availability check
                is_available = property_obj.status == 'active'

            return Response({
                'available': is_available,
                'property': property_obj.name,
                'date_range': f"{start_date} to {end_date}"
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )