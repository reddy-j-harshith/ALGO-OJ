from django.urls import path
from .views import MyTokenObtainPairView, get_forum, register_user, get_latest_problems, get_problem, create_problem, delete_problem, give_admin, remove_admin, post_message, submit_code, execute_code, get_last_submission, get_submissions, list_users, update_latest_code, fetch_latest_code

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)


urlpatterns = [
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', register_user, name = 'register_user'),
    path('get_latest/', get_latest_problems, name = 'get_latest_problems'),
    path('get_problem/<str:id>/', get_problem, name = 'get_problem'),
    path('create_problem/', create_problem, name = 'create_problem'),
    path('delete_problem/<str:id>/', delete_problem, name = 'delete_problem'),
    path('users/', list_users, name='list_users'),
    path('give_admin/<int:id>/', give_admin, name = 'give_admin'),
    path('remove_admin/<int:id>/', remove_admin, name = 'remove_admin'),
    path('get_forum/<int:str>/', get_forum, name = 'forum_messages'),
    path('post_message/<str:id>', post_message, name = 'post_message'),
    path('submit_code/', submit_code, name = 'submit_code'),
    path('execute_code/', execute_code, name = 'execute_code'),
    path('get_last_submission/<int:id>/<str:code>/', get_last_submission, name = 'get_last_submission'),
    path('get_submissions/<int:id>/<str:code>/', get_submissions, name = 'get_submissions'),
    path('update_latest_code/', update_latest_code, name = 'update_latest_code'),
    path('fetch_latest_code/<int:user_id>/<str:problem_code>/', fetch_latest_code, name = 'fetch_latest_code'),

]