from django.shortcuts import render, get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer
from rest_framework import generics, status
from rest_framework.views import APIView

# Create your views here.

@api_view(['GET'])
@permission_classes([AllowAny])
def store_home(request):
    categories = Category.objects.all()[:5]
    featured_products = Product.objects.filter(available=True)[:8]
    
    return Response({
        'categories': CategorySerializer(categories, many=True).data,
        'featured_products': ProductSerializer(featured_products, many=True).data,
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def category_list(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def category_detail(request, slug):
    category = get_object_or_404(Category, slug=slug)
    products = category.products.filter(available=True)
    
    return Response({
        'category': CategorySerializer(category).data,
        'products': ProductSerializer(products, many=True).data,
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def product_list(request):
    products = Product.objects.filter(available=True)
    
    # Filter products by category
    category_slug = request.query_params.get('category')
    if category_slug:
        products = products.filter(categories__slug=category_slug)
    
    # Search products
    search_query = request.query_params.get('search')
    if search_query:
        products = products.filter(name__icontains=search_query)
    
    # Handle limit parameter
    limit = request.query_params.get('limit')
    if limit:
        try:
            limit = int(limit)
            products = products[:limit]
        except ValueError:
            pass
    
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def product_detail(request, slug):
    product = get_object_or_404(Product, slug=slug, available=True)
    # Get related products from the same category
    related_categories = product.categories.all()
    related_products = Product.objects.filter(categories__in=related_categories).exclude(id=product.id).distinct()[:4]
    
    return Response({
        'product': ProductSerializer(product).data,
        'related_products': ProductSerializer(related_products, many=True).data,
    })

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class CategoryDetailView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, slug):
        try:
            category = Category.objects.get(slug=slug)
            products = Product.objects.filter(categories__in=[category], available=True)
            
            category_serializer = CategorySerializer(category)
            products_serializer = ProductSerializer(products, many=True)
            
            return Response({
                'category': category_serializer.data,
                'products': products_serializer.data
            })
        except Category.DoesNotExist:
            return Response(
                {'detail': 'Category not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class ProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(available=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(available=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

class ProductBySlugView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, slug):
        try:
            product = Product.objects.get(slug=slug, available=True)
            serializer = ProductSerializer(product)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response(
                {'detail': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )
