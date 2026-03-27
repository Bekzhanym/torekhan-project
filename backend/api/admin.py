from django.contrib import admin
from .models import User, Specialization, Skill, User_Specialization, User_Specialization_Skill


# register your models here
class SkillInline(admin.TabularInline):
    model = User_Specialization_Skill
    extra = 1

@admin.register(User_Specialization)
class UserSpecializationAdmin(admin.ModelAdmin):
    inlines = [SkillInline]


admin.site.register(User)
admin.site.register(Specialization)
admin.site.register(Skill)