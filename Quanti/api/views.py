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
from reportlab.lib.pagesizes import A4
from rest_framework.permissions import IsAuthenticated
from django.db.models.functions import TruncWeek
import json

@api_view(['POST'])
def generate_invoice_pdf(request):
    """
    Számla PDF generálás
    """
    permission_classes = [IsAuthenticated]
    try:
        invoice_data = request.data
        
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="szamla-{invoice_data.get("fejlec", {}).get("szamlaszam", "draft")}.pdf"'
        
        # PDF készítése (egyszerű verzió)
        p = canvas.Canvas(response, pagesize=A4)
        width, height = A4
        
        # Fejléc
        p.setFont("Helvetica-Bold", 16)
        p.drawString(50, height - 50, "SZÁMLA")
        
        # Alapadatok
        p.setFont("Helvetica", 12)
        y = height - 100
        fejlec = invoice_data.get('fejlec', {})
        p.drawString(50, y, f"Számla sorszám: {fejlec.get('szamlaszam', '-')}")
        y -= 20
        p.drawString(50, y, f"Kelt: {fejlec.get('keltDatum', '-')}")
        y -= 20
        p.drawString(50, y, f"Teljesítés: {fejlec.get('teljesitesDatum', '-')}")
        
        # Eladó adatok
        y -= 40
        p.setFont("Helvetica-Bold", 12)
        p.drawString(50, y, "Eladó:")
        p.setFont("Helvetica", 10)
        elado = invoice_data.get('elado', {})
        y -= 15
        p.drawString(50, y, elado.get('nev', '-'))
        y -= 15
        p.drawString(50, y, f"{elado.get('irsz', '')} {elado.get('telepules', '')}")
        y -= 15
        p.drawString(50, y, elado.get('cim', '-'))
        y -= 15
        p.drawString(50, y, f"Adószám: {elado.get('adoszam', '-')}")
        
        # Vevő adatok
        y -= 30
        p.setFont("Helvetica-Bold", 12)
        p.drawString(300, y + 45, "Vevő:")
        p.setFont("Helvetica", 10)
        vevo = invoice_data.get('vevo', {})
        p.drawString(300, y + 30, vevo.get('nev', '-'))
        p.drawString(300, y + 15, f"{vevo.get('irsz', '')} {vevo.get('telepules', '')}")
        p.drawString(300, y, vevo.get('cim', '-'))
        p.drawString(300, y - 15, f"Adószám: {vevo.get('adoszam', '-')}")
        
        # Tételek táblázat
        y -= 60
        p.setFont("Helvetica-Bold", 10)
        p.drawString(50, y, "Megnevezés")
        p.drawString(200, y, "Menny.")
        p.drawString(250, y, "Egységár")
        p.drawString(320, y, "ÁFA%")
        p.drawString(370, y, "Nettó")
        p.drawString(420, y, "ÁFA")
        p.drawString(470, y, "Bruttó")
        
        y -= 20
        p.setFont("Helvetica", 9)
        
        tetelek = invoice_data.get('tetelek', [])
        total_netto = 0
        total_afa = 0
        total_brutto = 0
        
        for item in tetelek:
            if y < 100:  # Új oldal, ha elfogy a hely
                p.showPage()
                y = height - 50
                
            p.drawString(50, y, str(item.get('megnevezes', '-'))[:25])
            p.drawString(200, y, str(item.get('mennyiseg', 0)))
            p.drawString(250, y, f"{item.get('nettoEgysegar', 0):.2f}")
            p.drawString(320, y, f"{item.get('afakulcs', 0):.0f}")
            
            netto = float(item.get('nettoErtek', 0))
            afa = float(item.get('afaErtek', 0))
            brutto = float(item.get('bruttoErtek', 0))
            
            p.drawString(370, y, f"{netto:.2f}")
            p.drawString(420, y, f"{afa:.2f}")
            p.drawString(470, y, f"{brutto:.2f}")
            
            total_netto += netto
            total_afa += afa
            total_brutto += brutto
            
            y -= 15
        
        # Összesítés
        y -= 20
        p.setFont("Helvetica-Bold", 12)
        p.drawString(370, y, f"Összesen:")
        y -= 15
        p.drawString(370, y, f"Nettó: {total_netto:.2f} Ft")
        y -= 15
        p.drawString(370, y, f"ÁFA: {total_afa:.2f} Ft")
        y -= 15
        p.drawString(370, y, f"Bruttó: {total_brutto:.2f} Ft")
        
        p.showPage()
        p.save()
        
        return response
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

