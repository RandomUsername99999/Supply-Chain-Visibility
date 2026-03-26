from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .views import UserViewSet, VehicleViewSet, VehicleAssignmentViewSet, CustomTokenObtainPairView
from .serializers import UserSerializer, VehicleSerializer, VehicleAssignmentSerializer
from rest_framework_simplejwt.views import TokenRefreshView
from .views import tracking_location, get_locations

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'vehicles', VehicleViewSet)
router.register(r'assignments', VehicleAssignmentViewSet, basename='assignments')

urlpatterns = [
    path('me/', current_user),
    path('', include(router.urls)),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('tracking/location/', tracking_location),
    path('tracking/locations/', get_locations),
]
