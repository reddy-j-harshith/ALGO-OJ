from rest_framework.serializers import ModelSerializer
from base.models import Problem, Forum

class ProblemSerializer(ModelSerializer):
    class Meta:
        model = Problem
        fields = '__all__'

class ForumSerializer(ModelSerializer):
    class Meta:
        model = Forum
        fields = '__all__'