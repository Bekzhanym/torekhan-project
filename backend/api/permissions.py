from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """
    Разрешить доступ только для пользователей с ролью ADMIN.
    """
    message = "У вас нет прав доступа. Требуется роль ADMIN."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == 'ADMIN'
