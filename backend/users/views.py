from django.shortcuts import render, get_object_or_404
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework import status, generics, views
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.conf import settings
import time
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import serializers
from django.http import Http404
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import CustomUser, UserProfile, Address
from .serializers import UserSerializer, RegisterSerializer, UserProfileSerializer, AddressSerializer

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    user = authenticate(email=email, password=password)
    if user:
        # Use session authentication
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    # Implement session logout logic if needed
    return Response({'message': 'Logged out successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    profile = get_object_or_404(UserProfile, user=request.user)
    serializer = UserProfileSerializer(profile, data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate token for the new user
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'token': str(refresh.access_token),
            'user': UserSerializer(user).data,
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)

class LoginView(views.APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        # Rate limiting
        ip = request.META.get('REMOTE_ADDR')
        cache_key = f'login_attempts_{ip}'
        attempts = cache.get(cache_key, 0)
        
        if attempts >= 5:  # Max 5 attempts
            return Response({
                'detail': 'Too many login attempts. Please try again later.'
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        if not email or not password:
            return Response({
                'detail': 'Please provide both email and password.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = authenticate(username=email, password=password)
            
            if user is None:
                # Increment failed attempts
                cache.set(cache_key, attempts + 1, 300)  # 5 minutes timeout
                return Response({
                    'detail': 'Invalid credentials.'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Reset attempts on successful login
            cache.delete(cache_key)
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            
            # Create response with user data
            response = Response({
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role
                }
            })
            
            # Set token cookies
            response.set_cookie(
                settings.SIMPLE_JWT['AUTH_COOKIE'],
                access_token,
                max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH']
            )
            
            response.set_cookie(
                settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
                refresh_token,
                max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH']
            )
            
            return response
            
        except Exception as e:
            return Response({
                'detail': 'An error occurred during login.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Logout a user by clearing their auth cookies
        """
        response = Response({"detail": "Successfully logged out."})
        
        # Clear auth cookies
        if settings.SIMPLE_JWT.get('AUTH_COOKIE'):
            response.delete_cookie(
                settings.SIMPLE_JWT['AUTH_COOKIE'],
                path=settings.SIMPLE_JWT.get('AUTH_COOKIE_PATH', '/')
            )
            
        if settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH'):
            response.delete_cookie(
                settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
                path=settings.SIMPLE_JWT.get('AUTH_COOKIE_PATH', '/')
            )
        
        return response

class UserView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        # Check if all fields are provided
        if not current_password or not new_password:
            return Response(
                {'detail': 'Please provide both current password and new password.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if current password is correct
        if not user.check_password(current_password):
            return Response(
                {'detail': 'Current password is incorrect.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Validate new password
        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response(
                {'detail': e.messages[0] if e.messages else 'Invalid password.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update password
        user.set_password(new_password)
        user.save()
        
        return Response(
            {'detail': 'Password updated successfully.'},
            status=status.HTTP_200_OK
        )

class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'phone', 'email', 'avatar', 'street', 'city', 'state', 'zipcode', 'country', 'is_default']
        
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user
        
        # Update UserProfile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update User fields
        if user_data:
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()
            
        instance.save()
        return instance

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            profile = request.user.profile
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response(
                {'detail': 'Profile not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def put(self, request):
        try:
            profile = request.user.profile
            serializer = UserProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except UserProfile.DoesNotExist:
            return Response(
                {'detail': 'Profile not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['street', 'city', 'state', 'zipcode', 'country', 'is_default']

class AddressView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            profile = request.user.profile
            serializer = AddressSerializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response(
                {'detail': 'Address not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def put(self, request):
        try:
            profile = request.user.profile
            serializer = AddressSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except UserProfile.DoesNotExist:
            return Response(
                {'detail': 'Profile not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

class AddressListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all addresses for the authenticated user"""
        addresses = Address.objects.filter(user=request.user)
        serializer = AddressSerializer(addresses, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Create a new address for the authenticated user"""
        serializer = AddressSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AddressDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk, user):
        """Get address object ensuring it belongs to the authenticated user"""
        try:
            return Address.objects.get(pk=pk, user=user)
        except Address.DoesNotExist:
            raise Http404
    
    def get(self, request, pk):
        """Get a specific address"""
        address = self.get_object(pk, request.user)
        serializer = AddressSerializer(address)
        return Response(serializer.data)
    
    def put(self, request, pk):
        """Update a specific address"""
        address = self.get_object(pk, request.user)
        serializer = AddressSerializer(address, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        """Delete a specific address"""
        address = self.get_object(pk, request.user)
        address.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class DefaultAddressView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request, pk):
        """Set an address as default for its type"""
        try:
            address = Address.objects.get(pk=pk, user=request.user)
            address.is_default = True
            address.save()
            return Response({'status': 'Address set as default'})
        except Address.DoesNotExist:
            return Response(
                {'detail': 'Address not found.'}, 
                status=status.HTTP_404_NOT_FOUND
            )

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        try:
            # Get credentials from request
            email = request.data.get('email')
            password = request.data.get('password')

            if not email or not password:
                return Response(
                    {'error': 'Please provide both email and password'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Authenticate user
            user = authenticate(email=email, password=password)
            
            if not user:
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Generate tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            # Create response
            response = Response({
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role
                }
            })

            # Set cookies
            response.set_cookie(
                settings.SIMPLE_JWT['AUTH_COOKIE'],
                access_token,
                max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH']
            )
            
            response.set_cookie(
                settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
                refresh_token,
                max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH']
            )

            return response

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CustomTokenRefreshView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        """
        Custom token refresh view that handles refresh tokens in cookies.
        This allows the frontend to refresh tokens without needing to
        extract the token from cookies.
        """
        try:
            # Get the refresh token from cookies
            refresh_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
            
            if not refresh_token:
                return Response(
                    {'detail': 'No refresh token provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create a RefreshToken instance
            refresh = RefreshToken(refresh_token)
            
            # Get a new access token
            access_token = str(refresh.access_token)
            
            # Create the response with an empty data payload
            response = Response({})
            
            # Set the new access token cookie
            response.set_cookie(
                settings.SIMPLE_JWT['AUTH_COOKIE'],
                access_token,
                max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH']
            )
            
            # If ROTATE_REFRESH_TOKENS is True, also update the refresh token
            if settings.SIMPLE_JWT.get('ROTATE_REFRESH_TOKENS', False):
                # Get a new refresh token
                new_refresh_token = str(refresh)
                
                # Set the new refresh token cookie
                response.set_cookie(
                    settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
                    new_refresh_token,
                    max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
                    httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                    samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                    secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                    path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH']
                )
                
                # If BLACKLIST_AFTER_ROTATION is True, blacklist the old token
                if getattr(settings, 'REST_FRAMEWORK_SIMPLEJWT', {}).get(
                    'BLACKLIST_AFTER_ROTATION', False
                ):
                    try:
                        # Attempt to blacklist the old token
                        from rest_framework_simplejwt.token_blacklist.models import (
                            BlacklistedToken, OutstandingToken
                        )
                        
                        outstanding_token = OutstandingToken.objects.get(
                            token=refresh_token
                        )
                        BlacklistedToken.objects.get_or_create(
                            token=outstanding_token
                        )
                    except ImportError:
                        # If the blacklist app is not installed, log a warning
                        import logging
                        logger = logging.getLogger(__name__)
                        logger.warning(
                            "The token has been rotated but the blacklist app is not "
                            "installed. You should consider installing it."
                        )
                    except Exception as e:
                        # If blacklisting fails for any other reason, log the error
                        import logging
                        logger = logging.getLogger(__name__)
                        logger.warning(
                            f"An error occurred while blacklisting a rotated token: {e}"
                        )
            
            return response
            
        except Exception as e:
            # Handle any exceptions that might occur during token refresh
            return Response(
                {'detail': str(e)},
                status=status.HTTP_401_UNAUTHORIZED
            )
