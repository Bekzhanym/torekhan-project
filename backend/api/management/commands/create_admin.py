from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Создает администратора при первом запуске, если он не существует'

    def handle(self, *args, **options):
        admin_username = 'admin'
        admin_email = 'admin@gmail.com'
        admin_password = 'admin'

        # Проверяем, существует ли администратор
        if User.objects.filter(username=admin_username).exists():
            self.stdout.write(self.style.WARNING(f'Администратор "{admin_username}" уже существует'))
            return

        # Создаем администратора
        admin_user = User.objects.create_user(
            username=admin_username,
            email=admin_email,
            password=admin_password,
            role='ADMIN'
        )

        self.stdout.write(
            self.style.SUCCESS(f'✅ Администратор "{admin_username}" успешно создан')
        )
