from django.contrib import admin
from django import forms
from .models import Product, Category

class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'has_meta_title', 'has_meta_description')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'description')
    list_filter = ('schema_type',)
    readonly_fields = ('created_at', 'updated_at') if hasattr(Category, 'created_at') else ()
    
    fieldsets = (
        (None, {
            'fields': ('name', 'slug', 'description'),
        }),
        ('SEO Options', {
            'fields': ('meta_title', 'meta_description', 'schema_type', 'canonical_url'),
            'classes': ('collapse',),
        }),
    )
    
    def has_meta_title(self, obj):
        return bool(obj.meta_title)
    has_meta_title.boolean = True
    has_meta_title.short_description = 'Meta Title'
    
    def has_meta_description(self, obj):
        return bool(obj.meta_description)
    has_meta_description.boolean = True
    has_meta_description.short_description = 'Meta Description'

class ProductAdminForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = '__all__'
        widgets = {
            'meta_title': forms.TextInput(attrs={'maxlength': 70, 'class': 'char-counter'}),
            'meta_description': forms.Textarea(attrs={'maxlength': 160, 'rows': 3, 'class': 'char-counter'}),
        }

class ProductAdmin(admin.ModelAdmin):
    form = ProductAdminForm
    list_display = ('name', 'category', 'price', 'stock', 'is_available', 'has_meta_title', 'has_meta_description')
    list_filter = ('is_available', 'category', 'created_at')
    search_fields = ('name', 'description', 'meta_title', 'meta_description')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (None, {
            'fields': ('name', 'slug', 'description', 'price', 'stock', 'is_available', 'category', 'image'),
        }),
        ('SEO Options', {
            'fields': ('meta_title', 'meta_description', 'schema_type', 'canonical_url'),
            'classes': ('collapse',),
            'description': 'These fields are used for search engine optimization.'
        }),
        ('Product Details (Schema.org)', {
            'fields': ('brand', 'sku', 'weight', 'dimensions', 'mpn', 'gtin'),
            'classes': ('collapse',),
            'description': 'Additional product details for rich snippets in search results.'
        }),
    )
    
    def has_meta_title(self, obj):
        return bool(obj.meta_title)
    has_meta_title.boolean = True
    has_meta_title.short_description = 'Meta Title'
    
    def has_meta_description(self, obj):
        return bool(obj.meta_description)
    has_meta_description.boolean = True
    has_meta_description.short_description = 'Meta Description'
    
    class Media:
        css = {
            'all': ('admin/css/seo-fields.css',)
        }
        js = ('admin/js/seo-character-counter.js',)

admin.site.register(Category, CategoryAdmin)
admin.site.register(Product, ProductAdmin)
