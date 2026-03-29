from rest_framework import generics
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated
from .models import User, User_Specialization, User_Specialization_Skill, Skill, Specialization
from .serializers import SpecializationSerializer, SkillSerializer, UserSerializer, UserRegisterSerializer, UserSpecializationCreateSerializer, UserSpecializationUpdateSerializer, UserSkillCreateSerializer, UserSkillUpdateSerializer

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
    filter_backends = [OrderingFilter]
    ordering_fields = ['username', 'date_joined']
    ordering = ['username']

class UserDetailAPIView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
class UserDetailByUsernameAPIView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'username'

class UsersBySkillAPIView(generics.ListAPIView):
    serializer_class = UserSerializer

    filter_backends = [OrderingFilter]
    ordering_fields = ['specializations__skills__level', 'username', 'date_joined']
    ordering = ['-specializations__skills__level']

    def get_queryset(self):
        skill_id = self.kwargs['skill_id']
        # Здесь мы ТОЛЬКО фильтруем, но НЕ сортируем. 
        # Сортировку возьмет на себя OrderingFilter.
        return User.objects.filter(specializations__skills__skill_id=skill_id).distinct()
    
class UsersBySpecializationAPIView(generics.ListAPIView):
    serializer_class = UserSerializer

    filter_backends = [OrderingFilter]
    ordering_fields = ['specializations__level', 'username', 'date_joined']
    ordering = ['-specializations__level']
    
    def get_queryset(self):
        spec_id = self.kwargs['spec_id']
        #filtering and sorting the queryset
        return User.objects.filter(specializations__specialization_id=spec_id).distinct()




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
