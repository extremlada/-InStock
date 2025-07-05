from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Account, TransactionType, Transaction, TransactionItem, raktar, reszleg

class AccountAdmin(UserAdmin):
    list_display = ('email', 'username', 'date_joined', 'last_login', 'is_admin', 'is_active', 'is_staff', 'is_superuser')
    search_fields = ('email', 'username')
    readonly_fields = ('date_joined', 'last_login')
    ordering = ('-date_joined',)
    filter_horizontal = ('allowed_warehouses', 'allowed_divisions')
    list_filter = ()
    fieldsets = ()

@admin.register(TransactionType)
class TransactionTypeAdmin(admin.ModelAdmin):
    list_display = ('code', 'label', 'description')
    search_fields = ('code', 'label')

class TransactionItemInline(admin.TabularInline):
    model = TransactionItem
    extra = 0

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('unique_number', 'transaction_type', 'created_at', 'user', 'source_warehouse', 'target_warehouse')
    search_fields = ('unique_number', 'note')
    list_filter = ('transaction_type', 'created_at', 'user', 'source_warehouse', 'target_warehouse')
    inlines = [TransactionItemInline]
    readonly_fields = ('unique_number', 'created_at')

@admin.register(raktar)
class RaktarAdmin(admin.ModelAdmin):
    list_display = ('name', 'Description', 'részleg')
    search_fields = ('name', 'Description')
    list_filter = ('részleg',)

@admin.register(reszleg)
class ReszlegAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

admin.site.register(Account, AccountAdmin)
