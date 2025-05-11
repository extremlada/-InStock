from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from .models import raktar, reszleg, items
from .serializer import RaktárSerializer, ItemsSerializer, RészlegSerializer
from django.db.models import Sum
from datetime import datetime, timedelta
from django.db.models.functions import TruncWeek  # Add this import for weekly breakdowns


class ReszlegView(APIView):
    serializer_class = RészlegSerializer

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, format=None):
        részleg = reszleg.objects.all()
        serializer = self.serializer_class(részleg, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class Részleg_details(APIView):
    serializer_class = RészlegSerializer

    def get(self, request, uuid, format=None):
        try:
            részleg = reszleg.objects.get(id=uuid)
            serializer = self.serializer_class(részleg)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except reszleg.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


class RaktarView(APIView):
    serializer_class = RaktárSerializer

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, format=None):
        reszleg_id = request.query_params.get('reszleg', None)
        if reszleg_id:
            raktár = raktar.objects.filter(részleg=reszleg_id)
        else:
            raktár = raktar.objects.all()
        serializer = self.serializer_class(raktár, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, format=None):
        raktár = raktar.objects.all()
        serializer = self.serializer_class(raktár, data=request.data, partial=True, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RaktarViewId(APIView):
    def get(self, request, uuid, format=None):
        # Get all items for this depot
        base_items = items.objects.filter(Depot=uuid)
        
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
    def get(self, request, uuid, format=None):
        item = items.objects.get(id=uuid)
        serializer = ItemsSerializer(item)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, uuid, format=None):
        item = items.objects.get(id=uuid)
        serializer = ItemsSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, uuid, format=None):
        item = items.objects.get(id=uuid)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ItemsView(APIView):
    serializer_class = ItemsSerializer

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            # Return additional flag to indicate frontend should refresh statistics
            response_data = {
                **serializer.data,
                'refresh_statistics': True
            }
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, format=None):
        Items = items.objects.all()
        serializer = self.serializer_class(Items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, format=None):
        Items = items.objects.all()
        serializer = self.serializer_class(Items, data=request.data, partial=True, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def statistics_view(request):
    from django.db.models.functions import TruncHour, TruncDay, TruncMonth
    from django.utils import timezone

    now = timezone.now()
    today = now.date()
    current_month = today.month
    current_year = today.year

    # Összegzések
    daily = {
        'bevetel': items.objects.filter(Date__date=today, muvelet='BE').aggregate(Sum('Mennyiség'))['Mennyiség__sum'] or 0,
        'kiadas': items.objects.filter(Date__date=today, muvelet='KI').aggregate(Sum('Mennyiség'))['Mennyiség__sum'] or 0,
    }

    monthly = {
        'bevetel': items.objects.filter(Date__year=current_year, Date__month=current_month, muvelet='BE').aggregate(Sum('Mennyiség'))['Mennyiség__sum'] or 0,
        'kiadas': items.objects.filter(Date__year=current_year, Date__month=current_month, muvelet='KI').aggregate(Sum('Mennyiség'))['Mennyiség__sum'] or 0,
    }

    yearly = {
        'bevetel': items.objects.filter(Date__year=current_year, muvelet='BE').aggregate(Sum('Mennyiség'))['Mennyiség__sum'] or 0,
        'kiadas': items.objects.filter(Date__year=current_year, muvelet='KI').aggregate(Sum('Mennyiség'))['Mennyiség__sum'] or 0,
    }

    # Daily timeline with 30-minute intervals
    daily_breakdown = []
    start_of_day = timezone.make_aware(datetime.combine(today, datetime.min.time()))
    for hour in range(24):
        for minute in [0, 30]:
            time_point = start_of_day + timedelta(hours=hour, minutes=minute)
            next_time = (time_point + timedelta(minutes=30)) if not (hour == 23 and minute == 30) else start_of_day.replace(hour=23, minute=59, second=59)
            
            period_data = {
                'hour': time_point.isoformat(),
                'bevetel': items.objects.filter(
                    Date__gte=time_point,
                    Date__lt=next_time,
                    muvelet='BE'
                ).aggregate(Sum('Mennyiség'))['Mennyiség__sum'] or 0,
                'kiadas': items.objects.filter(
                    Date__gte=time_point,
                    Date__lt=next_time,
                    muvelet='KI'
                ).aggregate(Sum('Mennyiség'))['Mennyiség__sum'] or 0
            }
            daily_breakdown.append(period_data)

    # Monthly breakdown (current month only)
    monthly_data = (
        items.objects.filter(Date__year=current_year, Date__month=current_month)
        .annotate(day=TruncDay('Date'))
        .values('day', 'muvelet')
        .annotate(total=Sum('Mennyiség'))
        .order_by('day')
    )

    monthly_breakdown = []
    for day in monthly_data:
        date_str = day['day'].isoformat()
        existing = next((x for x in monthly_breakdown if x['day'] == date_str), None)
        if existing:
            if day['muvelet'] == 'BE':
                existing['bevetel'] = day['total'] or 0
            else:
                existing['kiadas'] = day['total'] or 0
        else:
            monthly_breakdown.append({
                'day': date_str,
                'bevetel': day['total'] if day['muvelet'] == 'BE' else 0,
                'kiadas': day['total'] if day['muvelet'] == 'KI' else 0
            })

    # Yearly breakdown (current year only)
    yearly_data = (
        items.objects.filter(Date__year=current_year)
        .annotate(month=TruncMonth('Date'))
        .values('month', 'muvelet')
        .annotate(total=Sum('Mennyiség'))
        .order_by('month')
    )

    yearly_breakdown = []
    for month in yearly_data:
        date_str = month['month'].isoformat()
        existing = next((x for x in yearly_breakdown if x['month'] == date_str), None)
        if existing:
            if month['muvelet'] == 'BE':
                existing['bevetel'] = month['total'] or 0
            else:
                existing['kiadas'] = month['total'] or 0
        else:
            yearly_breakdown.append({
                'month': date_str,
                'bevetel': month['total'] if month['muvelet'] == 'BE' else 0,
                'kiadas': month['total'] if month['muvelet'] == 'KI' else 0
            })

    # Weekly breakdown with each day of the week
    weekly_breakdown = []
    for i in range(7):
        day = today - timedelta(days=i)
        daily_data = {
            'day': day.isoformat(),
            'bevetel': items.objects.filter(Date__date=day, muvelet='BE').aggregate(Sum('Mennyiség'))['Mennyiség__sum'] or 0,
            'kiadas': items.objects.filter(Date__date=day, muvelet='KI').aggregate(Sum('Mennyiség'))['Mennyiség__sum'] or 0,
        }
        weekly_breakdown.append(daily_data)

    return Response({
        'nap': daily,
        'honap': monthly,
        'ev': yearly,
        'nap_ido': daily_breakdown,
        'honap_ido': monthly_breakdown,
        'ev_ido': yearly_breakdown,
        'het_ido': weekly_breakdown,
    })