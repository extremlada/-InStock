# Generated by Django 5.2 on 2025-07-01 00:23

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Invoice',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('szamla_szam', models.CharField(max_length=50, unique=True)),
                ('kelt', models.DateField(auto_now_add=True)),
                ('elado_nev', models.CharField(max_length=255)),
                ('elado_cim', models.CharField(max_length=255)),
                ('elado_adoszam', models.CharField(max_length=20)),
                ('vevo_nev', models.CharField(max_length=255)),
                ('vevo_cim', models.CharField(blank=True, max_length=255, null=True)),
                ('vevo_adoszam', models.CharField(blank=True, max_length=20, null=True)),
                ('fizetesi_mod', models.CharField(default='Átutalás', max_length=100)),
                ('fizetesi_hatarido', models.DateField(blank=True, null=True)),
                ('megjegyzes', models.TextField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='InvoiceItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('termek_nev', models.CharField(max_length=255)),
                ('mennyiseg', models.DecimalField(decimal_places=2, max_digits=10)),
                ('egysegar', models.DecimalField(decimal_places=2, max_digits=12)),
                ('afa_kulcs', models.DecimalField(decimal_places=2, max_digits=4)),
                ('afa_ertek', models.DecimalField(decimal_places=2, max_digits=12)),
                ('netto_osszeg', models.DecimalField(decimal_places=2, max_digits=12)),
                ('brutto_osszeg', models.DecimalField(decimal_places=2, max_digits=12)),
                ('invoice', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='api.invoice')),
            ],
        ),
    ]
