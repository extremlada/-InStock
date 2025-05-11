import uuid
from django.db import models
from django.utils import timezone

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

    def __str__(self):
        return f"{self.name} - {self.get_muvelet_display()}"