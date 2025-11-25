from rest_framework import serializers
from .models import Category, Property, PropertyImage

class CategorySerializer(serializers.ModelSerializer):
    children_count = serializers.SerializerMethodField()
    path = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'parent', 'description', 
                  'children_count', 'path', 'created_at')
    
    def get_children_count(self, obj):
        return obj.children.count()
    
    def get_path(self, obj):
        return obj.get_path()


class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ('id', 'image', 'caption', 'order')


class PropertyListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Property
        fields = ('id', 'name', 'slug', 'location', 'price', 'bedrooms', 
                  'bathrooms', 'featured_image', 'status', 'category_name')


class PropertyDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    images = PropertyImageSerializer(many=True, read_only=True)
    similar_properties = serializers.SerializerMethodField()
    
    class Meta:
        model = Property
        fields = '__all__'
    
    def get_similar_properties(self, obj):
        similar = obj.get_similar_properties()
        return PropertyListSerializer(similar, many=True).data


class PropertyCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = ('name', 'description', 'location', 'category', 'price', 
                  'bedrooms', 'bathrooms', 'square_feet', 'amenities', 
                  'featured_image', 'model_3d_url', 'status')
    
    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0")
        return value