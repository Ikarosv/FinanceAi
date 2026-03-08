from rest_framework import serializers
from .models import Category, Transaction

class CategorySerializer(serializers.ModelSerializer):
    is_personal = serializers.SerializerMethodField()

    class Meta: 
        model = Category
        fields = ['id', 'name', 'type', 'icon', 'is_personal']

    def get_is_personal(self, obj):
        # Se tiver um usuário, é pessoal. Se for None, é do sistema.
        return obj.user is not None


class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    category_icon = serializers.ReadOnlyField(source='category.icon')

    class Meta:
        model = Transaction
        fields = [
            'id', 'description', 'amount', 'type', 
            'date', 'category', 'category_name', 'category_icon', 'created_at'
        ]

    def validate_category(self, value):
        """
        Valida se a categoria enviada é global ou pertence ao usuário logado.
        """
        user = self.context['request'].user
        
        # Se a categoria existe, mas não é global e não pertence ao usuário
        if value and value.user is not None and value.user != user:
            raise serializers.ValidationError(
                "Você não tem permissão para usar esta categoria."
            )
        return value

    def create(self, validated_data):
        # Garante que a transação seja salva vinculada ao usuário logado
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)