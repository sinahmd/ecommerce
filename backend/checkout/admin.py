from django.contrib import admin
from .models import Order, OrderItem, Transaction

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['total_price']

class TransactionInline(admin.TabularInline):
    model = Transaction
    extra = 0
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'full_name', 'total_price', 'status', 'payment_status', 'created_at']
    list_filter = ['status', 'payment_status', 'created_at']
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [OrderItemInline, TransactionInline]
    list_per_page = 20
    
    fieldsets = (
        ('Customer Information', {
            'fields': ('user', 'first_name', 'last_name', 'email', 'phone')
        }),
        ('Address', {
            'fields': ('address', 'city', 'state', 'country', 'zip_code')
        }),
        ('Order Details', {
            'fields': ('status', 'payment_status', 'total_price', 'shipping_cost')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'amount', 'ref_id', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['ref_id', 'authority', 'card_pan']
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 20
    
    fieldsets = (
        ('Transaction Details', {
            'fields': ('order', 'amount', 'status', 'status_code')
        }),
        ('ZarinPal Information', {
            'fields': ('authority', 'ref_id', 'card_pan', 'card_hash', 'fee_type', 'fee')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
