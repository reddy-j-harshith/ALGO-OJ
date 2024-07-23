from django.urls import path
from . import views
from .views import MyTokenObtainPairView, get_forum, is_admin, register_user, get_latest_problems, get_problem, create_problem, delete_problem, give_admin, remove_admin, post_message, execute_code, is_admin

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)


urlpatterns = [
    path('', views.getRoutes),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', register_user, name = 'register_user'),
    path('get_latest/', get_latest_problems, name = 'get_latest_problems'),
    path('get_problem/<str:id>/', get_problem, name = 'get_problem'),
    path('create_problem/', create_problem, name = 'create_problem'),
    path('delete_problem/<str:id>/', delete_problem, name = 'delete_problem'),
    path('give_admin/<int:id>/', give_admin, name = 'give_admin'),
    path('remove_admin/<int:id>/', remove_admin, name = 'remove_admin'),
    path('get_forum/<int:str>/', get_forum, name = 'forum_messages'),
    path('post_message/<str:id>', post_message, name = 'post_message'),
    path('execute_code/', execute_code, name = 'execute_code'),
    path('is_admin/', is_admin, name = 'is_admin') 
]