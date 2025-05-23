"""
URL configuration for ecommerce project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from users.csrf_views import get_csrf_token

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/store/', include('store.urls')),
    path('api/users/', include('users.urls')),
    path('api/checkout/', include('checkout.urls')),
    path('api/admin-panel/', include('admin_panel.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/blog/', include('blog.urls')),
    
    # Authentication endpoints
    path('api/auth/', include('users.auth_urls')),
    path('api/csrf/', get_csrf_token, name='csrf_token'),
]

# Add media files URL in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
