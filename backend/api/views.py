from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from django.utils import timezone
from .models import CustomUser, Vehicle, VehicleAssignment
from .serializers import UserSerializer, VehicleSerializer, VehicleAssignmentSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        username = request.data.get('username')
        user = CustomUser.objects.filter(username=username).first()
        if user and user.role:
            role_name = user.role.role_name.lower()
            if role_name in ['driver', 'customer']:
                raise AuthenticationFailed("Access to internal portal denied.")
        return response

class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role and request.user.role.role_name.lower() == 'admin')

class IsInternalRole(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        role = request.user.role.role_name.lower() if request.user.role else ''
        return role in ['admin', 'manager', 'dispatcher']

class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsInternalRole()]
        return [IsAdminRole()]

class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'partial_update']:
            return [IsInternalRole()]
        return [IsAdminRole()]

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        role = request.user.role.role_name.lower() if request.user.role else ''
        if self.action == 'partial_update' and role in ['manager', 'dispatcher']:
            allowed_keys = {'assignedDriver'}
            request_keys = set(request.data.keys())
            if not request_keys.issubset(allowed_keys):
                self.permission_denied(request, message="Managers/Dispatchers can only modify driver assignments.")

    def perform_update(self, serializer):
        assigned_driver_id = self.request.data.get('assignedDriver', -1)
        vehicle = serializer.instance
        
        if assigned_driver_id != -1:
            from django.utils import timezone
            from .models import VehicleAssignment, DriverProfile
            now = timezone.now()
            
            # Close active vehicle assignment
            VehicleAssignment.objects.filter(vehicle=vehicle, status='active').update(status='completed', assignment_end_date=now)
            
            if assigned_driver_id:
                try:
                    driver_obj = DriverProfile.objects.get(employee__user_id=assigned_driver_id)
                except:
                    driver_obj = None
                    
                if driver_obj:
                    # Enforce 1-to-1 bounds on the driver
                    VehicleAssignment.objects.filter(driver=driver_obj, status='active').update(status='completed', assignment_end_date=now)
                    
                    VehicleAssignment.objects.create(
                        driver=driver_obj,
                        vehicle=vehicle,
                        status='active',
                        assignment_start_date=now,
                        assigned_by=self.request.user
                    )
                serializer.save(status='in_use')
            else:
                serializer.save(status='available')
        else:
            serializer.save()

class VehicleAssignmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = VehicleAssignment.objects.all().order_by('-assignment_start_date')
    serializer_class = VehicleAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def driver_history(self, request):
        driver_id = request.query_params.get('driver_id')
        if not driver_id:
            return Response({'error': 'driver_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        # Note driver_id is CustomUser ID here as passed by frontend if used
        from .models import DriverProfile
        try:
            drv = DriverProfile.objects.get(employee__user_id=driver_id)
            qs = self.queryset.filter(driver=drv)
        except:
            qs = self.queryset.none()
            
        return Response(self.get_serializer(qs, many=True).data)

    @action(detail=False, methods=['get'])
    def vehicle_history(self, request):
        vehicle_id = request.query_params.get('vehicle_id')
        if not vehicle_id:
            return Response({'error': 'vehicle_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        qs = self.queryset.filter(vehicle_id=vehicle_id)
        return Response(self.get_serializer(qs, many=True).data)

from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['POST'])
@permission_classes([AllowAny]) # In production this would require authentication
def tracking_location(request):
    """
    Ingest GPS location from Flutter app and store it in Django local memory cache.
    """
    data = request.data
    driver_id = data.get('driver_id')
    
    if not driver_id:
        return Response({'status': 'error', 'message': 'driver_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
    locations = cache.get('active_locations', {})
    locations[driver_id] = {
        'driver_id': driver_id,
        'vehicle_id': data.get('vehicle_id'),
        'lat': data.get('latitude'),
        'lng': data.get('longitude'),
        'timestamp': data.get('timestamp'),
        'status': data.get('status')
    }
    cache.set('active_locations', locations, timeout=86400) # keep for 1 day
    return Response({'status': 'success', 'message': 'Location logged'}, status=status.HTTP_202_ACCEPTED)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_locations(request):
    """
    Endpoint for React dashboard to poll periodically for the latest locations.
    """
    locations = cache.get('active_locations', {})
    return Response(list(locations.values()))


