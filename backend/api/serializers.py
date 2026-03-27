from rest_framework import serializers
from .models import User, Specialization, Skill, User_Specialization, User_Specialization_Skill



class SkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.ReadOnlyField(source='skill.name')

    class Meta:
        model = User_Specialization_Skill
        fields = ['skill_name', 'level']

class UserSpecializationSerializer(serializers.ModelSerializer):
    spec_name = serializers.ReadOnlyField(source='specialization.name')
    skills = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = User_Specialization
        fields = ['spec_name', 'level', 'skills']

class UserSerializer(serializers.ModelSerializer):
    specializations = UserSpecializationSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'specializations']