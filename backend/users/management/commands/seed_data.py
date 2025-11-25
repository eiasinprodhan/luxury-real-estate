from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from properties.models import Category, Property, PropertyImage
from decimal import Decimal

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed database with sample data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')

        # Create admin user
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@luxuryrealestate.com',
                password='admin123',
                user_type='admin'
            )
            self.stdout.write(self.style.SUCCESS('Admin user created'))

        # Create sample customer
        if not User.objects.filter(username='customer').exists():
            User.objects.create_user(
                username='customer',
                email='customer@example.com',
                password='customer123',
                user_type='customer'
            )
            self.stdout.write(self.style.SUCCESS('Sample customer created'))

        # Create categories
        residential = Category.objects.get_or_create(
            name='Residential',
            slug='residential',
            defaults={'description': 'Residential properties'}
        )[0]

        commercial = Category.objects.get_or_create(
            name='Commercial',
            slug='commercial',
            defaults={'description': 'Commercial properties'}
        )[0]

        # Subcategories
        villa = Category.objects.get_or_create(
            name='Villa',
            slug='villa',
            defaults={'parent': residential, 'description': 'Luxury villas'}
        )[0]

        apartment = Category.objects.get_or_create(
            name='Apartment',
            slug='apartment',
            defaults={'parent': residential, 'description': 'Modern apartments'}
        )[0]

        self.stdout.write(self.style.SUCCESS('Categories created'))

        # Create sample properties
        properties_data = [
            {
                'name': 'Luxury Beachfront Villa',
                'slug': 'luxury-beachfront-villa',
                'description': 'Stunning 5-bedroom villa with ocean views',
                'location': 'Malibu, California',
                'category': villa,
                'price': Decimal('5500000.00'),
                'bedrooms': 5,
                'bathrooms': 4,
                'square_feet': 6500,
                'amenities': ['Pool', 'Beach Access', 'Garden', 'Garage'],
                'status': 'active',
            },
            {
                'name': 'Modern Downtown Penthouse',
                'slug': 'modern-downtown-penthouse',
                'description': 'Elegant 3-bedroom penthouse in the heart of the city',
                'location': 'New York, NY',
                'category': apartment,
                'price': Decimal('3200000.00'),
                'bedrooms': 3,
                'bathrooms': 3,
                'square_feet': 3200,
                'amenities': ['Gym', 'Concierge', 'Rooftop Terrace'],
                'status': 'active',
            },
            {
                'name': 'Hillside Estate',
                'slug': 'hillside-estate',
                'description': 'Magnificent estate with panoramic views',
                'location': 'Beverly Hills, CA',
                'category': villa,
                'price': Decimal('12000000.00'),
                'bedrooms': 8,
                'bathrooms': 10,
                'square_feet': 15000,
                'amenities': ['Pool', 'Tennis Court', 'Wine Cellar', 'Home Theater'],
                'status': 'active',
            },
        ]

        for prop_data in properties_data:
            Property.objects.get_or_create(
                slug=prop_data['slug'],
                defaults=prop_data
            )

        self.stdout.write(self.style.SUCCESS('Properties created'))
        self.stdout.write(self.style.SUCCESS('Data seeding completed!'))