from django.db import models
from django.conf import settings

# Create your models here.

class Category(models.Model):
    class CategoryType(models.TextChoices):
        INCOME = 'IN', 'Income'
        EXPENSE = 'OUT', 'Expense'
    
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=3, choices=CategoryType.choices)
    icon = models.CharField(max_length=10, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='categories',
        null=True,
        blank=True
    )
    
    class Meta:
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['type', 'name']
        unique_together = ('name', 'type', 'user')  # Evita categorias duplicadas para o mesmo usuário

    def __str__(self):
        return f"{self.icon} {self.name} ({self.get_type_display()})"

class Transaction(models.Model):
    """
    Modelo para representar um lançamento financeiro (transação). Pode ser tanto uma entrada (income) quanto uma saída (expense).
    
    Atributos:
    - description: descrição do lançamento (ex: "Salário de Agosto", "Compra no supermercado") - Max 255 caracteres
    - amount: valor do lançamento, com até 10 dígitos no total e 2 casas decimais (ex: 1500.00, 45.99)
    - type: tipo do lançamento, pode ser "IN" para entrada (income) ou "OUT" para saída (expense)
    - date: data do lançamento (ex: 2024-08-15)
    - created_at: data e hora de criação do registro (preenchido automaticamente)
    - user: chave estrangeira para o usuário que criou a transação (relacionamento com o modelo User)
    - category: chave estrangeira para a categoria associada (relacionamento com o modelo Category, pode ser nulo para transações sem categoria)
    """
    
    class TransactionType(models.TextChoices):
        INCOME = 'IN', 'Income (Entrada)'
        EXPENSE = 'OUT', 'Expense (Saída)'

    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(
        max_length=3, 
        choices=TransactionType.choices
    )
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    category = models.ForeignKey(
        'Category', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='transactions'
    )
    
    class Meta:
        verbose_name = 'Transaction'
        verbose_name_plural = 'Transactions'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.description} - R$ {self.amount}"
