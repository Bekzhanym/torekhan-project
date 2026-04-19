from rest_framework import serializers
from .models import User, Specialization, Skill, User_Specialization, User_Specialization_Skill, Post, Apply
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
        fields = ['id', 'username', 'email', 'telegram', 'phone_number', 'role', 'specializations']
        # Поле id обычно только для чтения
        read_only_fields = ['id', 'username', 'role', 'email']

    def validate(self, attrs):
        if self.instance:
            # Получаем список полей, которые фронт реально прислал в запросе
            incoming_data = self.initial_data
            
            for field in self.Meta.read_only_fields:
                if field in incoming_data:
                    # Сравниваем присланное значение с тем, что уже есть в базе
                    new_value = incoming_data.get(field)
                    old_value = getattr(self.instance, field)
                    
                    # Если значения разные — кидаем ошибку
                    if str(new_value) != str(old_value):
                        raise serializers.ValidationError({
                            field: f"Поле '{field}' менять нельзя, оно только для чтения."
                        })
        return attrs


class PostSerializer(serializers.ModelSerializer):
    skills_required = SkillSerializer(many=True, read_only=True)
    author = UserSerializer()
    class Meta:
        model = Post
        fields = ['id', 'author', 'description', 'skills_required', 'created_at', 'contact_link']



### CREATE UPDATE DELETE ###

class UserRegisterSerializer(serializers.ModelSerializer):
    # Указываем, что пароль только для записи (не будет отображаться в GET ответах)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'telegram', 'phone_number', 'password']

    def create(self, validated_data):
        # Используем специальный метод create_user, который сам захеширует пароль
        # role по умолчанию будет USER за счет default='USER' в моделе
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            telegram=validated_data.get('telegram'),
            phone_number=validated_data.get('phone_number'),
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
        
        
class PostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'author', 'description', 'created_at', 'skills_required', 'contact_link']
        read_only_fields = ['id', 'author', 'created_at']
    
    def create(self, validated_data):
        user = self.context['request'].user
        skills_data = validated_data.pop('skills_required', [])

        post = Post.objects.create(author=user, **validated_data) # Добавляем автора
        post.skills_required.set(skills_data)
        return post
    
class PostUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['description', 'contact_link', 'skills_required']

    def update(self, instance, validated_data):
        # 1. Получаем списки из сырых данных запроса
        # Мы берем их из self.context['request'].data, так как этих полей нет в модели
        request_data = self.context['request'].data
        skills_to_add = request_data.get('skills_to_add', [])
        skills_to_remove = request_data.get('skills_to_remove', [])

        # 2. Обновляем обычные поля (description, contact_link)
        # validated_data уже содержит проверенные данные для полей из Meta.fields
        for attr, value in validated_data.items():
            if attr != 'skills_required': # Скиллы обработаем отдельно
                setattr(instance, attr, value)
        instance.save()

        # 3. Обработка добавления скиллов
        if skills_to_add:
            # * — это распаковка списка в аргументы для метода .add()
            instance.skills_required.add(*skills_to_add)

        # 4. Обработка удаления скиллов
        if skills_to_remove:
            instance.skills_required.remove(*skills_to_remove)

        # 5. Если прислали стандартный skills_required, 
        # то ведем себя как обычно (перезаписываем всё)
        if 'skills_required' in validated_data:
            instance.skills_required.set(validated_data['skills_required'])

        return instance
    
class ApplyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Apply
        fields = ['user', 'post', 'description']
        read_only_fields = ['user']
    
    def validate(self, attrs):
        user = self.context['request'].user
        post = attrs.get('post')

        # Проверяем, существует ли уже такая запись
        if Apply.objects.filter(user=user, post=post).exists():
            raise serializers.ValidationError("Вы уже подали заявку на этот пост.")
        
        return attrs
    
    def create(self, validated_data):
        user = self.context["request"].user
        apply = Apply.objects.create(user=user, **validated_data)
        return apply

class ApplicationSerializer(serializers.ModelSerializer):
    """Serializer для получения информации о заявке с полной информацией об юзере"""
    user = UserSerializer(read_only=True)
    post = serializers.IntegerField(source='post.id', read_only=True)
    
    class Meta:
        model = Apply
        fields = ['user', 'post', 'description']