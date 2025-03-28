from django.shortcuts import render, get_object_or_404
from django.db.models import Sum, Count
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status
from django.db.models.functions import TruncMonth, TruncDay
from django.utils import timezone
from datetime import timedelta

from .models import DashboardSetting, AdminActivity
from store.models import Category, Product
from checkout.models import Order
from users.models import CustomUser
from .serializers import (
    DashboardSettingSerializer, AdminActivitySerializer,
    AdminCategorySerializer, AdminProductSerializer,
    AdminOrderSerializer, AdminUserSerializer, DashboardStatsSerializer
)
from django.contrib.sessions.models import Session

# Create your views here.

# Dashboard views
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def dashboard(request):
    total_orders = Order.objects.count()
    total_revenue = Order.objects.filter(status__in=['processing', 'shipped', 'delivered']).aggregate(Sum('total'))['total__sum'] or 0
    total_products = Product.objects.count()
    total_users = CustomUser.objects.count()
    recent_orders = Order.objects.all().order_by('-created_at')[:5]
    
    stats = {
        'total_orders': total_orders,
        'total_revenue': total_revenue,
        'total_products': total_products,
        'total_users': total_users,
        'recent_orders': recent_orders
    }
    
    serializer = DashboardStatsSerializer(stats)
    return Response(serializer.data)

