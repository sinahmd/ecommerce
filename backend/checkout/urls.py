from django.urls import path
from . import views

app_name = 'checkout'

urlpatterns = [
    path('cart/', views.cart, name='cart'),
    path('cart/add/<int:product_id>/', views.add_to_cart, name='add_to_cart'),
    path('cart/update/<int:item_id>/', views.update_cart, name='update_cart'),
    path('cart/remove/<int:item_id>/', views.remove_from_cart, name='remove_from_cart'),
    path('address/', views.checkout_address, name='checkout_address'),
    path('payment/', views.checkout_payment, name='checkout_payment'),
    path('orders/', views.order_list, name='order_list'),
    path('orders/<int:order_id>/', views.order_detail, name='order_detail'),
    
    # User-specific order endpoints
    path('user/orders/', views.UserOrderListView.as_view(), name='user_order_list'),
    path('user/orders/<int:order_id>/', views.UserOrderDetailView.as_view(), name='user_order_detail'),
] 