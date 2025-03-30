from django.shortcuts import render, get_object_or_404, redirect
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework.views import APIView
import requests
import json
from decimal import Decimal
from django.urls import reverse
from django.http import HttpResponseRedirect

from .models import Order, OrderItem, Transaction
from store.models import Product
from .serializers import OrderSerializer, CheckoutSerializer, TransactionSerializer

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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    """
    API to create an order and initiate ZarinPal payment.
    """
    serializer = CheckoutSerializer(data=request.data)
    if serializer.is_valid():
        # Calculate total price from items
        total_price = Decimal('0.00')
        for item_data in serializer.validated_data['items']:
            product = get_object_or_404(Product, id=item_data['product_id'])
            total_price += product.price * item_data['quantity']
        
        # Create order with total price
        order = serializer.save(
            user=request.user,
            total_price=total_price,
            status='pending'
        )
        
        return Response({
            'order_id': order.id,
            'total_price': total_price
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

# ZarinPal Payment Integration
class ZarinPalPaymentView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, order_id):
        """Generate payment URL for an order"""
        order = get_object_or_404(Order, id=order_id, user=request.user)
        
        # Use sandbox for testing or production in real environment
        is_sandbox = getattr(settings, 'ZARINPAL_SANDBOX', True)
        merchant_id = getattr(settings, 'ZARINPAL_MERCHANT_ID', '1344b5d4-0048-11e8-94db-005056a205be')
        
        base_url = "https://sandbox.zarinpal.com" if is_sandbox else "https://api.zarinpal.com"
        request_url = f"{base_url}/pg/v4/payment/request.json"
        
        # Build the callback URL - make sure this is an absolute URL
        callback_url = request.build_absolute_uri('/api/checkout/zarinpal/callback/')
        
        # Debug information
        print(f"Payment request: Order ID: {order_id}, Total Price: {order.total_price}")
        print(f"Callback URL: {callback_url}")
        
        # Convert to Rials (assuming the price is stored in Tomans)
        amount_rials = int(order.total_price * 10)
        
        data = {
            "merchant_id": merchant_id,
            "amount": amount_rials,
            "description": f"Payment for order #{order.id}",
            "callback_url": callback_url,
            "metadata": {
                "mobile": order.phone,
                "email": order.email,
                "order_id": str(order.id)
            }
        }
        
        headers = {
            'accept': 'application/json',
            'content-type': 'application/json'
        }
        
        try:
            response = requests.post(request_url, json=data, headers=headers)
            print(f"ZarinPal API Response: {response.status_code} - {response.text}")
            
            response_data = response.json()
            data = response_data.get("data", {})
            
            # Check for success code either in root or inside data object
            root_code = response_data.get("code")
            data_code = None
            if isinstance(data, dict):
                data_code = data.get("code")
            
            success_code = root_code if root_code is not None else data_code
            print(f"Payment initiation code: {success_code}")
            
            # Check if authority exists in data
            authority = None
            if isinstance(data, dict):
                authority = data.get("authority")
            
            # According to ZarinPal docs, code 100 indicates success
            if success_code == 100 and authority:
                # Update order with authority
                order.authority = authority
                order.save()
                
                # Create transaction record
                transaction = Transaction.objects.create(
                    order=order,
                    amount=order.total_price,
                    authority=authority,
                    status='pending'
                )
                
                # Generate payment URL
                payment_url = f"{base_url}/pg/StartPay/{authority}"
                
                return Response({
                    'payment_url': payment_url,
                    'authority': authority,
                    'status': 'success'
                })
            else:
                # If we reach here, it means the payment initiation failed
                errors = response_data.get('errors', [])
                error_code = None
                error_message = "Unknown error"
                
                # Try to extract error information from the response
                # The error can be in different formats based on ZarinPal's API behavior
                
                # Case 1: When errors is a list
                if isinstance(errors, list) and errors:
                    if isinstance(errors[0], dict) and 'code' in errors[0]:
                        error_code = errors[0].get('code')
                        error_message = errors[0].get('message', 'Unknown error')
                    else:
                        error_message = str(errors)
                
                # Case 2: When errors is a dictionary
                elif isinstance(errors, dict):
                    error_code = errors.get('code')
                    error_message = errors.get('message', 'Unknown error')
                
                # Case 3: When error code is directly in the response root
                elif 'code' in response_data and response_data.get('code') != 100:
                    error_code = response_data.get('code')
                    error_message = response_data.get('message', 'Unknown error')
                
                # Map error codes to messages according to ZarinPal documentation
                error_descriptions = {
                    -9: "Validation error - Invalid input data",
                    -10: "Invalid terminal - Incorrect merchant_id or IP",
                    -11: "Inactive terminal - Contact support",
                    -12: "Too many attempts - Try again later",
                    -15: "Suspended terminal - Contact support",
                    -50: "Session mismatch - Payment amount does not match",
                    -51: "Failed payment - Payment unsuccessful",
                    -54: "Invalid authority - Authority code is invalid"
                }
                
                if error_code in error_descriptions:
                    error_detail = error_descriptions[error_code]
                else:
                    error_detail = error_message
                
                print(f"ZarinPal error: {error_code} - {error_message}")
                
                return Response({
                    'status': 'error',
                    'message': f"Payment initiation failed with code: {error_code}",
                    'details': error_detail
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            print(f"Exception in ZarinPal payment: {str(e)}")
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def zarinpal_callback(request):
    """Handle ZarinPal payment callback"""
    authority = request.GET.get('Authority')
    status_param = request.GET.get('Status')
    
    print(f"ZarinPal Callback Received: Authority={authority}, Status={status_param}")
    print(f"Request params: {request.GET}")
    
    if not authority:
        return Response({'status': 'error', 'message': 'Invalid parameters'}, 
                      status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Find the order
        order = Order.objects.get(authority=authority)
        print(f"Order found: {order.id}")
        
        if status_param != 'OK':
            # Payment failed or canceled
            order.payment_status = 'failed'
            order.save()
            
            # Redirect to frontend with failure status
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            redirect_url = f"{frontend_url}/checkout/failed?order_id={order.id}"
            print(f"Payment failed, redirecting to: {redirect_url}")
            return HttpResponseRedirect(redirect_url)
        
        # Verify the payment
        is_sandbox = getattr(settings, 'ZARINPAL_SANDBOX', True)
        merchant_id = getattr(settings, 'ZARINPAL_MERCHANT_ID', '1344b5d4-0048-11e8-94db-005056a205be')
        
        base_url = "https://sandbox.zarinpal.com" if is_sandbox else "https://api.zarinpal.com"
        verify_url = f"{base_url}/pg/v4/payment/verify.json"
        
        # Convert to Rials (assuming the price is stored in Tomans)
        amount_rials = int(order.total_price * 10)
        
        data = {
            "merchant_id": merchant_id,
            "amount": amount_rials,
            "authority": authority
        }
        
        headers = {
            'accept': 'application/json',
            'content-type': 'application/json'
        }
        
        print(f"Verifying payment with data: {data}")
        response = requests.post(verify_url, json=data, headers=headers)
        print(f"Verification response: {response.status_code} - {response.text}")
        
        response_data = response.json()
        data = response_data.get("data", {})
        
        # Properly check for success codes from ZarinPal documentation
        # Code 100 = Success, 101 = Already verified
        # The code can be in the response root or in the data object
        root_code = response_data.get("code")
        data_code = None
        if isinstance(data, dict):
            data_code = data.get("code")
        
        success_code = root_code if root_code is not None else data_code
        print(f"Payment verification code: {success_code}")
        
        # According to ZarinPal docs, codes 100 and 101 are success states
        if success_code in [100, 101]:
            # Payment successful
            order.ref_id = data.get('ref_id')
            order.payment_status = 'paid'
            order.status = 'processing'
            order.save()
            
            # Create successful transaction record
            Transaction.objects.create(
                order=order,
                amount=order.total_price,
                authority=authority,
                ref_id=data.get('ref_id') if isinstance(data, dict) else None,
                card_pan=data.get('card_pan') if isinstance(data, dict) else None,
                card_hash=data.get('card_hash') if isinstance(data, dict) else None,
                fee_type=data.get('fee_type') if isinstance(data, dict) else None,
                fee=data.get('fee', 0) if isinstance(data, dict) else 0,
                status_code=success_code,
                status='successful'
            )
            
            # Redirect to success page
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            redirect_url = f"{frontend_url}/checkout/success?order_id={order.id}"
            print(f"Payment successful, redirecting to: {redirect_url}")
            return HttpResponseRedirect(redirect_url)
        else:
            # Payment verification failed
            order.payment_status = 'failed'
            order.save()
            
            # Get error description based on code
            error_descriptions = {
                -9: "Validation error - Invalid input data",
                -10: "Invalid terminal - Incorrect merchant_id or IP",
                -11: "Inactive terminal - Contact support",
                -12: "Too many attempts - Try again later",
                -15: "Suspended terminal - Contact support",
                -50: "Session mismatch - Payment amount does not match",
                -51: "Failed payment - Payment unsuccessful",
                -54: "Invalid authority - Authority code is invalid"
            }
            
            error_detail = error_descriptions.get(success_code, "Unknown error")
            print(f"Payment verification failed with code: {success_code} - {error_detail}")
            
            # Create failed transaction record
            Transaction.objects.create(
                order=order,
                amount=order.total_price,
                authority=authority,
                status_code=success_code,
                status='failed'
            )
            
            # Redirect to failure page
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            redirect_url = f"{frontend_url}/checkout/failed?order_id={order.id}"
            print(f"Payment verification failed, redirecting to: {redirect_url}")
            return HttpResponseRedirect(redirect_url)
    
    except Order.DoesNotExist:
        print(f"Order not found for authority: {authority}")
        return Response({'status': 'error', 'message': 'Order not found'}, 
                      status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        print(f"Exception in callback: {str(e)}")
        return Response({'status': 'error', 'message': str(e)}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def payment_refund(request, order_id):
    """Handle payment refund requests"""
    order = get_object_or_404(Order, id=order_id, user=request.user)
    
    # Check if the order is eligible for refund
    if order.payment_status != 'paid':
        return Response({
            'status': 'error',
            'message': 'Order is not eligible for refund'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # In a real implementation, you would integrate with ZarinPal's refund API
    # For now, we'll just update the order status
    
    # Create a refund transaction
    transaction = Transaction.objects.create(
        order=order,
        amount=order.total_price,
        status='refunded',
    )
    
    # Update order status
    order.payment_status = 'refunded'
    order.save()
    
    return Response({
        'status': 'success',
        'message': 'Refund processed successfully'
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def retry_payment(request, order_id):
    """Retry a failed payment"""
    order = get_object_or_404(Order, id=order_id, user=request.user)
    
    # Check if the order is eligible for retry
    if order.payment_status == 'paid':
        return Response({
            'status': 'error',
            'message': 'Order is already paid'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Generate a new payment URL
    # Redirect to ZarinPalPaymentView
    # For simplicity, we'll just call the view directly
    payment_view = ZarinPalPaymentView()
    return payment_view.post(request, order_id)
