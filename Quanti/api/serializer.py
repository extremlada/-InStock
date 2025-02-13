from rest_framework import serializers
from .models import items, raktar, reszleg



class ItemsSerializer(serializers.ModelSerializer):

    class Meta:
        model = items
        fields = ['id', 'name', 'barcode', 'Leirás', 'Mennyiség', 'Depot']


class RaktárSerializer(serializers.ModelSerializer):
    Tárgyak = ItemsSerializer(many=True, required=False, read_only=True)
    class Meta:
        model = raktar
        fields = ['id', 'name', 'részleg', 'Tárgyak']


class RészlegSerializer(serializers.ModelSerializer):
    raktarok = RaktárSerializer(many=True, required=False, read_only=True)
    class Meta:
        model = reszleg
        fields = ['id', 'name', 'raktarok']

