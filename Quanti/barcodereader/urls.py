from django.urls import path
from . import views

urlpatterns = [
    path('start-reader/', views.start_barcode_reader, name='start_barcode_reader'),
]
