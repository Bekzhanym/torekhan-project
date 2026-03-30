from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.db import models


# Create your models here
class User(AbstractUser):
    ROLE_CHOICES = [
        ('USER', 'User'),
        ('ADMIN', 'Admin'),
    ]
    
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='USER')

    def __str__(self):
        return self.username
    

class Specialization(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name
    
class Skill(models.Model):
    name = models.CharField(max_length=255, unique=True)
    specialization = models.ForeignKey(Specialization, on_delete=models.CASCADE, related_name='available_skills', null=True)

    def __str__(self):
        return self.name
    
class User_Specialization(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='specializations')
    specialization = models.ForeignKey('Specialization', on_delete=models.CASCADE, related_name='users')
    level = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])

    def __str__(self):
        return f"{self.user.username} - {self.specialization.name} (lvl {self.level})"
    
    class Meta:
        # Эта магия запретит дубликаты одного навыка внутри одного направления юзера
        unique_together = ('user', 'specialization')

class User_Specialization_Skill(models.Model):
    user_specialization = models.ForeignKey('User_Specialization', on_delete=models.CASCADE, related_name='skills')
    skill = models.ForeignKey('Skill', on_delete=models.CASCADE)
    level = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])

    class Meta:
        # Эта магия запретит дубликаты одного навыка внутри одного направления юзера
        unique_together = ('user_specialization', 'skill')
    
    def clean(self):
        # Проверяем, что скилл подходит к специализации
        if self.skill.specialization != self.user_specialization.specialization:
            raise ValidationError(
                f"Ошибка: Скилл '{self.skill.name}' не относится к направлению "
                f"'{self.user_specialization.specialization.name}'!"
            )

    def save(self, *args, **kwargs):
        # Принудительно запускаем проверку перед сохранением
        self.full_clean()
        super().save(*args, **kwargs)