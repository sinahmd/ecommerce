from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg, F
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from checkout.models import Order, OrderItem
from store.models import Product
from django.db.models.functions import TruncMonth
from django.db import models
from django.conf import settings

User = get_user_model()

# Create your views here.

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def dashboard_stats(request):
    # Get total revenue
    total_revenue = Order.objects.filter(status='delivered').aggregate(
        total=Sum('total_price')
    )['total'] or 0

    # Get total orders
    total_orders = Order.objects.count()

    # Get total users
    total_users = User.objects.count()

    # Get average order value
    avg_order_value = Order.objects.filter(status='delivered').aggregate(
        avg=Avg('total_price')
    )['avg'] or 0

    return Response({
        'totalRevenue': float(total_revenue),
        'totalOrders': total_orders,
        'totalUsers': total_users,
        'averageOrderValue': float(avg_order_value),
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def sales_data(request):
    # Get last 12 months of sales data
    end_date = timezone.now()
    start_date = end_date - timedelta(days=365)

    monthly_sales = Order.objects.filter(
        status='delivered',
        created_at__range=(start_date, end_date)
    ).annotate(
        month=TruncMonth('created_at')
    ).values('month').annotate(
        total=Sum('total_price')
    ).order_by('month')

    labels = [sale['month'].strftime('%B %Y') for sale in monthly_sales]
    sales = [float(sale['total']) for sale in monthly_sales]

    return Response({
        'labels': labels,
        'sales': sales,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def top_products(request):
    # Get backend URL from settings or default to localhost:8000
    backend_url = getattr(settings, 'BACKEND_URL', 'http://localhost:8000')
    
    # Get top 5 selling products
    top_products = Product.objects.annotate(
        total_sales=Sum('order_items__quantity', filter=models.Q(order_items__order__status='delivered')),
        total_revenue=Sum(
            F('order_items__quantity') * F('order_items__price'),
            filter=models.Q(order_items__order__status='delivered')
        )
    ).order_by('-total_sales')[:5]

    products_data = [{
        'id': product.id,
        'name': product.name,
        'totalSales': float(product.total_revenue or 0),
        'quantity': product.total_sales or 0,
        'image': f"{backend_url}{product.image.url}" if product.image else None,
    } for product in top_products]

    return Response(products_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def recent_orders(request):
    # Get 10 most recent orders
    recent_orders = Order.objects.select_related('user').order_by('-created_at')[:10]

    orders_data = [{
        'id': order.id,
        'customerName': f"{order.first_name} {order.last_name}",
        'date': order.created_at.isoformat(),
        'total': float(order.total_price),
        'status': order.status,
    } for order in recent_orders]

    return Response(orders_data)
