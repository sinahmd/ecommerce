from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.dashboard_stats, name='dashboard-stats'),
    path('sales/', views.sales_data, name='sales-data'),
    path('top-products/', views.top_products, name='top-products'),
    path('recent-orders/', views.recent_orders, name='recent-orders'),
] 