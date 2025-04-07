from django.urls import path
from . import views

urlpatterns = [
    # Admin-protected endpoints
    path('create/', views.BlogPostCreateView.as_view(), name='blog-create'),
    path('update/<slug:slug>/', views.BlogPostUpdateView.as_view(), name='blog-update'),
    path('delete/<slug:slug>/', views.BlogPostDeleteView.as_view(), name='blog-delete'),
    path('preview/<slug:slug>/', views.BlogPostPreviewView.as_view(), name='blog-preview'),
    
    # Tag endpoints
    path('tags/', views.TagListView.as_view(), name='tag-list'),
    path('tags/<slug:slug>/', views.TagDetailView.as_view(), name='tag-detail'),
    
    # Public API endpoints (more generic paths should be last)
    path('', views.BlogPostListView.as_view(), name='blog-list'),
    path('<slug:slug>/', views.BlogPostDetailView.as_view(), name='blog-detail'),
] 