from django.db import models
from django.utils.text import slugify

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    meta_title = models.CharField(max_length=70, blank=True, help_text="SEO optimized title (70 chars max)")
    meta_description = models.CharField(max_length=160, blank=True, help_text="SEO meta description (160 chars max)")
    schema_type = models.CharField(max_length=50, default="CategoryPage", help_text="Schema.org type")
    canonical_url = models.URLField(blank=True, null=True, help_text="Canonical URL if different from the default")

    class Meta:
        app_label = 'products'
        verbose_name_plural = 'Categories'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        # Auto-generate meta title and description if not provided
        if not self.meta_title:
            self.meta_title = self.name[:70]
        if not self.meta_description and self.description:
            self.meta_description = self.description[:157] + '...' if len(self.description) > 160 else self.description
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    stock = models.IntegerField(default=0)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # SEO Fields
    meta_title = models.CharField(max_length=70, blank=True, help_text="SEO optimized title (70 chars max)")
    meta_description = models.CharField(max_length=160, blank=True, help_text="SEO meta description (160 chars max)")
    schema_type = models.CharField(max_length=50, default="Product", help_text="Schema.org type")
    canonical_url = models.URLField(blank=True, null=True, help_text="Canonical URL if different from the default")
    
    # Additional Product Info for Schema.org
    brand = models.CharField(max_length=100, blank=True)
    sku = models.CharField(max_length=100, blank=True)
    weight = models.CharField(max_length=50, blank=True, help_text="Product weight with unit (e.g., 2.5 kg)")
    dimensions = models.CharField(max_length=100, blank=True, help_text="Product dimensions (e.g., 10x20x30 cm)")
    mpn = models.CharField(max_length=100, blank=True, help_text="Manufacturer Part Number")
    gtin = models.CharField(max_length=100, blank=True, help_text="Global Trade Item Number (GTIN/UPC/EAN)")

    class Meta:
        app_label = 'products'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        # Auto-generate meta title and description if not provided
        if not self.meta_title:
            self.meta_title = f"{self.name} - {self.brand}" if self.brand else self.name
            self.meta_title = self.meta_title[:70]
        if not self.meta_description and self.description:
            self.meta_description = self.description[:157] + '...' if len(self.description) > 160 else self.description
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
