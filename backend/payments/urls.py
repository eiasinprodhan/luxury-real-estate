from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PaymentViewSet,
    CreatePaymentView,
    ConfirmPaymentView,
    stripe_webhook,
    bkash_callback,
)

router = DefaultRouter()
router.register(r'', PaymentViewSet, basename='payment')

app_name = 'payments'

urlpatterns = [
    path('', include(router.urls)),
    path('create/', CreatePaymentView.as_view(), name='create-payment'),
    path('<uuid:payment_id>/confirm/', ConfirmPaymentView.as_view(), name='confirm-payment'),
    path('webhooks/stripe/', stripe_webhook, name='stripe-webhook'),
    path('webhooks/bkash/', bkash_callback, name='bkash-callback'),
]