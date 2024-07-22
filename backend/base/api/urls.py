from django.urls import path
from . import views
from .views import MyTokenObtainPairView, register_user, get_latest_problems, get_problem

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)


urlpatterns = [
    path('', views.getRoutes),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', register_user, name = 'register_user'),
    path('get_latest/', get_latest_problems, name = 'get_latest_problems'),
    path('get_problem/<int:id>/', get_problem, name = 'get_problem'),
]