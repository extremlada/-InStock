from django.db.models import Sum, F, Case, When, DecimalField, Q
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .models import raktar, reszleg, items, Transaction, TransactionType, TransactionItem, Account
from .serializer import RaktárSerializer, ItemsSerializer, RészlegSerializer, TransactionSerializer, UserShortSerializer
from django.db.models import Sum
from datetime import datetime, timedelta
import uuid
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from django.views.generic import ListView
from rest_framework.permissions import IsAuthenticated

from django.db.models.functions import TruncWeek  # Add this import for weekly breakdowns



class MobileSessionView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        token = str(uuid.uuid4())
        url = f"https://d526-212-40-84-22.ngrok-free.app/mobile-scan?token={token}"
        # Itt elmentheted a tokent adatbázisba, ha szükséges
        return Response({"token": token, "url": url})

class MobileBarcodeView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        token = request.data.get("token")
        barcode = request.data.get("barcode")
        # Itt ellenőrizheted és feldolgozhatod a tokent és a vonalkódot
        print(f"Token: {token}, Barcode: {barcode}")
        # ...adatbázisba mentés, stb...
        return Response({"status": "ok"})

class ReszlegView(APIView):
    serializer_class = RészlegSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)  # Automatikusan hozzárendeli az aktuális felhasználót
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, format=None):
        user = request.user
        részleg = reszleg.objects.filter(user=user)  # Csak a felhasználó saját részlegei
        serializer = self.serializer_class(részleg, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class Részleg_details(APIView):
    serializer_class = RészlegSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, uuid, format=None):
        user = request.user
        try:
            részleg = reszleg.objects.get(id=uuid, user=user)
            serializer = self.serializer_class(részleg)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except reszleg.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


class RaktarView(APIView):
    serializer_class = RaktárSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        raktarok = raktar.objects.filter(user=user)  # Csak a felhasználó saját raktárai
        serializer = self.serializer_class(raktarok, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)  # Automatikusan hozzárendeli az aktuális felhasználót
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AggregatedItemView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, barcode):
        qs = items.objects.filter(barcode=barcode, Depot__user=request.user)  # Csak a felhasználó saját raktáraihoz tartozó termékek
        if not qs.exists():
            return Response({"error": "Termék nem található"}, status=status.HTTP_404_NOT_FOUND)

        total_be = qs.filter(muvelet="BE").aggregate(Sum("Mennyiség"))["Mennyiség__sum"] or 0
        total_ki = qs.filter(muvelet="KI").aggregate(Sum("Mennyiség"))["Mennyiség__sum"] or 0
        aktualis_mennyiseg = total_be - total_ki

        legutobbi = qs.order_by("-Date").first()

        return Response({
            "name": legutobbi.name,
            "description": legutobbi.Leirás,
            "barcode": barcode,
            "mennyiseg": aktualis_mennyiseg,
            "Dátum": legutobbi.Date.isoformat(),
            "Depot": legutobbi.Depot.id,
            "id": legutobbi.id,
            "egysegar": legutobbi.egysegar,
        })

