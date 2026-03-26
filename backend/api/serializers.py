from rest_framework import serializers
from .models import CustomUser, Vehicle, Role, DriverProfile, VehicleAssignment, Employee, Customer

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ('business_name', 'contact_person_name', 'phone_number', 'alternate_phone', 'address', 'latitude', 'longitude', 'tax_id', 'credit_limit', 'payment_terms')

class DriverProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriverProfile
        fields = ('license_number', 'license_expiry_date', 'license_type', 'experience_years')

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ('full_name', 'national_id', 'contact_number', 'address', 'date_of_birth')

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    role_id = serializers.IntegerField(write_only=True, required=False)
    status = serializers.SerializerMethodField()
    driver_profile = DriverProfileSerializer(required=False)
    employee = EmployeeSerializer(required=False, source='employee_profile')
    customer = CustomerSerializer(required=False, source='customer_profile')
    
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'password', 'role', 'role_id', 'status', 'driver_profile', 'employee', 'customer')
        extra_kwargs = {'password': {'write_only': True}}
        
    def get_role(self, obj):
        try:
            return obj.role.role_name.lower()
        except:
            return 'driver'
            
    def get_status(self, obj):
        return 'active' if obj.is_active else 'inactive'

    def create(self, validated_data):
        driver_profile_data = validated_data.pop('driver_profile', None)
        employee_data = validated_data.pop('employee_profile', None)
        customer_data = validated_data.pop('customer_profile', None)
        role_id = validated_data.pop('role_id', None)
        
        # In case the frontend sends "role" as an extra field in the view request (it might be dropped by the serializer)
        # We need a way to get the role string. For now, since it receives role_id optionally or drops 'role',
        # let's assume the View passes it in self.initial_data.
        role_str = self.initial_data.get('role', 'driver').lower()
        role_obj = Role.objects.filter(role_name__iexact=role_str).first()
        
        if role_obj:
            role_id = role_obj.role_id
            validated_data['role'] = role_obj
            role_name = role_str
        else:
            role_name = 'driver'
            
        user = CustomUser.objects.create_user(**validated_data)
                    
        if role_name == 'customer':
            if customer_data:
                Customer.objects.create(user=user, email=user.email, **customer_data)
            else:
                Customer.objects.create(user=user, email=user.email, phone_number='N/A', address='N/A')
        else:
            if employee_data:
                employee = Employee.objects.create(user=user, **employee_data)
            else:
                employee = Employee.objects.create(user=user, full_name=user.username, national_id='N/A', contact_number='N/A', address='N/A', date_of_birth='2000-01-01')
                
            if role_name == 'driver' and driver_profile_data:
                DriverProfile.objects.create(employee=employee, **driver_profile_data)
            
        return user

    def update(self, instance, validated_data):
        employee_data = validated_data.pop('employee_profile', None)
        customer_data = validated_data.pop('customer_profile', None)
        
        # Manually extract status active switch
        if 'is_active' in validated_data:
            instance.is_active = validated_data['is_active']
            
        # Standard user update
        for attr, value in validated_data.items():
            if attr == 'password':
                instance.set_password(value)
            else:
                setattr(instance, attr, value)
        instance.save()
        
        try:
            role_name = instance.role.role_name.lower()
        except:
            role_name = 'driver'
            
        if role_name == 'customer':
            if customer_data:
                customer, _ = Customer.objects.get_or_create(user=instance, defaults={'email': instance.email, 'phone_number': 'N/A', 'address': 'N/A'})
                for attr, value in customer_data.items():
                    setattr(customer, attr, value)
                customer.save()
        else:
            if employee_data:
                employee, _ = Employee.objects.get_or_create(user=instance, defaults={'full_name': instance.username, 'national_id': 'N/A', 'contact_number': 'N/A', 'address': 'N/A', 'date_of_birth': '2000-01-01'})
                for attr, value in employee_data.items():
                    setattr(employee, attr, value)
                employee.save()
            
        return instance
class VehicleSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='vehicle_id', read_only=True)
    plate_number = serializers.CharField()
    vehicle_type = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    make_model = serializers.CharField(source='model', required=False, allow_null=True, allow_blank=True)
    manufacturer = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    year = serializers.IntegerField(required=False, allow_null=True)
    capacity = serializers.FloatField(source='capacity_kg', required=False, allow_null=True)
    volume = serializers.FloatField(source='capacity_volume', required=False, allow_null=True)
    assignedDriver = serializers.SerializerMethodField()
    insurance_expiry = serializers.DateField(required=False, allow_null=True)
    registration_expiry = serializers.DateField(required=False, allow_null=True)
    is_refrigerated = serializers.BooleanField(required=False, default=False)

    class Meta:
        model = Vehicle
        fields = ('id', 'plate_number', 'vehicle_type', 'make_model', 'manufacturer', 'year', 'capacity', 'volume', 'assignedDriver', 'status', 'insurance_expiry', 'registration_expiry', 'is_refrigerated')

    def get_assignedDriver(self, obj):
        active_assignment = obj.assignments.filter(status='active').first()
        if active_assignment and active_assignment.driver and hasattr(active_assignment.driver, 'employee'):
            return active_assignment.driver.employee.user.id
        return None

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class VehicleAssignmentSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='assignment_id', read_only=True)
    driver_username = serializers.SerializerMethodField()

    class Meta:
        model = VehicleAssignment
        fields = ('id', 'driver_username', 'vehicle', 'assignment_start_date', 'assignment_end_date', 'status')
        read_only_fields = ('assignment_start_date', 'assignment_end_date', 'status')

    def get_driver_username(self, obj):
        try:
            return obj.driver.employee.user.username
        except:
            return "Unknown"
