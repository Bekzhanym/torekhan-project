from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Specialization, Skill, User_Specialization, User_Specialization_Skill


# register your models here
class MyUserAdmin(UserAdmin):
    # Добавляем поле email в форму СОЗДАНИЯ пользователя
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('email',)}),
    )
    # Поля, которые отображаются в списке всех юзеров (для удобства)
    list_display = ('username', 'email', 'is_staff', 'is_active')
class SkillInline(admin.TabularInline):
    model = User_Specialization_Skill
    extra = 1

@admin.register(User_Specialization)
class UserSpecializationAdmin(admin.ModelAdmin):
    inlines = [SkillInline]


admin.site.register(User, MyUserAdmin)
admin.site.register(Specialization)
admin.site.register(Skill)
admin.site.register(User_Specialization_Skill)