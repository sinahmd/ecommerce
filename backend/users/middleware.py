from django.utils.functional import SimpleLazyObject
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings

def auth_cookie_middleware(get_response):
    def middleware(request):
        request.jwt_auth = JWTAuthentication()
        
        # Check for token in cookies
        if 'access_token' in request.COOKIES:
            request.META['HTTP_AUTHORIZATION'] = f"Bearer {request.COOKIES.get('access_token')}"
        
        # Handle preflight requests
        if request.method == 'OPTIONS':
            response = get_response(request)
            response['Access-Control-Allow-Origin'] = request.META.get('HTTP_ORIGIN', settings.CORS_ALLOWED_ORIGINS[0])
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Allow-Methods'] = ','.join(settings.CORS_ALLOW_METHODS)
            response['Access-Control-Allow-Headers'] = ','.join(settings.CORS_ALLOW_HEADERS)
            response['Access-Control-Max-Age'] = str(settings.CORS_PREFLIGHT_MAX_AGE)
            return response
            
        response = get_response(request)
        
        # Add CORS headers to response
        if 'HTTP_ORIGIN' in request.META and request.META['HTTP_ORIGIN'] in settings.CORS_ALLOWED_ORIGINS:
            response['Access-Control-Allow-Origin'] = request.META['HTTP_ORIGIN']
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Expose-Headers'] = ','.join(settings.CORS_EXPOSE_HEADERS)
            
        return response
    return middleware 