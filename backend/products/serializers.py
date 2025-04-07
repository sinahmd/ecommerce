from rest_framework import serializers
from .models import Product, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description',
            'meta_title', 'meta_description', 'schema_type', 'canonical_url'
        ]

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price',
            'image', 'category', 'stock', 'is_available',
            'created_at', 'updated_at', 'meta_title', 'meta_description',
            'schema_type', 'canonical_url', 'brand', 'sku', 
            'weight', 'dimensions', 'mpn', 'gtin'
        ] 