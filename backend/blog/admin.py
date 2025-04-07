from django.contrib import admin
from .models import BlogPost, Tag

class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at', 'updated_at', 'is_published')
    list_filter = ('is_published', 'created_at', 'tags')
    search_fields = ('title', 'content', 'excerpt')
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ('tags',)
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('title', 'slug', 'content', 'excerpt', 'cover_image', 'tags')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description', 'canonical_url')
        }),
        ('Publication', {
            'fields': ('is_published', 'created_at', 'updated_at')
        }),
    )

class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)

admin.site.register(BlogPost, BlogPostAdmin)
admin.site.register(Tag, TagAdmin) 