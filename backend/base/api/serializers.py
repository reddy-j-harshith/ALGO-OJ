from rest_framework.serializers import ModelSerializer
from django.contrib.auth.models import User
from base.models import Problem, Forum, Submission

class ProblemSerializer(ModelSerializer):
    class Meta:
        model = Problem
        fields = '__all__'

class ForumSerializer(ModelSerializer):
    class Meta:
        model = Forum
        fields = '__all__'

class SubmissionSerializer(ModelSerializer):
    class Meta:
        model = Submission
        fields = '__all__'

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'