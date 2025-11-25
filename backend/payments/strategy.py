"""
Strategy Pattern for Payment Providers
This implements different payment strategies (Stripe, bKash)
"""

from abc import ABC, abstractmethod
import stripe
import requests
from django.conf import settings
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)


class PaymentStrategy(ABC):
    """Abstract Base Class for Payment Strategy"""
    
    @abstractmethod
    def create_payment(self, booking, **kwargs):
        """Create a payment"""
        pass
    
    @abstractmethod
    def confirm_payment(self, payment_id, **kwargs):
        """Confirm/Execute a payment"""
        pass
    
    @abstractmethod
    def refund_payment(self, payment_id, amount=None):
        """Refund a payment"""
        pass
    
    @abstractmethod
    def get_payment_status(self, transaction_id):
        """Get payment status"""
        pass


class StripePaymentStrategy(PaymentStrategy):
    """Stripe Payment Implementation"""
    
    def __init__(self):
        stripe.api_key = settings.STRIPE_SECRET_KEY
    
    def create_payment(self, booking, **kwargs):
        """Create Stripe Payment Intent"""
        try:
            # Convert to cents
            amount = int(booking.total_amount * 100)
            
            payment_intent = stripe.PaymentIntent.create(
                amount=amount,
                currency=kwargs.get('currency', 'usd'),
                metadata={
                    'booking_id': str(booking.id),
                    'user_email': booking.user.email,
                },
                description=f"Booking for {booking.property.name}",
            )
            
            return {
                'success': True,
                'transaction_id': payment_intent.id,
                'client_secret': payment_intent.client_secret,
                'amount': booking.total_amount,
                'raw_response': payment_intent,
            }
        
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }
    
    def confirm_payment(self, payment_id, **kwargs):
        """Confirm Stripe Payment"""
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_id)
            
            if payment_intent.status == 'succeeded':
                return {
                    'success': True,
                    'status': 'success',
                    'transaction_id': payment_intent.id,
                }
            else:
                return {
                    'success': False,
                    'status': payment_intent.status,
                }
        
        except stripe.error.StripeError as e:
            return {
                'success': False,
                'error': str(e),
            }
    
    def refund_payment(self, payment_id, amount=None):
        """Refund Stripe Payment"""
        try:
            refund_data = {'payment_intent': payment_id}
            if amount:
                refund_data['amount'] = int(Decimal(str(amount)) * 100)
            
            refund = stripe.Refund.create(**refund_data)
            
            return {
                'success': True,
                'refund_id': refund.id,
                'status': refund.status,
            }
        
        except stripe.error.StripeError as e:
            return {
                'success': False,
                'error': str(e),
            }
    
    def get_payment_status(self, transaction_id):
        """Get Stripe Payment Status"""
        try:
            payment_intent = stripe.PaymentIntent.retrieve(transaction_id)
            return {
                'success': True,
                'status': payment_intent.status,
                'amount': payment_intent.amount / 100,
            }
        except stripe.error.StripeError as e:
            return {
                'success': False,
                'error': str(e),
            }


