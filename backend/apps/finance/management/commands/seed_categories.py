from django.core.management.base import BaseCommand
from apps.finance.models import Category

class Command(BaseCommand):
    help = 'Cria as categorias globais padrão do sistema'

    def handle(self, *args, **options):
        # Lista de categorias globais (user é None por padrão)
        categories = [
            {'name': 'Alimentação', 'icon': '🍔', 'type': 'OUT'},
            {'name': 'Saúde', 'icon': '🏥', 'type': 'OUT'},
            {'name': 'Transporte', 'icon': '🚗', 'type': 'OUT'},
            {'name': 'Lazer', 'icon': '🎮', 'type': 'OUT'},
            {'name': 'Educação', 'icon': '📚', 'type': 'OUT'},
            {'name': 'Moradia', 'icon': '🏠', 'type': 'OUT'},
            {'name': 'Salário', 'icon': '💰', 'type': 'IN'},
            {'name': 'Investimentos', 'icon': '📈', 'type': 'IN'},
            {'name': 'Presentes', 'icon': '🎁', 'type': 'IN'},
            {'name': 'Outros (saída)', 'icon': '➖', 'type': 'OUT'},
            {'name': 'Outros (entrada)', 'icon': '➕', 'type': 'IN'},
        ]

        for cat in categories:
            # get_or_create evita duplicar se você rodar o comando duas vezes
            obj, created = Category.objects.get_or_create(
                name=cat['name'],
                type=cat['type'],
                user=None, # Define como Global
                defaults={'icon': cat['icon']}
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'Categoria "{cat["name"]}" criada!'))
            else:
                self.stdout.write(f'Categoria "{cat["name"]}" já existe.')