from rest_framework import serializers
from .models import BlogPost, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']


class BlogPostListSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'cover_image',
            'tags', 'created_at', 'updated_at', 'is_published'
        ]


class BlogPostDetailSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt', 
            'cover_image', 'tags', 'created_at', 'updated_at',
            'meta_title', 'meta_description', 'canonical_url', 
            'is_published'
        ]


class BlogPostCreateUpdateSerializer(serializers.ModelSerializer):
    tags = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), 
        many=True, 
        required=False
    )
    cover_image = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt', 
            'cover_image', 'tags', 'meta_title', 'meta_description', 
            'canonical_url', 'is_published'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        post = BlogPost.objects.create(**validated_data)
        post.tags.set(tags_data)
        return post
    
    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if tags_data is not None:
            instance.tags.set(tags_data)
            
        instance.save()
        return instance


class BlogPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt', 
            'cover_image', 'tags', 'created_at', 'updated_at',
            'meta_title', 'meta_description', 'canonical_url', 'is_published'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at'] 