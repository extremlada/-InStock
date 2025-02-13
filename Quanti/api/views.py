from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from .models import raktar, reszleg, items
from .serializer import RaktárSerializer, ItemsSerializer, RészlegSerializer


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

class RaktarView(APIView):
    serializer_class = RaktárSerializer
    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
           serializer.save()
           return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, format=None):
        raktár = raktar.objects.all()
        serializer = self.serializer_class(raktár, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ItemsView(APIView):
    serializer_class = ItemsSerializer
    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
           serializer.save()
           return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, format=None):
        Items = items.objects.all()
        serializer = self.serializer_class(Items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)