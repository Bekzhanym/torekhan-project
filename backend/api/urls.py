from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import UserListAPIView, UserDetailAPIView, UserDetailByUsernameAPIView, UsersBySkillAPIView, UsersBySpecializationAPIView, UserCreateAPIView, UserProfileAPIView, UserSpecializationCreateAPIView, UserSpecializationUpdateAPIView, UserSkillCreateAPIView, UserSkillUpdateAPIView, SkillsListAPIView, SpecializationsListAPIView

urlpatterns = [
    ### AUTHENTICATION ###
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), # Login (Get token)
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # Relogin (Refresh token)
    path('users/me/', UserProfileAPIView.as_view(), name='user-profile'), # get profile / update email
    
    ### CREATE ###
    path('users/register', UserCreateAPIView.as_view(), name='user-register'),  # register
    path('users/me/add-specialization/', UserSpecializationCreateAPIView.as_view(), name='add-spec'), # add specialization
    path('users/me/add-skill/', UserSkillCreateAPIView.as_view(), name='add-skill'), # add skill
    
    ### READ ###
    path('users/', UserListAPIView.as_view(), name='user-list'), # get all users
    path('users/id/<int:pk>/', UserDetailAPIView.as_view(), name='user-detail-id'), # get user by ID
    path('users/username/<str:username>/', UserDetailByUsernameAPIView.as_view(), name='user-detail-username'), # get user by username
    path('users/by-specialization/<int:spec_id>/', UsersBySpecializationAPIView.as_view(), name='users-by-spec'), # filter users by specialization. Sorting enabled(by level, by username, by date_joined)
    path('users/by-skill/<int:skill_id>/', UsersBySkillAPIView.as_view(), name='users-by-skill'), # filter users by skill. Sorting enabled(by level, by username, by date_joined)
    path('skills/', SkillsListAPIView.as_view()), # get all skills
    path('specializations/', SpecializationsListAPIView.as_view()),  # get all specializations
    
    ### UPDATE & DELETE ###
    path('users/me/change-specialization/<int:pk>/', UserSpecializationUpdateAPIView.as_view(), name='manage-skill'), # change / delete user_skill relation
    path('users/me/change-skill/<int:pk>/', UserSkillUpdateAPIView.as_view(), name='manage-skill'), # change / delete user_skill relation
    
]