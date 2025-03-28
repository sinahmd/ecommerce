from django.urls import path
from . import views

app_name = 'admin_panel'

urlpatterns = [
    # Product management
    path('products/', views.product_list_create, name='admin-products'),
    path('products/<int:pk>/', views.product_detail, name='admin-product-detail'),
    
    # Category management
    path('categories/', views.category_list_create, name='admin-categories'),
    path('categories/<int:pk>/', views.category_detail, name='admin-category-detail'),
    
    # User management
    path('users/', views.user_list, name='admin-users'),
    path('users/<int:pk>/', views.user_detail, name='admin-user-detail'),
    
    # Analytics
    path('analytics/', views.analytics, name='admin-analytics'),
] 