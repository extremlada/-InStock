from django.urls import path
from .views import ReszlegView, RaktarView, ItemsView, RaktarViewId, ItemsViewId

urlpatterns = [
    path("reszleg/", ReszlegView.as_view(), name="asd"),
    #path('reszleg/<uuid:id>/', Részleg_details, name='Részleg_pontosított_adatok'),
    path('raktar/', RaktarView.as_view(), name='Raktár_Lista'),
    path('items/<uuid:uuid>', RaktarViewId.as_view(), name='Raktár_Lista'),
    path('items/', ItemsView.as_view(), name='Items_Lista'),
    path('item/<uuid:uuid>', ItemsViewId.as_view(), name='Items_Lista')
]