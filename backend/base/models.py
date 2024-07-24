from re import sub
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
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
    inputs = models.FileField(upload_to='test_cases/inputs/')
    outputs = models.FileField(upload_to='test_cases/outputs/')

    def __str__(self):
        return 'Test Case: ' + self.problem.title
    
@receiver(post_delete, sender=TestCase)
def submission_delete(sender, instance, **kwargs):
    instance.inputs.delete(save=False)
    instance.outputs.delete(save=False)

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
    code = models.TextField(default="")
    submission_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return 'Submission: ' + self.problem.title
