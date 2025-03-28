from django.shortcuts import render
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Case, When, IntegerField
from django.core.paginator import Paginator
from .models import Product
from .serializers import ProductSerializer

# Create your views here.

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']

    def list(self, request):
        # Get query parameters
        search = request.query_params.get('search', '')
        sort_by = request.query_params.get('sort_by', 'relevance')
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        page = request.query_params.get('page', 1)
        limit = request.query_params.get('limit', 12)

        # Base queryset
        queryset = self.get_queryset()

        # Apply search filter
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )

        # Apply price range filter
        if min_price:
            queryset = queryset.filter(price__gte=float(min_price))
        if max_price:
            queryset = queryset.filter(price__lte=float(max_price))

        # Apply sorting
        if sort_by == 'price_low_high':
            queryset = queryset.order_by('price')
        elif sort_by == 'price_high_low':
            queryset = queryset.order_by('-price')
        elif sort_by == 'newest':
            queryset = queryset.order_by('-created_at')
        elif sort_by == 'relevance' and search:
            # For relevance sorting, prioritize name matches over description matches
            queryset = queryset.annotate(
                name_match=Case(
                    When(name__icontains=search, then=1),
                    default=0,
                    output_field=IntegerField(),
                )
            ).order_by('-name_match', '-created_at')

        # Pagination
        paginator = Paginator(queryset, limit)
        products = paginator.get_page(page)

        serializer = self.get_serializer(products, many=True)

        return Response({
            'products': serializer.data,
            'total_pages': paginator.num_pages,
            'current_page': int(page),
            'total_items': paginator.count
        })
