from django.shortcuts import render, get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.views import APIView

from .models import Order, OrderItem
from store.models import Product
from .serializers import OrderSerializer, CheckoutSerializer

# Create your views here.

# Cart views (would be stored in session or database)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cart(request):
    # This is a placeholder for cart functionality
    # In a real implementation, cart would be stored in session or database
    return Response({'items': []})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request, product_id):
    product = get_object_or_404(Product, id=product_id, available=True)
    quantity = int(request.data.get('quantity', 1))
    
    # Placeholder for adding to cart
    return Response({
        'message': f'{quantity} x {product.name} added to cart'
    })

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cart(request, item_id):
    # Placeholder for updating cart item
    quantity = int(request.data.get('quantity', 1))
    return Response({
        'message': f'Cart item {item_id} updated to quantity {quantity}'
    })

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, item_id):
    # Placeholder for removing from cart
    return Response({
        'message': f'Item {item_id} removed from cart'
    })

# Checkout views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout_address(request):
    # Placeholder for validating address
    return Response({
        'message': 'Address validated'
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout_payment(request):
    serializer = CheckoutSerializer(data=request.data)
    if serializer.is_valid():
        # Associate with current user
        order = serializer.save(
            user=request.user,
            # Placeholder for total price calculation
            total_price=100.00, 
            shipping_cost=10.00,
            status='pending'
        )
        # Would process payment here
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Order views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_list(request):
    orders = Order.objects.filter(user=request.user)
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_detail(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    serializer = OrderSerializer(order)
    return Response(serializer.data)

# Order views for user profile
class UserOrderListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all orders for the current user"""
        orders = Order.objects.filter(user=request.user)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

class UserOrderDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, order_id):
        """Get details of a specific order"""
        try:
            order = Order.objects.get(id=order_id, user=request.user)
            serializer = OrderSerializer(order)
            return Response(serializer.data)
        except Order.DoesNotExist:
            return Response(
                {'detail': 'Order not found.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
