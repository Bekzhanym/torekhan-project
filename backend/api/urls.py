from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (UserListAPIView, UserDetailAPIView, UserDetailByUsernameAPIView, UsersBySkillAPIView, 
                    UsersBySpecializationAPIView, UserCreateAPIView, UserProfileAPIView, 
                    UserSpecializationCreateAPIView, UserSpecializationUpdateAPIView, UserSkillCreateAPIView, 
                    UserSkillUpdateAPIView, SkillsListAPIView, SpecializationsListAPIView, MyTokenObtainPairView,
                    AdminSpecializationCreateAPIView, AdminSpecializationUpdateAPIView, AdminSpecializationDeleteAPIView,
                    AdminSkillCreateAPIView, AdminSkillUpdateAPIView, AdminSkillDeleteAPIView, PostListAPIView, PostSearchAPIView, PostCreateAPIView, MyPostsListAPIView, PostUpdateAPIView,
                    ApplyCreateAPIView, PostApplicationsListAPIView)

urlpatterns = [
    ### AUTHENTICATION ###
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'), # Login (Get token)
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # Relogin (Refresh token)
    
    ### CREATE ###
    path('users/register', UserCreateAPIView.as_view(), name='user-register'),  # register
    path('users/me/add-specialization/', UserSpecializationCreateAPIView.as_view(), name='add-spec'), # add specialization
    path('users/me/add-skill/', UserSkillCreateAPIView.as_view(), name='add-skill'), # add skill
    path('posts/add', PostCreateAPIView.as_view()), # add post
    path('application/add', ApplyCreateAPIView.as_view()),
    
    ### READ ###
    path('users/', UserListAPIView.as_view(), name='user-list'), # get all users
    path('users/id/<int:pk>/', UserDetailAPIView.as_view(), name='user-detail-id'), # get user by ID
    path('users/username/<str:username>/', UserDetailByUsernameAPIView.as_view(), name='user-detail-username'), # get user by username
    path('users/by-specialization/<int:spec_id>/', UsersBySpecializationAPIView.as_view(), name='users-by-spec'), # filter users by specialization. Sorting enabled(by level, by username, by date_joined)
    path('users/by-skill/<int:skill_id>/', UsersBySkillAPIView.as_view(), name='users-by-skill'), # filter users by skill. Sorting enabled(by level, by username, by date_joined)
    path('skills/', SkillsListAPIView.as_view()), # get all skills
    path('specializations/', SpecializationsListAPIView.as_view()),  # get all specializations
    path('posts/', PostListAPIView.as_view()), # get all posts
    path('posts/search/<str:text>', PostSearchAPIView.as_view()), # search posts by title/description
    path('posts/<int:post_id>/applications', PostApplicationsListAPIView.as_view()), # get all applications for a post
    path('users/me/', UserProfileAPIView.as_view(), name='user-profile'), # get profile / update email
    path('users/me/posts', MyPostsListAPIView.as_view()), # get ur posts
    
    
    ### UPDATE & DELETE ###
    path('users/me/change-specialization/<int:pk>/', UserSpecializationUpdateAPIView.as_view(), name='manage-skill'), # change / delete user_skill relation
    path('users/me/change-skill/<int:pk>/', UserSkillUpdateAPIView.as_view(), name='manage-skill'), # change / delete user_skill relation
    path('posts/<int:pk>', PostUpdateAPIView.as_view()), # change / delete ur post 
    



    ### ADMIN ENDPOINTS ###
    # Specializations management
    path('admin/specializations/create/', AdminSpecializationCreateAPIView.as_view(), name='admin-spec-create'), # create specialization
    path('admin/specializations/<int:pk>/update/', AdminSpecializationUpdateAPIView.as_view(), name='admin-spec-update'), # update specialization
    path('admin/specializations/<int:pk>/delete/', AdminSpecializationDeleteAPIView.as_view(), name='admin-spec-delete'), # delete specialization
    
    # Skills management
    path('admin/skills/create/', AdminSkillCreateAPIView.as_view(), name='admin-skill-create'), # create skill
    path('admin/skills/<int:pk>/update/', AdminSkillUpdateAPIView.as_view(), name='admin-skill-update'), # update skill
    path('admin/skills/<int:pk>/delete/', AdminSkillDeleteAPIView.as_view(), name='admin-skill-delete'), # delete skill
]