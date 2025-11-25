from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from decimal import Decimal
from datetime import date, timedelta
from .models import Booking
from properties.models import Category, Property

User = get_user_model()


class BookingModelTest(TestCase):
    """Test Booking Model and Algorithms"""

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
            price=Decimal('1000000.00'),
            bedrooms=4,
            bathrooms=3
        )

    def test_booking_creation(self):
        """Test booking creation"""
        booking = Booking.objects.create(
            user=self.user,
            property=self.property,
            visit_date=date.today() + timedelta(days=7)
        )
        self.assertEqual(booking.user, self.user)
        self.assertEqual(booking.property, self.property)
        self.assertEqual(booking.status, 'pending')

    def test_calculate_amounts(self):
        """Test booking amount calculation algorithm"""
        booking = Booking(
            user=self.user,
            property=self.property,
            visit_date=date.today() + timedelta(days=7)
        )

        amounts = booking.calculate_amounts(service_fee_percent=5, tax_percent=10)

        # Base amount = property price
        self.assertEqual(amounts['base_amount'], 1000000.00)

        # Service fee = 5% of base
        self.assertEqual(amounts['service_fee'], 50000.00)

        # Subtotal = base + service fee
        self.assertEqual(amounts['subtotal'], 1050000.00)

        # Tax = 10% of subtotal
        self.assertEqual(amounts['tax_amount'], 105000.00)

        # Total = subtotal + tax
        self.assertEqual(amounts['total_amount'], 1155000.00)

    def test_update_status_valid_transition(self):
        """Test valid status transitions"""
        booking = Booking.objects.create(
            user=self.user,
            property=self.property,
            visit_date=date.today() + timedelta(days=7)
        )

        # pending -> paid
        booking.update_status('paid')
        self.assertEqual(booking.status, 'paid')

        # paid -> completed
        booking.update_status('completed')
        self.assertEqual(booking.status, 'completed')

    def test_update_status_invalid_transition(self):
        """Test invalid status transitions"""
        booking = Booking.objects.create(
            user=self.user,
            property=self.property,
            visit_date=date.today() + timedelta(days=7),
            status='completed'
        )

        # completed -> paid (invalid)
        with self.assertRaises(ValueError):
            booking.update_status('paid')

    def test_can_be_canceled(self):
        """Test cancellation eligibility"""
        booking = Booking.objects.create(
            user=self.user,
            property=self.property,
            visit_date=date.today() + timedelta(days=7)
        )

        self.assertTrue(booking.can_be_canceled())

        booking.status = 'completed'
        booking.save()
        self.assertFalse(booking.can_be_canceled())


class BookingAPITest(APITestCase):
    """Test Booking API endpoints"""

    def setUp(self):
        self.client = APIClient()

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
            price=Decimal('1000000.00'),
            bedrooms=4,
            bathrooms=3,
            status='active'
        )

    def test_create_booking_authenticated(self):
        """Test creating booking when authenticated"""
        self.client.force_authenticate(user=self.user)

        data = {
            'property': self.property.id,
            'visit_date': (date.today() + timedelta(days=7)).isoformat(),
        }

        response = self.client.post('/api/bookings/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_booking_unauthenticated(self):
        """Test creating booking when not authenticated"""
        data = {
            'property': self.property.id,
            'visit_date': (date.today() + timedelta(days=7)).isoformat(),
        }

        response = self.client.post('/api/bookings/', data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_user_bookings(self):
        """Test listing user's bookings"""
        self.client.force_authenticate(user=self.user)

        # Create booking
        Booking.objects.create(
            user=self.user,
            property=self.property,
            visit_date=date.today() + timedelta(days=7)
        )

        response = self.client.get('/api/bookings/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_cancel_booking(self):
        """Test canceling a booking"""
        self.client.force_authenticate(user=self.user)

        booking = Booking.objects.create(
            user=self.user,
            property=self.property,
            visit_date=date.today() + timedelta(days=7)
        )

        response = self.client.post(f'/api/bookings/{booking.id}/cancel/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        booking.refresh_from_db()
        self.assertEqual(booking.status, 'canceled')