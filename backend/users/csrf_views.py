from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET

@require_GET
@ensure_csrf_cookie
def get_csrf_token(request):
    """
    This view does nothing but set a CSRF cookie.
    The @ensure_csrf_cookie decorator forces a cookie to be set,
    which is then returned to the client.
    """
    return JsonResponse({"detail": "CSRF cookie set"}) 