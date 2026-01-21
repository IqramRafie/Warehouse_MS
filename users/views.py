from rest_framework.viewsets import ModelViewSet
from users.models import User
from users.serializers import UserSerializer
from users.permissions import IsOperator

class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsOperator]
