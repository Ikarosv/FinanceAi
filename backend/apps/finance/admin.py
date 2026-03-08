from django.contrib import admin
from .models import Category, Transaction
# Register your models here.

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'type', 'user', 'icon')
    list_filter = ('type', 'user')
    search_fields = ('name',)

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'description', 'amount', 'type', 'date', 'user', 'category')
    list_filter = ('type', 'date', 'user')
    search_fields = ('description',)