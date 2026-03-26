from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

class Role(models.Model):
    role_id = models.AutoField(primary_key=True)
    role_name = models.CharField(max_length=50, unique=True)
    role_description = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'roles'

class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

class CustomUser(AbstractBaseUser):
    user_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=50, unique=True)
    email = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255, db_column='password_hash')
    role = models.ForeignKey(Role, models.DO_NOTHING, db_column='role_id')
    is_active = models.BooleanField(default=True)
    
    objects = CustomUserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    class Meta:
        managed = False
        db_table = 'users'
        
    @property
    def id(self):
        return self.user_id

class Vehicle(models.Model):
    vehicle_id = models.AutoField(primary_key=True)
    plate_number = models.CharField(max_length=20, unique=True)
    vehicle_type = models.CharField(max_length=15)
    manufacturer = models.CharField(max_length=50, blank=True, null=True)
    model = models.CharField(max_length=50, blank=True, null=True)
    year = models.IntegerField(blank=True, null=True)
    capacity_kg = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    capacity_volume = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    is_refrigerated = models.BooleanField(default=False)
    fuel_type = models.CharField(max_length=10, default='diesel')
    status = models.CharField(max_length=14, blank=True, null=True)
    insurance_expiry = models.DateField(blank=True, null=True)
    registration_expiry = models.DateField(blank=True, null=True)

    @property
    def licensePlate(self):
        return self.plate_number

    @property
    def storageCapacity(self):
        return float(self.capacity_kg) if self.capacity_kg else 0

    @property
    def volumeCapacity(self):
        return float(self.capacity_volume) if self.capacity_volume else 0

    @property
    def hasFridge(self):
        return False
        
    @property
    def assignedDriver(self):
        assignment = VehicleAssignment.objects.filter(vehicle=self, status='Active').first()
        if assignment:
            return assignment.driver.id
        return None

    class Meta:
        managed = False
        db_table = 'vehicles'

class Employee(models.Model):
    employee_id = models.AutoField(primary_key=True)
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='employee_profile', db_column='user_id')
    full_name = models.CharField(max_length=150)
    national_id = models.CharField(max_length=50)
    contact_number = models.CharField(max_length=20)
    address = models.TextField()
    date_of_birth = models.DateField()
    hire_date = models.DateField(auto_now_add=True)
    termination_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, default='active')
    emergency_contact_name = models.CharField(max_length=100, null=True, blank=True)
    emergency_contact_number = models.CharField(max_length=20, null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'employees'

class DriverProfile(models.Model):
    driver_id = models.AutoField(primary_key=True)
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='driver_profile', db_column='employee_id')
    license_number = models.CharField(max_length=50)
    license_expiry_date = models.DateField()
    license_type = models.CharField(max_length=20, default='heavy_vehicle')
    experience_years = models.DecimalField(max_digits=4, decimal_places=1, default=0.0)
    medical_certificate_expiry = models.DateField(null=True, blank=True)
    last_training_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, default='available')

    class Meta:
        managed = False
        db_table = 'drivers'

class Customer(models.Model):
    customer_id = models.AutoField(primary_key=True)
    user = models.OneToOneField(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='customer_profile', db_column='user_id')
    business_name = models.CharField(max_length=150, null=True, blank=True)
    contact_person_name = models.CharField(max_length=100, null=True, blank=True)
    email = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    alternate_phone = models.CharField(max_length=20, null=True, blank=True)
    address = models.TextField()
    latitude = models.DecimalField(max_digits=10, decimal_places=8, default=0.0)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, default=0.0)
    tax_id = models.CharField(max_length=50, null=True, blank=True)
    credit_limit = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    payment_terms = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        managed = False
        db_table = 'customers'

class VehicleAssignment(models.Model):
    assignment_id = models.AutoField(primary_key=True)
    driver = models.ForeignKey(DriverProfile, on_delete=models.CASCADE, related_name='assignments', db_column='driver_id')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='assignments', db_column='vehicle_id')
    assignment_start_date = models.DateTimeField(auto_now_add=True)
    assignment_end_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default='active')
    assigned_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, db_column='assigned_by')

    class Meta:
        managed = False
        db_table = 'driver_vehicle_assignments'

