from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from .views import (
    CustomTokenObtainPairView,
    LogoutView,
    UserView,
    RegisterView,
    UserProfileView,
    update_profile,
    ChangePasswordView,
    AddressListCreateView,
    AddressDetailView,
    DefaultAddressView,
    AddressView
)

app_name = 'users'

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('user/', UserView.as_view(), name='user'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('profile/update/', update_profile, name='update_profile'),
    path('password/', ChangePasswordView.as_view(), name='password-change'),
    
    # Address endpoints
    path('addresses/', AddressListCreateView.as_view(), name='address-list'),
    path('addresses/<int:pk>/', AddressDetailView.as_view(), name='address-detail'),
    path('addresses/<int:pk>/set-default/', DefaultAddressView.as_view(), name='set-default-address'),
    
    # Legacy address endpoint (keep for backward compatibility)
    path('address/', AddressView.as_view(), name='user-address'),
] 