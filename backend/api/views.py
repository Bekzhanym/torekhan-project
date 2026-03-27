from rest_framework import generics
from rest_framework.filters import OrderingFilter
from .models import User, User_Specialization, User_Specialization_Skill
from .serializers import UserSerializer, UserSpecializationSerializer, SkillSerializer

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

