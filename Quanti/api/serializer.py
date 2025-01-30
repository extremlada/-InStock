from rest_framework import serializers
from .models import items, raktar, reszleg


class RészlegSerializer(serializers.ModelSerializer):
    class Meta:
        model = reszleg
        fields = ['id', 'name']

class RaktárSerializer(serializers.ModelSerializer):
    raktarok = RészlegSerializer(many=True, required=False, read_only=True)

    class Meta:
        model = raktar
        fields = ['id', 'name', 'raktarok']
    

class ItemsSerializer(serializers.ModelSerializer):
    Tárgyak = RaktárSerializer(many=True, required=False, read_only=True)

    class Meta:
        model = items
        fields = ['id', 'name', 'barcode', 'description', 'mennyiség', 'Tárgyak']