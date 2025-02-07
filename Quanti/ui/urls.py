from django.urls import path
from .views import index

urlpatterns = [
    path('', index),
    path('reszleg', index),
    path('raktar', index)
]
