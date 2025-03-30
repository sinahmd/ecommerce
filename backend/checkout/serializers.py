from rest_framework import serializers
from .models import Order, OrderItem, Transaction
from store.serializers import ProductSerializer
from store.models import Product

class OrderItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_detail', 'price', 'quantity', 'total_price']
        read_only_fields = ['total_price']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            'id', 'amount', 'authority', 'ref_id', 'card_pan', 
            'card_hash', 'fee_type', 'fee', 'status_code', 
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class OrderSerializer(serializers.ModelSerializer):
    # items = OrderItemSerializer(many=True, read_only=True)
    total_items = serializers.ReadOnlyField()
    transactions = TransactionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'user', 'first_name', 'last_name', 'email', 'phone',
            'address', 'status', 'total_price', 'shipping_cost', 
            'items', 'total_items', 'created_at', 'updated_at',
            'authority', 'ref_id'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

class CartItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, max_value=100)

class CheckoutSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, write_only=True)
    
    class Meta:
        model = Order
        fields = [
            'first_name', 'last_name', 'email', 'phone',
            'address', 'items'
        ]
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        
        # Create order items with correct prices from the product model
        for item_data in items_data:
            product = Product.objects.get(id=item_data['product_id'])
            OrderItem.objects.create(
                order=order,
                product=product,
                price=product.price,
                quantity=item_data['quantity']
            )
        
        return order 