class RaktarViewId(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, uuid, format=None):
        # Get all items for this depot
        base_items = items.objects.filter(Depot=uuid, Depot__user=request.user)  # Only items in the user's depot
        
        # Get distinct barcodes
        unique_barcodes = base_items.values('barcode').distinct()
        
        result_items = []
        for barcode_info in unique_barcodes:
            barcode = barcode_info['barcode']
            # Get all items for this barcode
            matching_items = base_items.filter(barcode=barcode)
            
            # Calculate total BE (incoming)
            be_total = matching_items.filter(muvelet='BE').aggregate(
                total=Sum('Mennyiség'))['total'] or 0
                
            # Calculate total KI (outgoing)
            ki_total = matching_items.filter(muvelet='KI').aggregate(
                total=Sum('Mennyiség'))['total'] or 0
                
            # Get the latest item for this barcode to use as our template
            latest_item = matching_items.order_by('-Date').first()
            if latest_item:
                # Calculate net quantity (BE - KI)
                net_quantity = be_total - ki_total
                
                # Only show items that have remaining stock
                if net_quantity > 0:
                    latest_item.Mennyiség = net_quantity
                    latest_item.muvelet = 'BE'  # Set to BE since we're showing net positive stock
                    result_items.append(latest_item)
        
        serializer = ItemsSerializer(result_items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ItemsViewId(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, uuid, format=None):
        item = items.objects.get(id=uuid, Depot__user=request.user)
        serializer = ItemsSerializer(item)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, uuid, format=None):
        item = items.objects.get(id=uuid)
        serializer = ItemsSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, uuid, format=None):
        item = items.objects.get(id=uuid, Depot__user=request.user)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ItemsView(APIView):
    serializer_class = ItemsSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        barcode = request.data.get('barcode')
        depot_id = request.data.get('Depot')  # UUID string érkezik
        quantity = int(request.data.get('Mennyiség', 1))
        muvelet = request.data.get('muvelet', 'BE')
        user = request.user if request.user.is_authenticated else None

        # Lekérjük a raktar objektumot az UUID alapján
        try:
            depot_obj = raktar.objects.get(id=depot_id, user=user)  # Csak a felhasználó saját raktárai
        except raktar.DoesNotExist:
            return Response({'error': 'A megadott raktár nem található vagy nincs jogosultság!'}, status=status.HTTP_404_NOT_FOUND)

        existing = items.objects.filter(barcode=barcode, Depot=depot_obj).first()
        if existing:
            # Mindig frissítsd az egységárat, ha küldik!
            if 'egysegar' in request.data and request.data.get('egysegar') not in [None, ""]:
                try:
                    existing.egysegar = float(request.data.get('egysegar'))
                except Exception:
                    pass
            existing.Mennyiség += quantity
            existing.item_price = existing.Mennyiség * existing.egysegar
            existing.save()
            # Tranzakció generálása (opcionális, ha kell)
            create_transaction_for_item(existing, muvelet, user, quantity)
            return Response({"detail": "Mennyiség és egységár frissítve."}, status=status.HTTP_200_OK)
        else:
            obj = items.objects.create(
                name=request.data.get('name'),
                Depot=depot_obj,  # Az UUID helyett a raktar objektumot adjuk át
                Mennyiség=quantity,
                barcode=barcode,
                Leirás=request.data.get('Leirás', ''),
                egysegar=request.data.get('egysegar', 0),
                item_price=quantity * float(request.data.get('egysegar', 0)),
                muvelet=muvelet,
                user=user  # Felhasználó hozzárendelése
            )
            create_transaction_for_item(obj, muvelet, user, quantity)
            return Response({"detail": "Új termék létrehozva."}, status=status.HTTP_201_CREATED)

    def get(self, request, format=None):
        Items = items.objects.filter(Depot__user=request.user)
        serializer = self.serializer_class(Items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, format=None):
        Items = items.objects.filter(Depot__user=request.user)
        serializer = self.serializer_class(Items, data=request.data, partial=True, many=True)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def statistics_view(request):
    # Annotate month, calculate total for each TransactionItem
    permission_classes = [IsAuthenticated]
    qs = TransactionItem.objects.annotate(
        month=TruncMonth('transaction__created_at'),
        total=F('quantity') * F('item__egysegar'),
        is_revenue=Case(
            When(transaction__transaction_type__code='KI', then=1),
            default=0,
            output_field=DecimalField()
        ),
        is_expense=Case(
            When(transaction__transaction_type__code='BE', then=1),
            default=0,
            output_field=DecimalField()
        ),
    )

    monthly = qs.values('month').annotate(
        net_revenue=Sum('total', filter=Q(is_revenue=1)),
        net_expense=Sum('total', filter=Q(is_expense=1)),
    ).order_by('month')

    result = []
    for row in monthly:
        profit = (row['net_revenue'] or 0) - (row['net_expense'] or 0)
        result.append({
            'month': row['month'].strftime('%Y-%m'),
            'net_revenue': float(row['net_revenue'] or 0),
            'net_expense': float(row['net_expense'] or 0),
            'profit': float(profit)
        })
    return Response(result)

def transaction_pdf(request, pk):
    transaction = Transaction.objects.get(pk=pk)
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="bizonylat_{transaction.unique_number}.pdf"'
    p = canvas.Canvas(response)
    p.drawString(100, 800, f"Bizonylat: {transaction.unique_number}")
    p.drawString(100, 780, f"Típus: {transaction.transaction_type.label}")
    p.drawString(100, 760, f"Dátum: {transaction.created_at.strftime('%Y-%m-%d %H:%M')}")
    p.drawString(100, 740, f"Felhasználó: {transaction.user}")
    y = 700
    for item in transaction.items.all():
        p.drawString(120, y, f"{item.item} - {item.quantity}")
        y -= 20
    p.showPage()
    p.save()
    return response

class TransactionListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        transactions = Transaction.objects.filter(user=request.user).order_by('-created_at')
        # Szűrés GET paraméterek alapján (pl. type, user, stb.)
        ttype = request.GET.get("type")
        if ttype:
            transactions = transactions.filter(transaction_type__code=ttype)
        # További szűrés: user, raktár, dátum, stb. (ha kell)
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)

