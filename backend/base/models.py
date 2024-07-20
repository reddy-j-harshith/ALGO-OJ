import time
from django.db import models
from django.contrib.auth.models import User
from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Problem(models.Model):
    setter = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    title = models.CharField(max_length=100)
    problem_state = models.TextField()
    constraints = models.TextField()
    attempts = models.IntegerField(default=0)
    solved = models.IntegerField(default=0)
    accuracy = models.FloatField(default=0.0)
    difficulty = models.FloatField(default=0.0)
    testcases = models.IntegerField(default=0)
    test_case_file = models.FileField(upload_to='test_case_files/')
    time_limit = models.FloatField()
    memory_limit = models.FloatField()
    date = models.DateTimeField(auto_now_add=True)

class Forum(models.Model):
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    date = models.DateTimeField(auto_now_add=True)

class Submission(models.Model):
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.FileField(upload_to='code_files/')
    date = models.DateTimeField(auto_now_add=True)
    result = models.TextField()
    time = models.FloatField()
    memory = models.FloatField()
    language = models.CharField(max_length=100)
    status = models.CharField(max_length=100)