# Product management
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def product_list_create(request):
    if request.method == 'GET':
        products = Product.objects.select_related('category').all()
        data = [{
            'id': product.id,
            'name': product.name,
            'price': float(product.price),
            'stock': product.stock,
            'category': {
                'id': product.category.id,
                'name': product.category.name
            },
            'image': request.build_absolute_uri(product.image.url) if product.image else None,
            'is_available': product.available,
            'created_at': product.created_at
        } for product in products]
        return Response(data)
    
    elif request.method == 'POST':
        try:
            category = Category.objects.get(id=request.data.get('category_id'))
            product = Product.objects.create(
                name=request.data.get('name'),
                price=request.data.get('price'),
                stock=request.data.get('stock', 0),
                category=category,
                description=request.data.get('description', ''),
                image=request.data.get('image'),
                available=request.data.get('is_available', True)
            )
            return Response({
                'id': product.id,
                'name': product.name,
                'message': 'Product created successfully'
            }, status=status.HTTP_201_CREATED)
        except Category.DoesNotExist:
            return Response({'error': 'Category not found'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def product_detail(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        data = {
            'id': product.id,
            'name': product.name,
            'price': float(product.price),
            'stock': product.stock,
            'category': {
                'id': product.category.id,
                'name': product.category.name
            },
            'description': product.description,
            'image': request.build_absolute_uri(product.image.url) if product.image else None,
            'is_available': product.available,
            'created_at': product.created_at
        }
        return Response(data)

    elif request.method == 'PUT':
        try:
            if 'category_id' in request.data:
                category = Category.objects.get(id=request.data['category_id'])
                product.category = category
            
            product.name = request.data.get('name', product.name)
            product.price = request.data.get('price', product.price)
            product.stock = request.data.get('stock', product.stock)
            product.description = request.data.get('description', product.description)
            if 'image' in request.data:
                product.image = request.data['image']
            product.available = request.data.get('is_available', product.available)
            product.save()
            
            return Response({'message': 'Product updated successfully'})
        except Category.DoesNotExist:
            return Response({'error': 'Category not found'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        product.delete()
        return Response({'message': 'Product deleted successfully'})

# Category management
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def category_list_create(request):
    if request.method == 'GET':
        categories = Category.objects.all()
        data = [{
            'id': category.id,
            'name': category.name,
            'description': category.description,
            'image': request.build_absolute_uri(category.image.url) if category.image else None,
            'product_count': category.products.count()
        } for category in categories]
        return Response(data)
    
    elif request.method == 'POST':
        try:
            category = Category.objects.create(
                name=request.data.get('name'),
                description=request.data.get('description', ''),
                image=request.data.get('image')
            )
            return Response({
                'id': category.id,
                'name': category.name,
                'message': 'Category created successfully'
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def category_detail(request, pk):
    try:
        category = Category.objects.get(pk=pk)
    except Category.DoesNotExist:
        return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        data = {
            'id': category.id,
            'name': category.name,
            'description': category.description,
            'image': request.build_absolute_uri(category.image.url) if category.image else None,
            'product_count': category.products.count(),
            'products': [{
                'id': product.id,
                'name': product.name,
                'price': float(product.price)
            } for product in category.products.all()]
        }
        return Response(data)

    elif request.method == 'PUT':
        try:
            category.name = request.data.get('name', category.name)
            category.description = request.data.get('description', category.description)
            if 'image' in request.data:
                category.image = request.data['image']
            category.save()
            return Response({'message': 'Category updated successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if category.products.exists():
            return Response(
                {'error': 'Cannot delete category with existing products'},
                status=status.HTTP_400_BAD_REQUEST
            )
        category.delete()
        return Response({'message': 'Category deleted successfully'})

# User management
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def user_list(request):
    users = CustomUser.objects.all()
    data = [{
        'id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_active': user.is_active,
        'is_staff': user.is_staff,
        'date_joined': user.date_joined,
        'orders_count': Order.objects.filter(user=user).count()
    } for user in users]
    return Response(data)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def user_detail(request, pk):
    try:
        user = CustomUser.objects.get(pk=pk)
    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        orders = Order.objects.filter(user=user).order_by('-created_at')
        data = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_active': user.is_active,
            'is_staff': user.is_staff,
            'date_joined': user.date_joined,
            'orders': [{
                'id': order.id,
                'total': float(order.total),
                'status': order.status,
                'created_at': order.created_at,
                'items_count': order.items.count()
            } for order in orders]
        }
        return Response(data)

    elif request.method == 'PUT':
        try:
            user.first_name = request.data.get('first_name', user.first_name)
            user.last_name = request.data.get('last_name', user.last_name)
            user.is_active = request.data.get('is_active', user.is_active)
            user.is_staff = request.data.get('is_staff', user.is_staff)
            if 'password' in request.data:
                user.set_password(request.data['password'])
            user.save()
            return Response({'message': 'User updated successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if user.is_superuser:
            return Response({'error': 'Cannot delete superuser'}, status=status.HTTP_400_BAD_REQUEST)
        if user == request.user:
            return Response({'error': 'Cannot delete your own account'}, status=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return Response({'message': 'User deleted successfully'})

# Statistics view
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def analytics(request):
    # Get the time range from query parameters or default to last 30 days
    days = int(request.GET.get('days', 30))
    end_date = timezone.now()
    start_date = end_date - timedelta(days=days)
    
    # Monthly payment analytics
    monthly_payments = Order.objects.filter(
        created_at__gte=start_date,
        status='completed'
    ).annotate(
        month=TruncMonth('created_at')
    ).values('month').annotate(
        total=Sum('total_price'),
        count=Count('id')
    ).order_by('month')

    # Daily visitor analytics (using sessions)
    daily_visitors = Session.objects.filter(
        expire_date__gte=start_date
    ).annotate(
        day=TruncDay('expire_date')
    ).values('day').annotate(
        count=Count('session_key')
    ).order_by('day')

    return Response({
        'payments': {
            'monthly': [{
                'month': payment['month'].strftime('%B %Y'),
                'total': float(payment['total'] or 0),
                'count': payment['count']
            } for payment in monthly_payments],
            'total': float(Order.objects.filter(
                created_at__gte=start_date,
                status='completed'
            ).aggregate(total=Sum('total_price'))['total'] or 0)
        },
        'visitors': {
            'daily': [{
                'date': visitor['day'].strftime('%Y-%m-%d'),
                'count': visitor['count']
            } for visitor in daily_visitors],
            'total': Session.objects.filter(expire_date__gte=start_date).count()
        }
    })

# Settings view
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated, IsAdminUser])
def settings(request):
    if request.method == 'GET':
        settings = DashboardSetting.objects.all()
        serializer = DashboardSettingSerializer(settings, many=True)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        setting_id = request.data.get('id')
        setting = get_object_or_404(DashboardSetting, id=setting_id)
        serializer = DashboardSettingSerializer(setting, data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
