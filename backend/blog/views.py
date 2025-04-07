from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from .models import BlogPost, Tag
from .serializers import (
    BlogPostListSerializer,
    BlogPostDetailSerializer,
    BlogPostCreateUpdateSerializer,
    TagSerializer,
    BlogPostSerializer
)

# Custom permission for admin users
class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_staff

# Public API endpoints
class BlogPostListView(generics.ListAPIView):
    serializer_class = BlogPostListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        # Only show published posts to the public
        queryset = BlogPost.objects.filter(is_published=True)
        
        # Filter by tag if provided in query params
        tag_slug = self.request.query_params.get('tag', None)
        if tag_slug:
            queryset = queryset.filter(tags__slug=tag_slug)
            
        return queryset

class BlogPostDetailView(generics.RetrieveAPIView):
    serializer_class = BlogPostDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    
    def get_queryset(self):
        # For public access, only allow published posts
        if not self.request.user.is_staff:
            return BlogPost.objects.filter(is_published=True)
        # For admin users, show all posts
        return BlogPost.objects.all()

# Admin-protected endpoints
class BlogPostCreateView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def post(self, request, *args, **kwargs):
        serializer = BlogPostCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            post = serializer.save()
            return Response(BlogPostDetailSerializer(post).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BlogPostUpdateView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_object(self, slug):
        return get_object_or_404(BlogPost, slug=slug)
    
    def put(self, request, slug, *args, **kwargs):
        post = self.get_object(slug)
        serializer = BlogPostCreateUpdateSerializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            updated_post = serializer.save()
            return Response(BlogPostDetailSerializer(updated_post).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BlogPostDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAdminUser]
    lookup_field = 'slug'
    queryset = BlogPost.objects.all()
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"detail": "Blog post deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

# Preview post (for admin use)
class BlogPostPreviewView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request, slug):
        post = get_object_or_404(BlogPost, slug=slug)
        serializer = BlogPostDetailSerializer(post)
        return Response(serializer.data)

# Tag API endpoints
class TagListView(generics.ListAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]

class TagDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'slug'

# If using ViewSets
class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    
    # Make sure create is in the allowed actions
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']  # 'post' must be here 

# Ensure your view allows POST for admins
def get_permissions(self):
    if self.request.method == 'POST':
        return [IsAdminUser()]
    return [IsAuthenticated()] 