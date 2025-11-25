from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from decimal import Decimal
from datetime import date, timedelta
from unittest.mock import patch, Mock
from .models import Payment
from .strategy import StripePaymentStrategy, BkashPaymentStrategy, PaymentContext
from bookings.models import Booking
from properties.models import Category, Property

User = get_user_model()


class PaymentStrategyTest(TestCase):
    """Test Payment Strategy Pattern"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='test123'
        )

        self.category = Category.objects.create(
            name='Villa',
            slug='villa'
        )

        self.property = Property.objects.create(
            name='Test Villa',
            slug='test-villa',
            description='Test',
            location='Miami',
            category=self.category,
            price=Decimal('1000.00'),
            bedrooms=4,
            bathrooms=3
        )

        self.booking = Booking.objects.create(
            user=self.user,
            property=self.property,
            visit_date=date.today() + timedelta(days=7)
        )

    @patch('stripe.PaymentIntent.create')
    def test_stripe_create_payment(self, mock_create):
        """Test Stripe payment creation"""
        mock_create.return_value = Mock(
            id='pi_test123',
            client_secret='test_secret',
            status='requires_payment_method'
        )

        strategy = StripePaymentStrategy()
        result = strategy.create_payment(self.booking)

        self.assertTrue(result['success'])
        self.assertEqual(result['transaction_id'], 'pi_test123')
        self.assertIn('client_secret', result)

    @patch('requests.post')
    def test_bkash_create_payment(self, mock_post):
        """Test bKash payment creation"""
        mock_post.return_value = Mock(
            status_code=200,
            json=lambda: {
                'statusCode': '0000',
                'paymentID': 'bkash_test123',
                'bkashURL': 'https://test.bkash.com'
            }
        )

        strategy = BkashPaymentStrategy()
        # Mock token
        strategy.token = 'test_token'

        result = strategy.create_payment(self.booking)

        self.assertTrue(result['success'])
        self.assertIn('transaction_id', result)

    def test_payment_context_switch_strategy(self):
        """Test switching payment strategies"""
        stripe_strategy = StripePaymentStrategy()
        bkash_strategy = BkashPaymentStrategy()

        context = PaymentContext(stripe_strategy)
        self.assertEqual(context._strategy, stripe_strategy)

        context.set_strategy(bkash_strategy)
        self.assertEqual(context._strategy, bkash_strategy)


class PaymentModelTest(TestCase):
    """Test Payment Model"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='test123'
        )

        self.category = Category.objects.create(
            name='Villa',
            slug='villa'
        )

        self.property = Property.objects.create(
            name='Test Villa',
            slug='test-villa',
            description='Test',
            location='Miami',
            category=self.category,
            price=Decimal('1000.00'),
            bedrooms=4,
            bathrooms=3
        )

        self.booking = Booking.objects.create(
            user=self.user,
            property=self.property,
            visit_date=date.today() + timedelta(days=7)
        )

    def test_payment_creation(self):
        """Test payment record creation"""
        payment = Payment.objects.create(
            booking=self.booking,
            provider='stripe',
            transaction_id='test_123',
            amount=self.booking.total_amount,
            currency='USD',
            status='pending'
        )

        self.assertEqual(payment.provider, 'stripe')
        self.assertEqual(payment.status, 'pending')
        self.assertEqual(payment.booking, self.booking)