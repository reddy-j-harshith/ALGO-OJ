from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from django.contrib.auth.models import User
from base.models import Problem, Forum, Submission, LatestCode

class ProblemSerializer(ModelSerializer):
    class Meta:
        model = Problem
        fields = '__all__'

class ForumSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    date = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%S.%fZ', read_only=True)

    class Meta:
        model = Forum
        fields = ['user', 'content', 'date']

class SubmissionSerializer(ModelSerializer):
    class Meta:
        model = Submission
        fields = '__all__'

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class LatestSerializer(ModelSerializer):
    class Meta:
        model = LatestCode  
        fields = '__all__'