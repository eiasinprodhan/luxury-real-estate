from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, PropertyViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'', PropertyViewSet, basename='property')

app_name = 'properties'

urlpatterns = [
    path('', include(router.urls)),
]