class MobileSessionView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # Az ACCESS TOKEN-t adjuk át, nem uuid-t!
        access_token = request.auth.token if hasattr(request.auth, 'token') else str(request.auth)
        url = f"https://quanti.hu/mobile-scan?token={access_token}"
        return Response({"token": access_token, "url": url})

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
        reszleg_id = request.query_params.get('reszleg')  # Get the reszleg parameter

        if reszleg_id:
            try:
                # Ellenőrizd, hogy a részleg létezik és a felhasználóhoz tartozik
                részleg = reszleg.objects.get(id=reszleg_id, user=user)
                raktarok = raktar.objects.filter(részleg=részleg)  # Szűrés a részleg alapján
            except reszleg.DoesNotExist:
                return Response({'error': 'A megadott részleg nem található vagy nincs jogosultság!'}, status=status.HTTP_404_NOT_FOUND)
        else:
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
        depot_id = request.data.get('Depot')
        quantity = int(request.data.get('Mennyiség', 1))
        muvelet = request.data.get('muvelet', 'BE')
        user = request.user if request.user.is_authenticated else None

        try:
            depot_obj = raktar.objects.get(id=depot_id, user=user)
        except raktar.DoesNotExist:
            return Response({'error': 'A megadott raktár nem található vagy nincs jogosultság!'}, status=status.HTTP_404_NOT_FOUND)

        existing = items.objects.filter(barcode=barcode, Depot=depot_obj).first()
        
        # Kiegészítő adatok összeállítása KI művelethez
        additional_data = None
        if muvelet == 'KI':
            additional_data = {
                'megnevezes': request.data.get('name', ''),
                'mertekegyseg': request.data.get('mertekegyseg', 'db'),
                'afa_kulcs': float(request.data.get('afa_kulcs', 27.0)),
                'barcode': barcode,
            }
    
        if existing:
            if 'egysegar' in request.data and request.data.get('egysegar') not in [None, ""]:
                try:
                    existing.egysegar = float(request.data.get('egysegar'))
                except Exception:
                    pass
        
            if muvelet == 'KI':
                existing.Mennyiség -= quantity
                if existing.Mennyiség < 0:
                    return Response({'error': 'Nincs elegendő készlet!'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                existing.Mennyiség += quantity
            
            existing.item_price = existing.Mennyiség * existing.egysegar
            existing.save()
            
            # Tranzakció létrehozása a részletes adatokkal
            create_transaction_for_item(existing, muvelet, user, quantity, additional_data)
            return Response({"detail": f"Mennyiség frissítve ({muvelet})."}, status=status.HTTP_200_OK)
        else:
            if muvelet == 'KI':
                return Response({'error': 'Nem lehet KI műveletet végezni nem létező terméken!'}, status=status.HTTP_400_BAD_REQUEST)
            
        obj = items.objects.create(
            name=request.data.get('name'),
            Depot=depot_obj,
            Mennyiség=quantity,
            barcode=barcode,
            Leirás=request.data.get('Leirás', ''),
            egysegar=request.data.get('egysegar', 0),
            item_price=quantity * float(request.data.get('egysegar', 0)),
            muvelet=muvelet,
            user=user
        )
        create_transaction_for_item(obj, muvelet, user, quantity, additional_data)
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

def create_transaction_for_item(item, muvelet_tipus, user=None, mennyiseg=None, additional_data=None):
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
    
    # Alapértelmezett értékek
    qty = mennyiseg if mennyiseg is not None else item.Mennyiség
    unit_price = item.egysegar or 0
    total_price = qty * unit_price
    
    # KI (eladás) esetén részletes adatok
    transaction_item_data = {
        'transaction': transaction,
        'item': item,
        'quantity': qty,
        'egysegar': unit_price,
        'item_price': total_price,
    }
    
    # Ha KI tranzakció és van kiegészítő adat
    if muvelet_tipus == 'KI' and additional_data:
        # ÁFA számítások
        netto = qty * unit_price
        afa_kulcs = additional_data.get('afa_kulcs', 27.0)
        afa_ertek = netto * (afa_kulcs / 100)
        brutto = netto + afa_ertek
        
        transaction_item_data.update({
            'termek_megnevezes': additional_data.get('megnevezes', item.name),
            'mertekegyseg': additional_data.get('mertekegyseg', 'db'),
            'afa_kulcs': afa_kulcs,
            'netto_ertek': netto,
            'afa_ertek': afa_ertek,
            'brutto_ertek': brutto,
            'barcode': additional_data.get('barcode', item.barcode),
            'depot_name': item.Depot.name if item.Depot else '',
        })
    
    TransactionItem.objects.create(**transaction_item_data)
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