def create_transaction_for_item(item, muvelet_tipus, user=None, mennyiseg=None):
    permission_classes = [IsAuthenticated]
    try:
        ttype = TransactionType.objects.get(code=muvelet_tipus)
    except TransactionType.DoesNotExist:
        raise ValueError(f"Nincs ilyen TransactionType: {muvelet_tipus}")
    transaction = Transaction.objects.create(
        transaction_type=ttype,
        user=user,
        source_warehouse=item.Depot if muvelet_tipus in ['KI', 'BE'] else None,
        target_warehouse=None,
        note=f"Automatikus bizonylat {ttype.label} művelethez"
    )
    TransactionItem.objects.create(
        transaction=transaction,
        item=item,
        quantity=mennyiseg if mennyiseg is not None else item.Mennyiség  # <-- csak a tényleges mennyiség!
    )
    return transaction

class RestrictedAccessView(APIView):
    def get(self, request, *args, **kwargs):
        # Ellenőrizzük, hogy a felhasználónak van-e jogosultsága a kért raktárhoz
        keresett_raktar_id = kwargs.get('uuid')  # Feltételezzük, hogy az URL-ben van a raktár azonosítója
        if not request.user.is_superuser and not request.user.allowed_warehouses.filter(id=keresett_raktar_id).exists():
            return Response({"error": "Nincs jogosultság!"}, status=403)
        
        # Ha van jogosultság, folytatódik a kérés feldolgozása
        return super().get(request, *args, **kwargs)

class TransactionTypeListView(APIView):
    def get(self, request):
        types = TransactionType.objects.all()
        return Response([
            {"code": t.code, "label": t.label, "description": t.description}
            for t in types
        ])

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserShortSerializer(request.user)
        return Response(serializer.data)

@api_view(['GET'])
def monthly_financial_stats(request):
    permission_classes = [IsAuthenticated]
    # Annotate each item with its total value (quantity * unit price)
    qs = items.objects.annotate(
        total_value=F('Mennyiség') * F('egysegar')
    )

    # Group by month and muvelet (BE = revenue, KI = expense)
    monthly = (
        qs.annotate(month=TruncMonth('Date'))
        .values('month', 'muvelet')
        .annotate(sum_value=Sum('total_value'))
        .order_by('month')
    )

    # Aggregate results
    stats = {}
    for entry in monthly:
        month = entry['month'].strftime('%Y-%m')
        if month not in stats:
            stats[month] = {'revenue': 0, 'expense': 0, 'profit': 0}
        if entry['muvelet'] == 'BE':
            stats[month]['revenue'] += entry['sum_value'] or 0
        elif entry['muvelet'] == 'KI':
            stats[month]['expense'] += entry['sum_value'] or 0

    # Calculate profit for each month
    for month, values in stats.items():
        values['profit'] = values['revenue'] - values['expense']

    return Response(stats)

@api_view(['GET'])
def financial_statistics_view(request):
    permission_classes = [IsAuthenticated]
    # Annotate month, calculate total for each TransactionItem
    qs = TransactionItem.objects.annotate(
        month=TruncMonth('transaction__created_at'),
        is_income=Case(
            When(transaction__transaction_type__code='BE', then=1),
            default=0,
            output_field=DecimalField()
        ),
        is_expense=Case(
            When(transaction__transaction_type__code='KI', then=1),
            default=0,
            output_field=DecimalField()
        ),
        total=F('quantity') * F('item__egysegar')
    )

    monthly = qs.values('month').annotate(
        net_revenue=Sum('total', filter=Q(is_income=1)),
        net_expense=Sum('total', filter=Q(is_expense=1)),
    ).order_by('month')

    result = []
    for row in monthly:
        profit = (row['net_revenue'] or 0) - (row['net_expense'] or 0)
        result.append({
            'month': row['month'].strftime('%Y-%m'),
            'net_revenue': float(row['net_revenue'] or 0),
            'net_expense': float(row['net_expense'] or 0),
            'profit': float(profit)
        })
    return Response(result)

@api_view(['GET'])
def top_products_view(request):
    permission_classes = [IsAuthenticated]
    top_products = (
        TransactionItem.objects
        .filter(transaction__transaction_type__code='KI')
        .values('item__name')
        .annotate(
            total_revenue=Sum(F('quantity') * F('item__egysegar')),
            total_quantity=Sum('quantity')
        )
        .order_by('-total_revenue')[:10]
    )
    return Response(list(top_products))

class RegisterView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        username = request.data.get('username')
        
        if not email or not password or not username:
            return Response({'error': 'Email, felhasználónév és jelszó szükséges!'}, status=status.HTTP_400_BAD_REQUEST)
        
        if Account.objects.filter(email=email).exists():
            return Response({'error': 'Ez az email cím már regisztrálva van!'}, status=status.HTTP_400_BAD_REQUEST)
        
        if Account.objects.filter(username=username).exists():
            return Response({'error': 'Ez a felhasználónév már foglalt!'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = Account.objects.create_user(
                email=email,
                username=username,
                password=password
            )
            return Response({'message': 'Sikeres regisztráció!'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': 'Hiba a regisztráció során!'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
