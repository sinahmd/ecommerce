from django.db import models
from django.conf import settings

# Create your models here.

class DashboardSetting(models.Model):
    name = models.CharField(max_length=100, unique=True)
    value = models.TextField(default='{}')  # Default empty JSON object
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class AdminActivity(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    action = models.CharField(max_length=100, default='unknown_action')
    details = models.TextField(default='No details provided')
    ip_address = models.GenericIPAddressField(default='0.0.0.0')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = 'Admin Activities'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.action} - {self.created_at}"
