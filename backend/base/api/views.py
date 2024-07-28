import os
from urllib import response
import uuid
import time
import psutil
import subprocess
from rest_framework import status
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.decorators import api_view as view, permission_classes

from django.contrib.auth.models import User
from django.http import HttpResponse

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from base.models import LatestCode, Problem, Submission, TestCase, Forum
from .serializers import ProblemSerializer, ForumSerializer, SubmissionSerializer, UserSerializer, LatestSerializer


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['username'] = user.username
        token['is_staff'] = user.is_staff

        return token
    
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

@view(['POST'])
@permission_classes([AllowAny])
def register_user(request):

    username = request.data.get("username")
    password = request.data.get("password")
    email = request.data.get("email")

    user = User.objects.filter(username = username)

    if user.exists():
        return JsonResponse({"Message": "User name already exists"}, status=409)

    user = User.objects.create_user(username = username, password = password, email = email)
    user.save()

    return JsonResponse({"Message": "User created successfully"}, status=201)

@view(['GET'])
@permission_classes([IsAuthenticated])
def get_latest_problems(request):
    paginator = PageNumberPagination()
    paginator.page_size = 10
    problems = Problem.objects.all().order_by('-date')
    result_page = paginator.paginate_queryset(problems, request)
    serializer = ProblemSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)


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
        code=data['code'],
        title=data['title'],
        description=data['description'],
        difficulty=data['difficulty'],
        time_limit=data['time_limit'],
        memory_limit=data['memory_limit'],
    )
    

    input_files = request.FILES.getlist('input_files')
    output_files = request.FILES.getlist('output_files')

    if input_files and output_files and len(input_files) == len(output_files):
        for input_file, output_file in zip(input_files, output_files):
            test_case = TestCase.objects.create(problem=problem, inputs=input_file, outputs=output_file)
            test_case.save()
    else:
        return JsonResponse({"error": "Input and output files are required and should be in pairs"}, status=400)

    problem.save()

    return JsonResponse({"Message": "Problem created successfully"}, status=201)
    
