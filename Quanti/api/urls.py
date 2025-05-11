from django.urls import path
from .views import ReszlegView, RaktarView, ItemsView, RaktarViewId, ItemsViewId, statistics_view, Részleg_details

urlpatterns = [
    path("reszleg/", ReszlegView.as_view(), name="asd"),
    path('reszleg/<uuid:uuid>/', Részleg_details.as_view(), name='Részleg_pontosított_adatok'),
    path('raktar/', RaktarView.as_view(), name='Raktár_Lista'),
    path('raktar/<uuid:uuid>', RaktarViewId.as_view(), name='kiadja a raktárat ezzel a uuid-val'),
    path('items/', ItemsView.as_view(), name='Items_Lista'),
    path('item/<uuid:uuid>', ItemsViewId.as_view(), name='Items_Lista'),
    path('statistics/', statistics_view),
]