from django.db import models
from django.utils.text import slugify
from django.utils import timezone

class Tag(models.Model):
    name = models.CharField(max_length=50)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class BlogPost(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=250, unique=True, blank=True)
    content = models.TextField()
    excerpt = models.TextField(max_length=500, blank=True)
    cover_image = models.ImageField(upload_to='blog/covers/', blank=True, null=True)
    tags = models.ManyToManyField(Tag, blank=True, related_name='posts')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    # SEO fields
    meta_title = models.CharField(max_length=100, blank=True)
    meta_description = models.TextField(max_length=160, blank=True)
    canonical_url = models.URLField(blank=True)
    is_published = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Blog Post'
        verbose_name_plural = 'Blog Posts'
    
    def __str__(self):
        return self.title
    
    def get_absolute_url(self):
        return f"/blog/{self.slug}/" 