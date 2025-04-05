from rest_framework import serializers
from .models import DashboardSetting, AdminActivity
from store.models import Category, Product
from checkout.models import Order, OrderItem
from users.models import CustomUser
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum
from django.utils import timezone
from datetime import timedelta
from random import randint
from django.utils.text import slugify

User = get_user_model()

class DashboardSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardSetting
        fields = ['id', 'name', 'value', 'description']

class AdminActivitySerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')
    
    class Meta:
        model = AdminActivity
        fields = ['id', 'user', 'user_email', 'action', 'details', 'ip_address', 'created_at']
        read_only_fields = ['created_at']

class AdminCategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    image = serializers.ImageField(required=False)
    slug = serializers.SlugField(required=False)
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'product_count', 'created_at', 'updated_at']
    
    def get_product_count(self, obj):
        return obj.products.count()
        
    def validate_name(self, value):
        if not value:
            raise serializers.ValidationError("Name is required")
        return value

    def create(self, validated_data):
        if 'slug' not in validated_data:
            validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)

class AdminProductSerializer(serializers.ModelSerializer):
    category_names = serializers.SerializerMethodField()
    categories = serializers.PrimaryKeyRelatedField(many=True, queryset=Category.objects.all())
    image = serializers.ImageField(required=False)
    slug = serializers.SlugField(required=False)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'image', 
            'stock', 'available', 'categories', 'category_names',
            'created_at', 'updated_at'
        ]

    def get_category_names(self, obj):
        return [category.name for category in obj.categories.all()]

    def validate_name(self, value):
        if not value:
            raise serializers.ValidationError("Name is required")
        return value

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0")
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative")
        return value

    def create(self, validated_data):
        categories = validated_data.pop('categories', [])
        if 'slug' not in validated_data:
            validated_data['slug'] = slugify(validated_data['name'])
        
        product = Product.objects.create(**validated_data)
        product.categories.set(categories)
        return product
        
    def update(self, instance, validated_data):
        categories = validated_data.pop('categories', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if categories is not None:
            instance.categories.set(categories)
            
        instance.save()
        return instance

class AdminOrderSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')
    
    class Meta:
        model = Order
        fields = [
            'id', 'user', 'user_email', 'first_name', 'last_name', 'email', 
            'status', 'total', 'shipping_cost', 'created_at'
        ]

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'is_active', 'is_staff', 'is_superuser', 'date_joined', 'last_login']
        read_only_fields = ['date_joined', 'last_login']

class DashboardStatsSerializer(serializers.Serializer):
    total_orders = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_products = serializers.IntegerField()
    total_users = serializers.IntegerField()
    recent_orders = AdminOrderSerializer(many=True)

class UserAdminSerializer(serializers.ModelSerializer):
    orders_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 
            'is_active', 'is_staff', 'date_joined',
            'orders_count'
        ]
        read_only_fields = ['date_joined']

    def get_orders_count(self, obj):
        return Order.objects.filter(user=obj).count()

class UserDetailAdminSerializer(UserAdminSerializer):
    orders = serializers.SerializerMethodField()

    class Meta(UserAdminSerializer.Meta):
        fields = UserAdminSerializer.Meta.fields + ['orders']

    def get_orders(self, obj):
        orders = Order.objects.filter(user=obj).order_by('-created_at')
        return [{
            'id': order.id,
            'total': order.total,
            'status': order.status,
            'created_at': order.created_at,
            'items_count': order.items.count()
        } for order in orders]

class AnalyticsSerializer(serializers.Serializer):
    def get_monthly_data(self):
        end_date = timezone.now()
        start_date = end_date - timedelta(days=365)
        
        orders = Order.objects.filter(
            status='completed',
            created_at__range=(start_date, end_date)
        ).extra(
            select={'month': "DATE_TRUNC('month', created_at)"}
        ).values('month').annotate(
            total=Sum('total'),
            count=Count('id')
        ).order_by('month')

        return [{
            'month': item['month'].strftime('%Y-%m'),
            'total': float(item['total'] or 0),
            'count': item['count']
        } for item in orders]

    def get_daily_visitors(self, days=30):
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        daily_data = []
        current_date = start_date
        while current_date <= end_date:
            daily_data.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'count': randint(50, 200)  # Random visitor count between 50 and 200
            })
            current_date += timedelta(days=1)
        
        return daily_data

    def to_representation(self, instance):
        monthly_data = self.get_monthly_data()
        total_revenue = sum(item['total'] for item in monthly_data)
        
        daily_visitors = self.get_daily_visitors()
        total_visitors = sum(item['count'] for item in daily_visitors)
        
        return {
            'payments': {
                'monthly': monthly_data,
                'total': total_revenue
            },
            'visitors': {
                'daily': daily_visitors,
                'total': total_visitors
            }
        } 