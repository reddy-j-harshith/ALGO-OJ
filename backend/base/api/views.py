from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view as view, permission_classes
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.models import User
from django.http import HttpResponse

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import ProblemSerializer
from base.models import Problem

# Create your views here.
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        # ...

        return token
    
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

@view(['GET'])
def getRoutes(request):
    routes = [
        '/api/token',
        '/api/token/refresh',
    ]

    return Response(routes)

@view(['POST'])
def register_user(request):

    username = request.data.get("username")
    password = request.data.get("password")
    firstname = request.data.get("firstname")
    lastname = request.data.get("lastname")
    email = request.data.get("email")

    user = User.objects.filter(username = username)

    if user.exists():
        return HttpResponse("User already exists", status=409)

    user = User.objects.create_user(username = username, password = password, first_name = firstname, last_name = lastname, email = email)
    user.save()

    return HttpResponse("User created successfully", status=201)

@view(['GET'])
@permission_classes([IsAuthenticated])
def get_latest_problems(request):
    problems = Problem.objects.all().order_by('-date')[:5]
    serializer = ProblemSerializer(problems, many = True)
    return Response(serializer.data)

@view(['GET'])
@permission_classes([IsAuthenticated])
def get_problem(request, id):
    problem = Problem.objects.get(id = id)
    serializer = ProblemSerializer(problem, many = False)
    return Response(serializer.data)