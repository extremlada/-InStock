from rest_framework import serializers
<<<<<<< HEAD
from .models import Transaction, TransactionType, raktar, Account, items, reszleg
=======
from .models import Transaction, TransactionType, raktar, Account, items, reszleg, TransactionItem
>>>>>>> master


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


<<<<<<< HEAD
=======
class TransactionItemShortSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name')
    egysegar = serializers.DecimalField(source='item.egysegar', max_digits=12, decimal_places=2)
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2)
    muvelet = serializers.CharField(source='item.muvelet')

    class Meta:
        model = TransactionItem
        fields = ['item_name', 'egysegar', 'quantity', 'muvelet']


>>>>>>> master
class TransactionSerializer(serializers.ModelSerializer):
    user = UserShortSerializer()
    transaction_type = TransactionTypeSerializer()
    source_warehouse = RaktarShortSerializer()
    target_warehouse = RaktarShortSerializer()
<<<<<<< HEAD
=======
    items = TransactionItemShortSerializer(many=True, read_only=True)
>>>>>>> master

    class Meta:
        model = Transaction
        fields = [
            'id', 'unique_number', 'transaction_type', 'created_at',
<<<<<<< HEAD
            'user', 'source_warehouse', 'target_warehouse', 'note'
=======
            'user', 'source_warehouse', 'target_warehouse', 'note', 'items'
>>>>>>> master
        ]


class ItemsSerializer(serializers.ModelSerializer):
    class Meta:
        model = items
<<<<<<< HEAD
        fields = ['id', 'name', 'barcode', 'Leirás', 'Mennyiség', 'Depot', 'Date', 'muvelet']
=======
        fields = ['id', 'name', 'barcode', 'Leirás', 'Mennyiség', 'Depot', 'Date', 'muvelet', 'item_price', 'egysegar']
        read_only_fields = ['item_price']
>>>>>>> master


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

