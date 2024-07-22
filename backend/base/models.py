import code
import time
from django.db import models
from django.contrib.auth.models import User
from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Problem(models.Model):
    code = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=100)
    description = models.TextField()
    attempts = models.IntegerField(default=0)
    solved = models.IntegerField(default=0)
    accuracy = models.FloatField(default=0.0)
    difficulty = models.CharField(
        max_length=10,
        choices=[
            ('easy', 'Easy'),
            ('medium', 'Medium'),
            ('hard', 'Hard')
        ],
    )
    time_limit = models.FloatField()
    memory_limit = models.FloatField()
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class TestCase(models.Model):
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    inputs = models.CharField(max_length=100)
    outputs = models.CharField(max_length=100)

    def __str__(self):
        return 'Test Case: ' + self.problem.title

class Forum(models.Model):
    problem = models.OneToOneField(Problem, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return 'Forum: ' + self.problem.title

class Submission(models.Model):
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    verdict = models.TextField()
    time = models.FloatField()
    memory = models.FloatField()
    language = models.CharField(max_length=100)

    def __str__(self):
        return 'Submission: ' + self.problem.title
