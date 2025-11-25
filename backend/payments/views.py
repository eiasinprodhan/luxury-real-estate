from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from .models import Payment
from .serializers import PaymentSerializer, PaymentCreateSerializer
from .strategy import PaymentContext, get_payment_strategy
from bookings.models import Booking
import stripe
import json
import logging

logger = logging.getLogger(__name__)


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """Payment view (read-only)"""
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin_user():
            return Payment.objects.all()
        return Payment.objects.filter(booking__user=user)


class CreatePaymentView(APIView):
    """Create payment using Strategy Pattern"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = PaymentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        booking_id = serializer.validated_data['booking_id']
        provider = serializer.validated_data['provider']
        currency = serializer.validated_data.get('currency', 'USD')
        
        try:
            booking = Booking.objects.get(id=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if booking.status != 'pending':
            return Response(
                {'error': 'Booking is not pending'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Use Strategy Pattern
        try:
            strategy = get_payment_strategy(provider)
            context = PaymentContext(strategy)
            
            result = context.create_payment(booking, currency=currency)
            
            if result['success']:
                # Create payment record
                payment = Payment.objects.create(
                    booking=booking,
                    provider=provider,
                    transaction_id=result['transaction_id'],
                    amount=result['amount'],
                    currency=currency.upper(),
                    status='processing',
                    raw_response=result.get('raw_response', {}),
                )
                
                response_data = {
                    'payment_id': str(payment.id),
                    'transaction_id': result['transaction_id'],
                    'amount': float(result['amount']),
                    'currency': currency.upper(),
                }
                
                # Add provider-specific data
                if provider == 'stripe':
                    response_data['client_secret'] = result['client_secret']
                elif provider == 'bkash':
                    response_data['bkash_url'] = result['bkash_url']
                
                return Response(response_data, status=status.HTTP_201_CREATED)
            else:
                return Response(
                    {'error': result.get('error', 'Payment creation failed')},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        except Exception as e:
            logger.error(f"Payment creation error: {str(e)}")
            return Response(
                {'error': 'Payment creation failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ConfirmPaymentView(APIView):
    """Confirm payment"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, payment_id):
        try:
            payment = Payment.objects.get(id=payment_id, booking__user=request.user)
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Use Strategy Pattern
        strategy = get_payment_strategy(payment.provider)
        context = PaymentContext(strategy)
        
        result = context.confirm_payment(payment.transaction_id)
        
        if result['success'] and result['status'] == 'success':
            payment.status = 'success'
            payment.save()
            
            # Update booking status
            payment.booking.update_status('paid')
            
            return Response({
                'status': 'success',
                'payment_id': str(payment.id),
                'booking_id': str(payment.booking.id),
            })
        else:
            payment.status = 'failed'
            payment.save()
            
            return Response(
                {'error': result.get('error', 'Payment confirmation failed')},
                status=status.HTTP_400_BAD_REQUEST
            )


@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def stripe_webhook(request):
    """Stripe webhook handler"""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    from django.conf import settings
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        return HttpResponse(status=400)
    
    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        
        try:
            payment = Payment.objects.get(transaction_id=payment_intent['id'])
            payment.status = 'success'
            payment.raw_response = payment_intent
            payment.save()
            
            # Update booking
            payment.booking.update_status('paid')
            
        except Payment.DoesNotExist:
            logger.error(f"Payment not found for transaction: {payment_intent['id']}")
    
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        
        try:
            payment = Payment.objects.get(transaction_id=payment_intent['id'])
            payment.status = 'failed'
            payment.raw_response = payment_intent
            payment.save()
        except Payment.DoesNotExist:
            pass
    
    return HttpResponse(status=200)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def bkash_callback(request):
    """bKash callback handler"""
    # Implementation depends on bKash callback structure
    data = request.data
    
    payment_id = data.get('paymentID')
    status_code = data.get('statusCode')
    
    try:
        payment = Payment.objects.get(transaction_id=payment_id)
        
        if status_code == '0000':
            payment.status = 'success'
            payment.booking.update_status('paid')
        else:
            payment.status = 'failed'
        
        payment.raw_response = data
        payment.save()
        
        return Response({'status': 'success'})
    
    except Payment.DoesNotExist:
        return Response({'error': 'Payment not found'}, status=404)