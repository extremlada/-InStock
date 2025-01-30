from django.db import models

class reszleg(models.Model):
    id = models.AutoField(primary_key=True, editable=False)
    név = models.TextField(max_length=255, blank=False)
    
    def __str__(self):
        return self.név
    

class raktar(models.Model):
    id = models.AutoField(primary_key=True, editable=False)
    név = models.TextField(max_length=255, blank=False)
    részleg = models.ForeignKey(reszleg, blank=False, related_name="raktarok", on_delete=models.CASCADE)

    def __str__(self):
        return self.név

class items(models.Model):
    id = models.AutoField(primary_key=True, editable=False)
    név = models.TextField(max_length=255, blank=False)
    barcode = models.IntegerField( blank=False)
    Description = models.TextField(max_length=255, blank=True)
    Mennyiség = models.IntegerField(default=1, blank=False)
    Depot = models.ForeignKey(raktar, blank=False, related_name="Tárgyak", on_delete=models.CASCADE)
    
    def __str__(self):
        self.név