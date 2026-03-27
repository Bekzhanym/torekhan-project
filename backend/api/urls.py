from django.urls import path
from .views import UserListAPIView, UserDetailAPIView, UserDetailByUsernameAPIView, UsersBySkillAPIView, UsersBySpecializationAPIView
urlpatterns = [
    path('users/', UserListAPIView.as_view(), name='user-list'), # get all users
    path('users/<int:pk>/', UserDetailAPIView.as_view(), name='user-detail-id'), # get user by ID
    path('users/<str:username>/', UserDetailByUsernameAPIView.as_view(), name='user-detail-username'), # get user by username
    path('users/by-specialization/<int:spec_id>/', UsersBySpecializationAPIView.as_view(), name='users-by-spec'), # filter users by specialization. Sorting enabled(by level, by username, by date_joined)
    path('users/by-skill/<int:skill_id>/', UsersBySkillAPIView.as_view(), name='users-by-skill'), # filter users by skill. Sorting enabled(by level, by username, by date_joined)
]