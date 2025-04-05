from rest_framework import serializers
from .models import Category, Product

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image']

class ProductSerializer(serializers.ModelSerializer):
    category_names = serializers.SerializerMethodField()
    category_slugs = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'image', 
            'stock', 'available', 'categories', 'category_names', 'category_slugs',
            'created_at', 'updated_at'
        ]
    
    def get_category_names(self, obj):
        return [category.name for category in obj.categories.all()]
    
    def get_category_slugs(self, obj):
        return [category.slug for category in obj.categories.all()] 