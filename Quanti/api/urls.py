from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import MobileSessionView, MobileBarcodeView, AggregatedItemView,ReszlegView, RaktarView, ItemsView, RaktarViewId, ItemsViewId, statistics_view, Részleg_details, transaction_pdf, TransactionListView, TransactionTypeListView, CurrentUserView


urlpatterns = [
    path("reszleg/", ReszlegView.as_view(), name="asd"),
    path('reszleg/<uuid:uuid>/', Részleg_details.as_view(), name='Részleg_pontosított_adatok'),
    path('raktar/', RaktarView.as_view(), name='Raktár_Lista'),
    path('raktar/<uuid:uuid>', RaktarViewId.as_view(), name='kiadja a raktárat ezzel a uuid-val'),
    path('items/', ItemsView.as_view(), name='Items_Lista'),
    path('item/<uuid:uuid>', ItemsViewId.as_view(), name='Items_Lista'),
    path('statistics/', statistics_view),
    path('barcode/<int:barcode>', AggregatedItemView.as_view(), name='Items_Barcode'),
    path('get_mobile_session/', MobileSessionView.as_view()),
    path('mobile-barcode/', MobileBarcodeView.as_view()),
    path('transactions/', TransactionListView.as_view(), name='transaction-list'),
    path('transactions/<uuid:pk>/pdf/', transaction_pdf, name='transaction-pdf'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('transaction-types/', TransactionTypeListView.as_view(), name='transaction-type-list'),
    path('current-user/', CurrentUserView.as_view(), name='current-user'),
    ]