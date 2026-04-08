from rest_framework import generics
from rest_framework import filters
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .models import User, User_Specialization, User_Specialization_Skill, Skill, Specialization
from .serializers import SpecializationSerializer, SkillSerializer, UserSerializer, UserRegisterSerializer, UserSpecializationCreateSerializer, UserSpecializationUpdateSerializer, UserSkillCreateSerializer, UserSkillUpdateSerializer, MyTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .permissions import IsAdmin


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class SpecializationsListAPIView(generics.ListAPIView):
    queryset = Specialization.objects.all()
    serializer_class = SpecializationSerializer

class SkillsListAPIView(generics.ListAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer

class UserListAPIView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    # ordering filter
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['username', 'date_joined']
    ordering = ['username']
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'ordering', 
                openapi.IN_QUERY, 
                description="Сортировка. Для обратного порядка добавьте '-' (напр. -username)", 
                type=openapi.TYPE_STRING, 
                # Вот здесь мы создаем Dropdown!
                enum=['username', '-username', 'date_joined', '-date_joined']
            ),
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

class UserDetailAPIView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
class UserDetailByUsernameAPIView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'username'

class UsersBySkillAPIView(generics.ListAPIView):
    serializer_class = UserSerializer

    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['specializations__skills__level', 'username', 'date_joined']
    ordering = ['-specializations__skills__level']

    def get_queryset(self):
        skill_id = self.kwargs['skill_id']
        # Здесь мы ТОЛЬКО фильтруем, но НЕ сортируем. 
        # Сортировку возьмет на себя OrderingFilter.
        return User.objects.filter(specializations__skills__skill_id=skill_id).distinct()
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'ordering', 
                openapi.IN_QUERY, 
                description="Сортировка. Для обратного порядка добавьте '-' (напр. -username)", 
                type=openapi.TYPE_STRING, 
                # Вот здесь мы создаем Dropdown!
                enum=['username', '-username', 'date_joined', '-date_joined']
            ),
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
class UsersBySpecializationAPIView(generics.ListAPIView):
    serializer_class = UserSerializer

    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['specializations__level', 'username', 'date_joined']
    ordering = ['-specializations__level']
    
    def get_queryset(self):
        spec_id = self.kwargs['spec_id']
        #filtering and sorting the queryset
        return User.objects.filter(specializations__specialization_id=spec_id).distinct()
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'ordering', 
                openapi.IN_QUERY, 
                description="Сортировка. Для обратного порядка добавьте '-' (напр. -username)", 
                type=openapi.TYPE_STRING, 
                # Вот здесь мы создаем Dropdown!
                enum=['username', '-username', 'date_joined', '-date_joined']
            ),
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)




class UserCreateAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    
class UserProfileAPIView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'patch', 'head', 'options']
    # Добавляем кверисет обязательно!
    queryset = User.objects.all() 
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class UserSpecializationCreateAPIView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSpecializationCreateSerializer


class UserSpecializationUpdateAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    http_method_names = ['patch', 'delete', 'head', 'options']
    serializer_class = UserSpecializationUpdateSerializer
    

    def get_queryset(self):
        # Юзер может дергать только свои записи
        return User_Specialization.objects.filter(user=self.request.user)


class UserSkillCreateAPIView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSkillCreateSerializer
    

class UserSkillUpdateAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    http_method_names = ['patch', 'delete', 'head', 'options']
    serializer_class = UserSkillUpdateSerializer

    def get_queryset(self):
        # Фильтруем через связь со специализацией юзера
        return User_Specialization_Skill.objects.filter(user_specialization__user=self.request.user)





# ADMIN ENDPOINTS

class AdminSpecializationCreateAPIView(generics.CreateAPIView):
    """Создание новой специализации (только для ADMIN)"""
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Specialization.objects.all()
    serializer_class = SpecializationSerializer


class AdminSpecializationUpdateAPIView(generics.UpdateAPIView):
    """Обновление специализации (только для ADMIN)"""
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Specialization.objects.all()
    serializer_class = SpecializationSerializer
    http_method_names = ['put', 'patch', 'head', 'options']


class AdminSpecializationDeleteAPIView(generics.DestroyAPIView):
    """Удаление специализации (только для ADMIN)"""
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Specialization.objects.all()
    http_method_names = ['delete', 'head', 'options']


class AdminSkillCreateAPIView(generics.CreateAPIView):
    """Создание нового скилла (только для ADMIN)"""
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer


class AdminSkillUpdateAPIView(generics.UpdateAPIView):
    """Обновление скилла (только для ADMIN)"""
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    http_method_names = ['put', 'patch', 'head', 'options']


class AdminSkillDeleteAPIView(generics.DestroyAPIView):
    """Удаление скилла (только для ADMIN)"""
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Skill.objects.all()
    http_method_names = ['delete', 'head', 'options']
