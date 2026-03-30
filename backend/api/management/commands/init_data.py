from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Specialization, Skill

User = get_user_model()


class Command(BaseCommand):
    help = 'Инициализирует данные приложения: создает админа, направления и скиллы'

    def handle(self, *args, **options):
        # Создание администратора
        self._create_admin()
        
        # Создание направлений и скиллов
        self._create_specializations_and_skills()

    def _create_admin(self):
        """Создает администратора если его еще нет"""
        admin_username = 'admin'
        admin_email = 'admin@gmail.com'
        admin_password = 'admin'

        if User.objects.filter(username=admin_username).exists():
            self.stdout.write(self.style.WARNING(f'Администратор "{admin_username}" уже существует'))
            return

        admin_user = User.objects.create_superuser(
            username=admin_username,
            email=admin_email,
            password=admin_password,
        )
        admin_user.role = 'ADMIN'
        admin_user.save()
        self.stdout.write(self.style.SUCCESS(f'Администратор "{admin_username}" успешно создан'))

    def _create_specializations_and_skills(self):
        """Создает 10 направлений и 50 скиллов"""
        specializations_data = [
            ('Backend', ['Python', 'Django', 'Flask', 'FastAPI', 'Java', 'Spring Boot', '.NET', 'C#']),
            ('Frontend', ['React', 'Vue.js', 'Angular', 'TypeScript', 'HTML', 'CSS', 'JavaScript', 'Next.js']),
            ('Mobile', ['Flutter', 'React Native', 'Swift', 'Kotlin', 'iOS', 'Android', 'Dart']),
            ('DevOps', ['Docker', 'Kubernetes', 'AWS', 'Azure', 'Jenkins', 'CI/CD', 'Linux']),
            ('Data Science', ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'SQL', 'Pandas', 'NumPy']),
            ('QA', ['Selenium', 'Pytest', 'JUnit', 'Test Automation', 'Manual Testing', 'API Testing']),
            ('Database', ['SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch']),
            ('Cloud', ['AWS', 'Google Cloud', 'Azure', 'Heroku', 'DigitalOcean']),
            ('Security', ['OAuth2', 'JWT', 'HTTPS', 'Encryption', 'Penetration Testing', 'Web Security']),
            ('Architecture', ['Microservices', 'System Design', 'REST API', 'GraphQL', 'SOLID']),
        ]

        for spec_name, skills_list in specializations_data:
            # Создание направления
            spec, created = Specialization.objects.get_or_create(name=spec_name)
            if created:
                self.stdout.write(f'Создано направление: {spec_name}')
            
            # Создание скиллов для этого направления
            for skill_name in skills_list:
                skill, created = Skill.objects.get_or_create(
                    name=skill_name,
                    defaults={'specialization': spec}
                )
                if created:
                    self.stdout.write(f'  + Скилл: {skill_name}')

        self.stdout.write(self.style.SUCCESS('Инициализация данных завершена'))
