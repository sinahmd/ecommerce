from django.utils.functional import SimpleLazyObject
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings
from django.http import JsonResponse
import json

def auth_cookie_middleware(get_response):
    def middleware(request):
        # Set up JWT authentication
        request.jwt_auth = JWTAuthentication()
        
        # Check for token in cookies and add it to the Authorization header
        if 'access_token' in request.COOKIES:
            token = request.COOKIES.get('access_token')
            request.META['HTTP_AUTHORIZATION'] = f"Bearer {token}"
        
        # Handle preflight OPTIONS requests to support CORS
        if request.method == 'OPTIONS':
            response = get_response(request)
            
            # Set CORS headers for OPTIONS requests
            if 'HTTP_ORIGIN' in request.META and request.META['HTTP_ORIGIN'] in settings.CORS_ALLOWED_ORIGINS:
                response['Access-Control-Allow-Origin'] = request.META['HTTP_ORIGIN']
                response['Access-Control-Allow-Credentials'] = 'true'
                response['Access-Control-Allow-Methods'] = ','.join(settings.CORS_ALLOW_METHODS)
                response['Access-Control-Allow-Headers'] = ','.join(settings.CORS_ALLOW_HEADERS)
                response['Access-Control-Max-Age'] = str(settings.CORS_PREFLIGHT_MAX_AGE)
            
            return response
        
        # Special handling for non-GET requests that need CSRF protection
        if request.method not in ['GET', 'HEAD', 'OPTIONS'] and hasattr(request, 'body'):
            # Only process if it's a JSON request
            content_type = request.META.get('CONTENT_TYPE', '')
            if 'application/json' in content_type:
                # Check for CSRF token in headers
                csrf_token = request.META.get('HTTP_X_CSRFTOKEN')
                cookie_csrf = request.COOKIES.get('csrftoken')
                
                # If we have both tokens and they don't match, return an error
                if csrf_token and cookie_csrf and csrf_token != cookie_csrf:
                    return JsonResponse({
                        'detail': 'CSRF Failed: CSRF token missing or incorrect.'
                    }, status=403)
        
        # Process the request
        response = get_response(request)
        
        # Add CORS headers to the response for non-OPTIONS requests
        if 'HTTP_ORIGIN' in request.META and request.META['HTTP_ORIGIN'] in settings.CORS_ALLOWED_ORIGINS:
            response['Access-Control-Allow-Origin'] = request.META['HTTP_ORIGIN']
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Expose-Headers'] = ','.join(settings.CORS_EXPOSE_HEADERS)
        
        return response
    
    return middleware
    return middleware 