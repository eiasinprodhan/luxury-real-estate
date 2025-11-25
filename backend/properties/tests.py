from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from decimal import Decimal
from .models import Category, Property

User = get_user_model()


class CategoryModelTest(TestCase):
    """Test Category Model and DFS Algorithm"""

    def setUp(self):
        self.residential = Category.objects.create(
            name='Residential',
            slug='residential'
        )
        self.villa = Category.objects.create(
            name='Villa',
            slug='villa',
            parent=self.residential
        )
        self.luxury_villa = Category.objects.create(
            name='Luxury Villa',
            slug='luxury-villa',
            parent=self.villa
        )

    def test_category_creation(self):
        self.assertEqual(self.residential.name, 'Residential')
        self.assertIsNone(self.residential.parent)

    def test_category_hierarchy(self):
        self.assertEqual(self.villa.parent, self.residential)
        self.assertEqual(self.luxury_villa.parent, self.villa)

    def test_get_all_children_dfs(self):
        """Test DFS algorithm for getting all descendants"""
        children = self.residential.get_all_children()
        self.assertIn(self.villa, children)
        self.assertIn(self.luxury_villa, children)
        self.assertEqual(len(children), 2)

    def test_get_path(self):
        path = self.luxury_villa.get_path()
        self.assertEqual(path, 'Residential > Villa > Luxury Villa')


class PropertyModelTest(TestCase):
    """Test Property Model"""

    def setUp(self):
        self.category = Category.objects.create(
            name='Villa',
            slug='villa'
        )
        self.property = Property.objects.create(
            name='Test Villa',
            slug='test-villa',
            description='Beautiful villa',
            location='Miami',
            category=self.category,
            price=Decimal('1000000.00'),
            bedrooms=4,
            bathrooms=3,
            status='active'
        )

    def test_property_creation(self):
        self.assertEqual(self.property.name, 'Test Villa')
        self.assertEqual(self.property.price, Decimal('1000000.00'))

    def test_is_available(self):
        self.assertTrue(self.property.is_available())
        self.property.status = 'sold'
        self.property.save()
        self.assertFalse(self.property.is_available())

    def test_slug_generation(self):
        prop = Property.objects.create(
            name='New Property',
            description='Test',
            location='LA',
            category=self.category,
            price=Decimal('500000'),
            bedrooms=2,
            bathrooms=2
        )
        self.assertEqual(prop.slug, 'new-property')


class PropertyAPITest(APITestCase):
    """Test Property API endpoints"""

    def setUp(self):
        self.client = APIClient()

        # Create admin user
        self.admin = User.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='admin123',
            user_type='admin'
        )

        # Create regular user
        self.user = User.objects.create_user(
            username='user',
            email='user@test.com',
            password='user123'
        )

        # Create category
        self.category = Category.objects.create(
            name='Villa',
            slug='villa'
        )

        # Create properties
        self.property1 = Property.objects.create(
            name='Villa 1',
            slug='villa-1',
            description='Test',
            location='Miami',
            category=self.category,
            price=Decimal('1000000'),
            bedrooms=4,
            bathrooms=3,
            status='active'
        )

    def test_list_properties(self):
        """Test listing properties"""
        response = self.client.get('/api/properties/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_property_detail(self):
        """Test getting property details"""
        response = self.client.get(f'/api/properties/{self.property1.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Villa 1')

    def test_create_property_as_admin(self):
        """Test creating property as admin"""
        self.client.force_authenticate(user=self.admin)

        data = {
            'name': 'New Villa',
            'description': 'Test villa',
            'location': 'LA',
            'category': self.category.id,
            'price': '2000000.00',
            'bedrooms': 5,
            'bathrooms': 4,
            'status': 'active'
        }

        response = self.client.post('/api/properties/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_property_as_user_forbidden(self):
        """Test that regular users cannot create properties"""
        self.client.force_authenticate(user=self.user)

        data = {
            'name': 'New Villa',
            'description': 'Test villa',
            'location': 'LA',
            'category': self.category.id,
            'price': '2000000.00',
            'bedrooms': 5,
            'bathrooms': 4
        }

        response = self.client.post('/api/properties/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)