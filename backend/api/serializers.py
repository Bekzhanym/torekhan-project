from rest_framework import serializers
from .models import User, Specialization, Skill, User_Specialization, User_Specialization_Skill
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

### JWT Token ###

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # ДОБАВЛЯЕМ СВОИ ПОЛЯ В ТОКЕН
        token['username'] = user.username
        token['role'] = user.role
        
        return token





class SpecializationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialization
        fields = ['id', 'name']

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'specialization']

class UserSkillSerializer(serializers.ModelSerializer):
    # Переименовываем ID связки в user_skill_id
    user_skill_id = serializers.IntegerField(source='id', read_only=True)
    skill_name = serializers.ReadOnlyField(source='skill.name')
    # ID самого скилла (например, 5 для Python)
    skill_id = serializers.ReadOnlyField(source='skill.id') 

    class Meta:
        model = User_Specialization_Skill
        fields = ['skill_id', 'skill_name', 'user_skill_id', 'level']

class UserSpecializationSerializer(serializers.ModelSerializer):
    # Переименовываем ID связки в user_spec_id
    user_spec_id = serializers.IntegerField(source='id', read_only=True)
    spec_name = serializers.ReadOnlyField(source='specialization.name')
    spec_id = serializers.ReadOnlyField(source='specialization.id')
    skills = UserSkillSerializer(many=True, read_only=True)

    class Meta:
        model = User_Specialization
        fields = ['spec_id', 'spec_name', 'user_spec_id', 'level', 'skills']

class UserSerializer(serializers.ModelSerializer):
    specializations = UserSpecializationSerializer(many=True, read_only=True)

    class Meta: 
        model = User
        fields = ['id', 'username', 'email', 'role', 'specializations']
        # Поле id обычно только для чтения
        read_only_fields = ['id', 'username', 'role']





class UserRegisterSerializer(serializers.ModelSerializer):
    # Указываем, что пароль только для записи (не будет отображаться в GET ответах)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        # Используем специальный метод create_user, который сам захеширует пароль
        # role по умолчанию будет USER за счет default='USER' в моделе
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role='USER'
        )
        return user
    
class UserSpecializationCreateSerializer(serializers.ModelSerializer):
    user_spec_id = serializers.IntegerField(source='id', read_only=True)
    spec_name = serializers.ReadOnlyField(source='specialization.name')
    specialization_id = serializers.PrimaryKeyRelatedField(
        queryset=Specialization.objects.all(),
        source='specialization' 
    )

    class Meta:
        model = User_Specialization
        fields = ['user_spec_id', 'specialization_id', 'spec_name', 'level']

    def validate(self, data):
        user = self.context['request'].user
        spec = data.get('specialization')
        if User_Specialization.objects.filter(user=user, specialization=spec).exists():
            raise serializers.ValidationError("Эта специализация уже добавлена.")
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        return User_Specialization.objects.create(user=user, **validated_data)
    
class UserSpecializationUpdateSerializer(serializers.ModelSerializer):
    user_spec_id = serializers.IntegerField(source='id', read_only=True)
    spec_name = serializers.ReadOnlyField(source='specialization.name')
    specialization_id = serializers.IntegerField(source='specialization.id', read_only=True)

    class Meta:
        model = User_Specialization
        fields = ['user_spec_id', 'specialization_id', 'spec_name', 'level']
    
class UserSkillCreateSerializer(serializers.ModelSerializer):
    user_skill_id = serializers.IntegerField(source='id', read_only=True)
    user_spec_id = serializers.PrimaryKeyRelatedField(
        queryset=User_Specialization.objects.all(),
        source='user_specialization'
    )
    skill_id = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(),
        source='skill'
    )
    skill_name = serializers.ReadOnlyField(source='skill.name')

    class Meta:
        model = User_Specialization_Skill
        fields = ['user_skill_id', 'user_spec_id', 'skill_id', 'skill_name', 'level']

    def validate(self, data):
        user = self.context['request'].user
        user_spec = data['user_specialization']
        target_skill = data['skill']

        # 1. Проверка: принадлежит ли эта ветка (например, Backend) текущему юзеру
        if user_spec.user != user:
            raise serializers.ValidationError("Вы не можете добавлять скиллы в чужой профиль!")
        # 2. Проверка: соответствует ли скилл выбранному направлению
        if target_skill.specialization != user_spec.specialization:
            raise serializers.ValidationError({
                "skill_id": f"Скилл '{target_skill.name}' не относится к направлению '{user_spec.specialization.name}'!"
            })
        # 3. Проверка: нет ли уже этого скилла у этого юзера?
        if User_Specialization_Skill.objects.filter(user_specialization=user_spec, skill=target_skill).exists():
            raise serializers.ValidationError("Этот навык уже добавлен в данную специализацию.")

        return data

    def create(self, validated_data):
        # Здесь уже всё чисто: DRF сам подставил объекты благодаря source
        return User_Specialization_Skill.objects.create(**validated_data)
    
class UserSkillUpdateSerializer(serializers.ModelSerializer):
    user_skill_id = serializers.IntegerField(source='id', read_only=True)
    skill_name = serializers.ReadOnlyField(source='skill.name')
    user_spec_id = serializers.IntegerField(source='user_specialization.id', read_only=True)
    skill_id = serializers.IntegerField(source='skill.id', read_only=True)

    class Meta:
        model = User_Specialization_Skill
        fields = ['user_skill_id', 'user_spec_id', 'skill_id', 'skill_name', 'level']