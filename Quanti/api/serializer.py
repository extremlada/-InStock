from rest_framework import serializers
from .models import items, raktar, reszleg


class RészlegSerializer(serializers.ModelSerializer):
    class Meta:
        model = reszleg
        fields = ['id', 'név']

class RaktárSerializer(serializers.ModelSerializer):
    raktarok = RészlegSerializer(many=True, required=False, read_only=True)

    class Meta:
        model = raktar
        fields = ['id', 'név', 'raktarok']

    def create(self, validated_data):
        raktar_data = validated_data.pop('raktarok', [])
        részleg = reszleg.objects.create(**validated_data)
        for raktarok_data in raktar_data:
            raktarok_serializer = RészlegSerializer(data=raktarok_data)
            raktarok_serializer.is_valid(raise_exception=True)
            raktarok_serializer.save(részleg=részleg)
        return részleg
    

class ItemsSerializer(serializers.ModelSerializer):
    Tárgyak = RaktárSerializer(many=True, required=False, read_only=True)

    class Meta:
        model = items
        fields = ['id', 'név', 'barcode', 'description', 'mennyiség', 'Tárgyak']

    def create(self, validated_data):
        Tárgy_data = validated_data.pop('Tárgyak', [])
        Tárgy = reszleg.objects.create(**validated_data)
        for Tárgyak_data in Tárgy_data:
            tárgyak_serializer = RaktárSerializer(data=Tárgyak_data)
            tárgyak_serializer.is_valid(raise_exception=True)
            tárgyak_serializer.save(Tárgy=Tárgy)
        return Tárgy