class BkashPaymentStrategy(PaymentStrategy):
    """bKash Payment Implementation"""
    
    def __init__(self):
        self.app_key = settings.BKASH_APP_KEY
        self.app_secret = settings.BKASH_APP_SECRET
        self.username = settings.BKASH_USERNAME
        self.password = settings.BKASH_PASSWORD
        self.base_url = settings.BKASH_BASE_URL
        self.token = None
    
    def get_token(self):
        """Get bKash Grant Token"""
        url = f"{self.base_url}/tokenized/checkout/token/grant"
        
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'username': self.username,
            'password': self.password,
        }
        
        data = {
            'app_key': self.app_key,
            'app_secret': self.app_secret,
        }
        
        try:
            response = requests.post(url, json=data, headers=headers)
            response.raise_for_status()
            result = response.json()
            self.token = result.get('id_token')
            return self.token
        except requests.RequestException as e:
            logger.error(f"bKash token error: {str(e)}")
            return None
    
    def create_payment(self, booking, **kwargs):
        """Create bKash Payment"""
        if not self.token:
            self.get_token()
        
        url = f"{self.base_url}/tokenized/checkout/create"
        
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'authorization': self.token,
            'x-app-key': self.app_key,
        }
        
        data = {
            'amount': str(booking.total_amount),
            'currency': 'BDT',
            'intent': 'sale',
            'merchantInvoiceNumber': f"INV-{booking.id}",
        }
        
        try:
            response = requests.post(url, json=data, headers=headers)
            response.raise_for_status()
            result = response.json()
            
            if result.get('statusCode') == '0000':
                return {
                    'success': True,
                    'transaction_id': result.get('paymentID'),
                    'bkash_url': result.get('bkashURL'),
                    'amount': booking.total_amount,
                    'raw_response': result,
                }
            else:
                return {
                    'success': False,
                    'error': result.get('statusMessage', 'Unknown error'),
                }
        
        except requests.RequestException as e:
            logger.error(f"bKash create error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }
    
    def confirm_payment(self, payment_id, **kwargs):
        """Execute bKash Payment"""
        if not self.token:
            self.get_token()
        
        url = f"{self.base_url}/tokenized/checkout/execute"
        
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'authorization': self.token,
            'x-app-key': self.app_key,
        }
        
        data = {
            'paymentID': payment_id,
        }
        
        try:
            response = requests.post(url, json=data, headers=headers)
            response.raise_for_status()
            result = response.json()
            
            if result.get('statusCode') == '0000':
                return {
                    'success': True,
                    'status': 'success',
                    'transaction_id': result.get('trxID'),
                }
            else:
                return {
                    'success': False,
                    'status': 'failed',
                    'error': result.get('statusMessage'),
                }
        
        except requests.RequestException as e:
            return {
                'success': False,
                'error': str(e),
            }
    
    def refund_payment(self, payment_id, amount=None):
        """Refund bKash Payment"""
        # Implementation depends on bKash refund API
        # This is a placeholder
        return {
            'success': False,
            'error': 'Refund not implemented for bKash',
        }
    
    def get_payment_status(self, transaction_id):
        """Query bKash Payment Status"""
        if not self.token:
            self.get_token()
        
        url = f"{self.base_url}/tokenized/checkout/payment/status"
        
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'authorization': self.token,
            'x-app-key': self.app_key,
        }
        
        data = {
            'paymentID': transaction_id,
        }
        
        try:
            response = requests.post(url, json=data, headers=headers)
            response.raise_for_status()
            result = response.json()
            
            return {
                'success': True,
                'status': result.get('transactionStatus'),
                'amount': result.get('amount'),
            }
        except requests.RequestException as e:
            return {
                'success': False,
                'error': str(e),
            }


class PaymentContext:
    """Context class that uses payment strategy"""
    
    def __init__(self, strategy: PaymentStrategy):
        self._strategy = strategy
    
    def set_strategy(self, strategy: PaymentStrategy):
        self._strategy = strategy
    
    def create_payment(self, booking, **kwargs):
        return self._strategy.create_payment(booking, **kwargs)
    
    def confirm_payment(self, payment_id, **kwargs):
        return self._strategy.confirm_payment(payment_id, **kwargs)
    
    def refund_payment(self, payment_id, amount=None):
        return self._strategy.refund_payment(payment_id, amount)
    
    def get_payment_status(self, transaction_id):
        return self._strategy.get_payment_status(transaction_id)


def get_payment_strategy(provider):
    """Factory function to get payment strategy"""
    strategies = {
        'stripe': StripePaymentStrategy,
        'bkash': BkashPaymentStrategy,
    }
    
    strategy_class = strategies.get(provider.lower())
    if not strategy_class:
        raise ValueError(f"Unknown payment provider: {provider}")
    
    return strategy_class()