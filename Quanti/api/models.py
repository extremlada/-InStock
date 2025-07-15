import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models
from django.utils import timezone



class MyAccountManager(BaseUserManager):
    def create_user(self, email, username, password=None):
        if not email:
            raise ValueError("Users must have an email address")
        if not username:
            raise ValueError("Users must have a username")
        user = self.model(
            email=self.normalize_email(email),
            username=username,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None):
        user = self.create_user(
            email=self.normalize_email(email),
            password=password,
            username=username,
        )
        user.is_admin = True
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


def get_profile_image_path(self, filename):
    return f'profile_images/{self.pk}/{"profile_image.png"}'

def get_default_profile_image_path():
    return 'profile_images/default.jpg'

class Account(AbstractBaseUser):
    email = models.EmailField(verbose_name="email", max_length=255, unique=True)
    username = models.CharField(max_length=255, unique=True)
    date_joined = models.DateTimeField(verbose_name="date joined", auto_now_add=True)
    last_login = models.DateTimeField(verbose_name="last login", auto_now=True)
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    profile_image = models.ImageField(max_length=255,upload_to='profile_images',null=True, blank=True,   default='default.jpg')
    hide_email = models.BooleanField(default=True)
    allowed_warehouses = models.ManyToManyField('raktar', blank=True, related_name='users')
    allowed_divisions = models.ManyToManyField('reszleg', blank=True, related_name='users')

    objects = MyAccountManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    def __str__(self):
        return self.username
    
    def get_profile_image_filename(self):
        return str(self.profile_image)[str(self.profile_image).index(f'profile_images/{self.pk}/')]
    
    def has_perm(self, perm, obj=None):
        return self.is_admin
    
    def has_module_perms(self, app_label):
        return True

class reszleg(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.TextField(max_length=255, blank=False)
    
    def __str__(self):
        return self.name
    

class raktar(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.TextField(max_length=255, blank=False)
    Description = models.TextField(max_length=400, blank=True)
    részleg = models.ForeignKey(reszleg, blank=False, related_name="raktarok", on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class items(models.Model):

    MUVELET_VALASZTASOK = [
        ('BE', 'Bevétel'),
        ('KI', 'Kiadás'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.TextField(max_length=255, blank=False)
    barcode = models.BigIntegerField(blank=False)
    Leirás = models.TextField(max_length=255, blank=True)
    Mennyiség = models.IntegerField(default=1, blank=False)
    Depot = models.ForeignKey(raktar, blank=False, related_name="Tárgyak", on_delete=models.CASCADE)
    Date = models.DateTimeField(default=timezone.now, blank=True)
    muvelet = models.CharField(max_length=2, choices=MUVELET_VALASZTASOK, blank=False, default='BE')
    item_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    egysegar = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.name} - {self.get_muvelet_display()}"
    
    def save(self, *args, **kwargs):
        self.item_price = self.Mennyiség * self.egysegar
        super().save(*args, **kwargs)

class Invoice(models.Model):
    szamla_szam = models.CharField(max_length=50, unique=True)
    kelt = models.DateField(auto_now_add=True)
    elado_nev = models.CharField(max_length=255)
    elado_cim = models.CharField(max_length=255)
    elado_adoszam = models.CharField(max_length=20)
    vevo_nev = models.CharField(max_length=255)
    vevo_cim = models.CharField(max_length=255, blank=True, null=True)
    vevo_adoszam = models.CharField(max_length=20, blank=True, null=True)
    fizetesi_mod = models.CharField(max_length=100, default="Átutalás")
    fizetesi_hatarido = models.DateField(blank=True, null=True)
    megjegyzes = models.TextField(blank=True, null=True)

class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, related_name="items", on_delete=models.CASCADE)
    termek_nev = models.CharField(max_length=255)
    mennyiseg = models.DecimalField(max_digits=10, decimal_places=2)
    egysegar = models.DecimalField(max_digits=12, decimal_places=2)
    afa_kulcs = models.DecimalField(max_digits=4, decimal_places=2)  # pl. 27.00
    afa_ertek = models.DecimalField(max_digits=12, decimal_places=2)
    netto_osszeg = models.DecimalField(max_digits=12, decimal_places=2)
    brutto_osszeg = models.DecimalField(max_digits=12, decimal_places=2)

class TransactionType(models.Model):
    code = models.CharField(max_length=30, unique=True)
    label = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.label} ({self.code})"

class Transaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction_type = models.ForeignKey(TransactionType, on_delete=models.PROTECT)
    unique_number = models.CharField(max_length=30, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey('Account', on_delete=models.SET_NULL, null=True, blank=True)
    note = models.TextField(blank=True)
    source_warehouse = models.ForeignKey('raktar', on_delete=models.SET_NULL, null=True, blank=True, related_name='source_transactions')
    target_warehouse = models.ForeignKey('raktar', on_delete=models.SET_NULL, null=True, blank=True, related_name='target_transactions')

    def save(self, *args, **kwargs):
        if not self.unique_number:
            self.unique_number = f"{timezone.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.unique_number} - {self.transaction_type.label}"

class TransactionItem(models.Model):
    transaction = models.ForeignKey(Transaction, related_name="items", on_delete=models.CASCADE)
    item = models.ForeignKey('items', on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
