from django.contrib import admin

# Register your models here.
from .models import Problem, Forum, Submission, TestCase
admin.site.register(Problem)
admin.site.register(Forum)
admin.site.register(Submission)
admin.site.register(TestCase)