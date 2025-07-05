from rest_framework import serializers
from .models import Transaction, TransactionType, raktar, Account, items, reszleg


class TransactionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionType
        fields = ['code', 'label', 'description']


class RaktarShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = raktar
        fields = ['id', 'name']


class UserShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'username', 'email']


class TransactionSerializer(serializers.ModelSerializer):
    user = UserShortSerializer()
    transaction_type = TransactionTypeSerializer()
    source_warehouse = RaktarShortSerializer()
    target_warehouse = RaktarShortSerializer()

    class Meta:
        model = Transaction
        fields = [
            'id', 'unique_number', 'transaction_type', 'created_at',
            'user', 'source_warehouse', 'target_warehouse', 'note'
        ]


class ItemsSerializer(serializers.ModelSerializer):
    class Meta:
        model = items
        fields = ['id', 'name', 'barcode', 'Leirás', 'Mennyiség', 'Depot', 'Date', 'muvelet']


class RaktárSerializer(serializers.ModelSerializer):
    Tárgyak = ItemsSerializer(many=True, required=False, read_only=True)
    class Meta:
        model = raktar
        fields = ['id', 'name', 'részleg', 'Tárgyak', 'Description']


class RészlegSerializer(serializers.ModelSerializer):
    raktarok = RaktárSerializer(many=True, required=False, read_only=True)
    class Meta:
        model = reszleg
        fields = ['id', 'name', 'raktarok']

