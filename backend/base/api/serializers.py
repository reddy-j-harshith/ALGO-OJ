from rest_framework.serializers import ModelSerializer
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