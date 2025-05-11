from django.urls import path
from .views import index

urlpatterns = [
    path('', index),
    path('reszleg', index),
    path('reszleg/<uuid:uuid>', index),
    path('raktar', index),
    path('raktar/<uuid:uuid>', index)
]
