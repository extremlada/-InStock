from django.urls import path
from .views import Részleg_list, Részleg_details, Raktár_list

urlpatterns = [
    path('reszleg/', Részleg_list, name='Részleg_lista'),
    path('reszleg/<uuid:id>/', Részleg_details, name='Részleg_pontosított_adatok'),
    path('raktar/', Raktár_list, name='Raktár_Lista'),
]