from django.urls import path
from . import views
from .views import MyTokenObtainPairView, register_user, get_notes

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)


urlpatterns = [
    path('', views.getRoutes),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', register_user, name = 'register_user'),
    path('all_notes/', get_notes, name = 'get_notes'),
]