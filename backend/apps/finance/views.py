from django.shortcuts import render
from rest_framework import viewsets, exceptions, permissions
from .models import Category, Transaction
from django.db.models import Q
from .serializers import TransactionSerializer, CategorySerializer


# Create your views here.

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Category.objects.filter(
        Q(user__isnull=True) | Q(user=self.request.user)
    ).order_by('user', 'name')
        
    def perform_create(self, serializer):
        # Garante que a categoria seja salva vinculada ao usuário logado
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        # Se a categoria não tiver um usuário associado, ela é global
        if instance.user is None:
            raise exceptions.PermissionDenied("Você não pode excluir uma categoria do sistema.")
        instance.delete()

    def perform_update(self, serializer):
        if serializer.instance.user is None:
            raise exceptions.PermissionDenied("Você não pode editar uma categoria do sistema.")
        serializer.save(user=self.request.user)


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # O usuário só vê as transações que ele criou
        return Transaction.objects.filter(user=self.request.user).order_by('-date')

    def perform_destroy(self, instance):
        # Garante que o usuário só possa excluir suas próprias transações
        if instance.user != self.request.user:
            raise exceptions.PermissionDenied("Você não tem permissão para excluir esta transação.")
        instance.delete()
    
    def perform_update(self, serializer):
        # Garante que o usuário só possa editar suas próprias transações
        if serializer.instance.user != self.request.user:
            raise exceptions.PermissionDenied("Você não tem permissão para editar esta transação.")
        serializer.save(user=self.request.user)
    
    def perform_create(self, serializer):
        # Garante que a transação seja salva vinculada ao usuário logado
        serializer.save(user=self.request.user)