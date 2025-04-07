from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.utils.text import slugify
from .models import BlogPost, Tag

@receiver(pre_save, sender=BlogPost)
def generate_blog_post_slug(sender, instance, **kwargs):
    if not instance.slug:
        instance.slug = slugify(instance.title)
        
    if not instance.meta_title:
        instance.meta_title = instance.title
        
    if not instance.meta_description and instance.excerpt:
        instance.meta_description = instance.excerpt[:157] + '...' if len(instance.excerpt) > 160 else instance.excerpt

@receiver(pre_save, sender=Tag)
def generate_tag_slug(sender, instance, **kwargs):
    if not instance.slug:
        instance.slug = slugify(instance.name) 