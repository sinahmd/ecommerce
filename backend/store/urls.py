from django.urls import path
from . import views

app_name = 'store'

urlpatterns = [
    path('', views.store_home, name='store_home'),
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('categories/<slug:slug>/', views.CategoryDetailView.as_view(), name='category-detail'),
    path('products/', views.ProductListView.as_view(), name='product-list'),
    path('products/<int:pk>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('products/by-slug/<slug:slug>/', views.ProductBySlugView.as_view(), name='product-by-slug'),
] 