@view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def delete_problem(request, id):
    try:
        problem = Problem.objects.get(code=id)
        problem.delete()
        return JsonResponse({"Message": "Problem deleted successfully"}, status=204)
    except Problem.DoesNotExist:
        return JsonResponse({"error": "Problem not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def list_users(request):
    paginator = PageNumberPagination()
    page_size = request.GET.get('page_size', 10)  # Default to 10 if not provided
    paginator.page_size = int(page_size)
    users = User.objects.all().order_by('id')
    result_page = paginator.paginate_queryset(users, request)
    serializer = UserSerializer(result_page, many=True)
    response = paginator.get_paginated_response(serializer.data)
    response.data['total'] = users.count()  # Add total count
    return response
 

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
@permission_classes([IsAuthenticated])
def submit_code(request):
    user = request.user
    lang = request.data.get("lang")
    problem_code = request.data.get("problem_code")
    code = request.data.get("code")

    if lang not in ["c", "cpp", "py"]:
        return Response({"error": "Invalid language"}, status=status.HTTP_400_BAD_REQUEST)

    input_folder = "InputCodes"
    output_folder = "GeneratedOutput"
    os.makedirs(input_folder, exist_ok=True)
    os.makedirs(output_folder, exist_ok=True)

    curr_dir = os.getcwd()
    input_folder_path = os.path.join(curr_dir, input_folder)
    output_folder_path = os.path.join(curr_dir, output_folder)
    uniquename = uuid.uuid4().hex
    unique_filename = f"{uniquename}.{lang}"
    file_path = os.path.join(input_folder_path, unique_filename)

    with open(file_path, "w") as f:
        f.write(code)

    try:
        problem = Problem.objects.get(code=problem_code)
        test_cases = TestCase.objects.filter(problem=problem)

        if not test_cases.exists():
            return Response({"error": "No test cases found for this problem"}, status=status.HTTP_400_BAD_REQUEST)

        verdict = "Accepted"
        passed_test_cases = 0
        total_time = 0
        total_memory = 0

        if lang == "c":
            compile_result = subprocess.run(
                ["gcc", file_path, "-o", os.path.join(output_folder_path, uniquename)],
                capture_output=True,
                text=True
            )
            if compile_result.returncode != 0:
                verdict = "Compilation Error"
                generated_output = compile_result.stderr
        elif lang == "cpp":
            compile_result = subprocess.run(
                ["g++", file_path, "-o", os.path.join(output_folder_path, uniquename)],
                capture_output=True,
                text=True
            )
            if compile_result.returncode != 0:
                verdict = "Compilation Error"
                generated_output = compile_result.stderr

        if verdict != "Compilation Error":
            for test_case in test_cases:
                input_file_path = test_case.inputs.path
                expected_output_file_path = test_case.outputs.path
                generated_output_file_path = os.path.join(output_folder_path, f"{uniquename}_output_{test_case.id}.txt")

                if lang in ["c", "cpp"]:
                    exec_command = [os.path.join(output_folder_path, uniquename)]
                else: 
                    exec_command = ["python", file_path]

                with open(input_file_path, "r") as input_file, open(generated_output_file_path, "w") as output_file:
                    start_time = time.time()
                    process = subprocess.Popen(exec_command, stdin=input_file, stdout=output_file, stderr=subprocess.PIPE, text=True)
                    try:
                        process.wait(timeout=problem.time_limit)
                        end_time = time.time()
                        total_time += end_time - start_time

                        try:
                            process_memory = psutil.Process(process.pid).memory_info().rss# in KB
                            total_memory += process_memory
                        except psutil.NoSuchProcess:
                            pass

                    except subprocess.TimeoutExpired:
                        process.kill()
                        verdict = "Time Limit Exceeded"
                        break

                    if process.returncode != 0:
                        verdict = "Runtime Error"
                        break

                    with open(expected_output_file_path, "r") as expected_output_file, open(generated_output_file_path, "r") as generated_output_file:
                        expected_output = expected_output_file.read().strip()
                        generated_output = generated_output_file.read().strip()

                    if generated_output != expected_output:
                        verdict = "Wrong Answer"
                        break

                    passed_test_cases += 1

        submission = Submission.objects.create(
            problem=problem,
            user=user,
            verdict=verdict,
            time=round(total_time, 4),
            memory=round(total_memory, 9),
            language=lang,
            code=code
        )

        submission.save()

        response_data = {
            "verdict": verdict,
            "test_cases_passed": passed_test_cases,
            "total_test_cases": test_cases.count(),
            "time_taken": round(total_time, 4),
            "memory_taken": round(total_memory, 9)
        }

        if verdict == "Accepted":
            problem.solved += 1
        problem.attempts += 1
        problem.accuracy = (problem.solved / problem.attempts) * 100
        problem.save()

        return Response(response_data, status=status.HTTP_200_OK)

    except Problem.DoesNotExist:
        return Response({"error": "Problem not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Exception: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@view(['POST'])
@permission_classes([AllowAny])
def execute_code(request):
    lang = request.data.get('lang')
    code = request.data.get('code')
    inputs = request.data.get('inputs')

    if lang not in ["c", "cpp", "py"]:
        return Response({"error": "Invalid language"}, status=status.HTTP_400_BAD_REQUEST)

    if not isinstance(inputs, list):
        return Response({"error": "Inputs should be a list"}, status=status.HTTP_400_BAD_REQUEST)
    
    input_folder = "compile_input"
    output_folder = "compile_output"
    os.makedirs(input_folder, exist_ok=True)
    os.makedirs(output_folder, exist_ok=True)

    curr_dir = os.getcwd()
    input_folder_path = os.path.join(curr_dir, input_folder)
    output_folder_path = os.path.join(curr_dir, output_folder)
    unique_name = uuid.uuid4().hex
    unique_filename = f"{unique_name}.{lang}"
    file_path = os.path.join(input_folder_path, unique_filename)

    with open(file_path, "w") as f:
        f.write(code)

    compile_error = None
    if lang == "c":
        compile_result = subprocess.run(
            ["gcc", file_path, "-o", os.path.join(output_folder_path, unique_name)],
            capture_output=True,
            text=True
        )
        if compile_result.returncode != 0:
            compile_error = compile_result.stderr
    elif lang == "cpp":
        compile_result = subprocess.run(
            ["g++", file_path, "-o", os.path.join(output_folder_path, unique_name)],
            capture_output=True,
            text=True
        )
        if compile_result.returncode != 0:
            compile_error = compile_result.stderr

    if compile_error:
        return Response({"error": "Compilation Error", "output": compile_error}, status=status.HTTP_400_BAD_REQUEST)

    output = []
    runtime = 0
    memory = 0

    if lang in ["c", "cpp"]:
        exec_command = [os.path.join(output_folder_path, unique_name)]
    else:
        exec_command = ["python", file_path]

    for input_data in inputs:
        input_file_path = os.path.join(input_folder_path, f"{unique_name}_input.txt")
        output_file_path = os.path.join(output_folder_path, f"{unique_name}_output.txt")

        with open(input_file_path, "w") as input_file:
            input_file.write(input_data)

        start_time = time.time()
        process = subprocess.Popen(
            exec_command,
            stdin=open(input_file_path, "r"),
            stdout=open(output_file_path, "w"),
            stderr=subprocess.PIPE,
            text=True
        )
        try:
            stdout, stderr = process.communicate(timeout=5)
            end_time = time.time()
            runtime += end_time - start_time

            try:
                process_info = psutil.Process(process.pid)
                memory_info = process_info.memory_info()
                memory += memory_info.rss
            except psutil.NoSuchProcess:
                pass

            if stderr:
                output.append(stderr)
            else:
                with open(output_file_path, "r") as output_file:
                    output.append(output_file.read())

        except subprocess.TimeoutExpired:
            process.kill()
            return Response({"error": "Time Limit Exceeded"}, status=status.HTTP_400_BAD_REQUEST)

        os.remove(input_file_path)

    response_data = {
        "output": output,
        "runtime": round(runtime, 4),
        "memory": round(memory, 9)
    }

    return Response(response_data, status=status.HTTP_200_OK)



@view(['GET'])
@permission_classes([IsAuthenticated])
def get_submissions(request, id, code):
    submissions = Submission.objects.filter(user=id, problem=code)
    serializer = SubmissionSerializer(submissions, many=False)
    return Response(serializer.data)

@view(['GET'])
@permission_classes([IsAuthenticated])
def get_last_submission(request, id, code):

    problem = Problem.objects.get(code=code)

    submission = Submission.objects.filter(user=id, problem=problem).order_by('-submission_date').first()
    serializer = SubmissionSerializer(submission, many=False)
    return Response(serializer.data)

@view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_submissions(request, id):
    submissions = Submission.objects.get(id)
    serializer = SubmissionSerializer(submissions, many=True)
    return Response(serializer.data)

# Triggers when ctrl + s was pressed
@view(['PUT'])
@permission_classes([IsAuthenticated])
def update_latest_code(request):
    user = User.objects.get(id=request.data.get('user_id'))
    problem = Problem.objects.get(code=request.data.get('problem_code'))
    code = request.data.get('code')
    language = request.data.get('language')

    try:
        latest_code = LatestCode.objects.get(user=user, problem=problem)
        latest_code.code = code
        latest_code.language = language
        latest_code.save()
    except LatestCode.DoesNotExist:
        LatestCode.objects.create(user=user, problem=problem, code=code, language=language)

    return Response({"message": "Code saved successfully"}, status=status.HTTP_200_OK)

@view(['GET'])
@permission_classes([IsAuthenticated])
def fetch_latest_code(request, user_id, problem_code):
    user = User.objects.get(id=user_id)
    problem = Problem.objects.get(code=problem_code)

    try:
        latest_code = LatestCode.objects.get(user=user, problem=problem)
        serializer = LatestSerializer(latest_code)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except LatestCode.DoesNotExist:
        return Response({"detail": "No code found"}, status=status.HTTP_404_NOT_FOUND)