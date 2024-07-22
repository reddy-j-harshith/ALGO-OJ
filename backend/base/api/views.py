import code
from django.http import JsonResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view as view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
import subprocess

from django.contrib.auth.models import User
from django.http import HttpResponse

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import ProblemSerializer, ForumSerializer
from base.models import Problem, Submission, TestCase, Forum
import uuid

import os

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
        return JsonResponse({"Message": "User name already exists"}, status=409)

    user = User.objects.create_user(username = username, password = password, first_name = firstname, last_name = lastname, email = email)
    user.save()

    return JsonResponse({"Message": "User created successfully"}, status=201)

@view(['GET'])
@permission_classes([IsAuthenticated])
def get_latest_problems(request):
    problems = Problem.objects.all().order_by('-date')[:5]
    serializer = ProblemSerializer(problems, many = True)
    return Response(serializer.data)

@view(['GET'])
@permission_classes([IsAuthenticated])
def get_problem(request, id):
    try:
        problem = Problem.objects.get(code=id)
        serializer = ProblemSerializer(problem, many=False)
        return Response(serializer.data, status=200)
    except Problem.DoesNotExist:
        return JsonResponse({"error": "Problem not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    

@view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def create_problem(request):
    data = request.data
    problem = Problem.objects.create(
        code = uuid.uuid4(),
        title = data['title'],
        description = data['description'],
        difficulty = data['difficulty'],
        time_limit = data['time_limit'],
        memory_limit = data['memory_limit'],
    )
    
    # Handle the upload of the input and output test case files
    # if 'input_file' in request.FILES and 'output_file' in request.FILES:
    #     input_file = request.FILES['input_file']
    #     output_file = request.FILES['output_file']

    #     # Save the input file
    #     test_case = TestCase.objects.create(problem=problem, input_file=input_file)

    #     # Save the output file
    #     test_case.output_file.save(output_file.name, output_file)
    # else:
    #     return JsonResponse({"error": "Input and output files are required"}, status=400)
    problem.save()

    return JsonResponse({"Message": "Problem created successfully"}, status=201)

@view(['PUT'])
@permission_classes([IsAuthenticated, IsAdminUser])
def update_problem(request, id):
    try:
        problem = Problem.objects.get(id=id)
        data = request.data
        problem.title = data['title']
        problem.description = data['description']
        problem.difficulty = data['difficulty']
        problem.time_limit = data['time_limit']
        problem.memory_limit = data['memory_limit']
        problem.save()
        return JsonResponse({"Message": "Problem updated successfully"}, status=200)
    except Problem.DoesNotExist:
        return JsonResponse({"error": "Problem not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@view(['PUT'])
@permission_classes([IsAuthenticated, IsAdminUser])
def delete_problem(request, id):
    try:
        problem = Problem.objects.get(id=id)
        problem.delete()
        return JsonResponse({"Message": "Problem deleted successfully"}, status=200)
    except Problem.DoesNotExist:
        return JsonResponse({"error": "Problem not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@view(['PUT'])
@permission_classes([IsAuthenticated, IsAdminUser])
def give_admin(request, id):
    try:
        user = User.objects.get(id=id)
        user.is_staff = True
        user.save()
        return JsonResponse({"Message": "User is now an admin"}, status=200)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@view(['PUT'])
@permission_classes([IsAuthenticated, IsAdminUser])
def remove_admin(request, id):
    try:
        user = User.objects.get(id=id)
        user.is_staff = False
        user.save()
        return JsonResponse({"Message": "User is no longer an admin"}, status=200)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@view(['GET'])
@permission_classes([IsAuthenticated])
def get_forum(request, id):
    try:
        forum = Forum.objects.filter(problem=id)
        serializer = ForumSerializer(forum, many=True)
        return Response(serializer.data)
    except Forum.DoesNotExist:
        return JsonResponse({"error": "Forum not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@view(['POST'])
@permission_classes([IsAuthenticated])
def post_message(request, id):
    data = request.data
    problem_id = Problem.objects.filter(code=id)
    forum = Forum.objects.create(
        problem = problem_id,
        user = data['user'],
        content = data['content']
    )
    forum.save()
    return JsonResponse({"Message": "Message posted successfully"}, status=201)

@view(['POST'])
def execute_code(request):
    lang = request.data.get("lang")
    code = request.data.get("code")

    if lang not in ["c", "cpp", "py"]:
        return Response(
            {"error": "Invalid language"}, status=status.HTTP_400_BAD_REQUEST
        )

    # Create necessary directories
    folder_name = "InputCodes"
    os.makedirs(folder_name, exist_ok=True)
    os.makedirs("GeneratedOutput", exist_ok=True)

    curr_dir = os.getcwd()
    folder_path = os.path.join(curr_dir, folder_name)
    uniquename = uuid.uuid4().hex
    unique_filename = f"{uniquename}.{lang}"
    file_path = os.path.join(folder_path, unique_filename)

    # Write the code to a file
    with open(file_path, "w") as f:
        f.write(code)

    try:
        generated_output = ""
        # Compilation and execution based on the language
        if lang == "c":
            compile_result = subprocess.run(
                ["gcc", unique_filename, "-o", uniquename],
                cwd=folder_path,
                capture_output=True,
                text=True
            )
            if compile_result.returncode == 0:
                exec_result = subprocess.run(
                    [os.path.join(folder_path, uniquename)],
                    capture_output=True,
                    text=True
                )
                generated_output = exec_result.stdout
            else:
                generated_output = compile_result.stderr

        elif lang == "cpp":
            compile_result = subprocess.run(
                ["g++", unique_filename, "-o", uniquename],
                cwd=folder_path,
                capture_output=True,
                text=True
            )
            if compile_result.returncode == 0:
                exec_result = subprocess.run(
                    [os.path.join(folder_path, uniquename)],
                    capture_output=True,
                    text=True
                )
                generated_output = exec_result.stdout
            else:
                generated_output = compile_result.stderr

        elif lang == "py":
            exec_result = subprocess.run(
                ["python", unique_filename],
                cwd=folder_path,
                capture_output=True,
                text=True
            )
            generated_output = exec_result.stdout if exec_result.returncode == 0 else exec_result.stderr

        return Response(
            {"output": generated_output},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )