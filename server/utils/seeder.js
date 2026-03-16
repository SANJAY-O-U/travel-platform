// ============================================================
// Database Seeder - Populates DB with sample data
// Run: node utils/seeder.js
// ============================================================

require('dotenv').config(); // ✅ Fixed: use default path, not '../.env'
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Flight = require('../models/Flight');
const TravelPackage = require('../models/TravelPackage');
const Review = require('../models/Review');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/travel-platform';

// ✅ Fixed: slugify declared ONCE outside seedDB so it's always available
const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

const HOTEL_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
  'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
];

const PACKAGE_IMAGES = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
  'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800',
  'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800',
];

// ✅ Fixed: every hotel has a unique slug assigned manually using slugify + index
const hotels = [
  {
    name: 'The Grand Azure Resort',
    slug: slugify('The Grand Azure Resort') + '-1',
    description:
      'Perched on the pristine shores of Maldives, The Grand Azure Resort offers an unparalleled luxury experience. Wake up to turquoise lagoons, dine at underwater restaurants, and surrender to world-class spa treatments.',
    shortDescription: 'Ultimate luxury overwater villas in the heart of Maldives',
    propertyType: 'Resort',
    starRating: 5,
    location: {
      address: 'North Malé Atoll',
      city: 'Maldives',
      country: 'Maldives',
      coordinates: { type: 'Point', coordinates: [73.5093, 4.1755] },
      nearbyAttractions: [
       'Coral Reef', 
        'Dolphin Cove'
      ],
    },
    coverImage: { url: HOTEL_IMAGES[0] },
    images: [
      { url: HOTEL_IMAGES[0], isPrimary: true },
      { url: HOTEL_IMAGES[1] },
      { url: HOTEL_IMAGES[2] },
    ],
    amenities: {
      general: ['Free WiFi', 'Private Beach', 'Infinity Pool', 'Air Conditioning'],
      dining: ['Underwater Restaurant', 'Rooftop Bar', 'Room Service', 'Beach BBQ'],
      services: ['24hr Concierge', 'Spa', 'Butler Service', 'Airport Transfer'],
      recreation: ['Snorkeling', 'Diving', 'Kayaking', 'Tennis Court'],
    },
    rooms: [
      {
        roomType: 'Deluxe',
        pricePerNight: 450,
        maxGuests: 2,
        bedType: 'King',
        size: 55,
        totalRooms: 20,
        amenities: ['Ocean View', 'Balcony', 'Mini Bar'],
      },
      {
        roomType: 'Suite',
        pricePerNight: 750,
        maxGuests: 3,
        bedType: 'King',
        size: 90,
        totalRooms: 10,
        amenities: ['Private Pool', 'Ocean View', 'Jacuzzi'],
      },
      {
        roomType: 'Presidential',
        pricePerNight: 1500,
        maxGuests: 4,
        bedType: 'King',
        size: 200,
        totalRooms: 2,
        amenities: ['Private Beach', 'Butler', 'Cinema Room'],
      },
    ],
    priceRange: { min: 450, max: 1500 },
    ratings: {
      overall: 4.9,
      cleanliness: 5.0,
      location: 4.8,
      service: 4.9,
      valueForMoney: 4.7,
      facilities: 4.9,
    },
    reviewCount: 847,
    policies: {
      checkIn: '3:00 PM',
      checkOut: '11:00 AM',
      cancellation: 'Flexible',
    },
    isFeatured: true,
    isVerified: true,
    isActive: true,
    tags: ['Overwater Villa', 'Luxury', 'Maldives', 'Honeymoon', 'Beach'],
    totalBookings: 1240,
    totalRevenue: 892000,
  },
  {
    name: 'Santorini Cliffside Suites',
    slug: slugify('Santorini Cliffside Suites') + '-2',
    description:
      'Carved into the volcanic cliffs of Oia, Santorini Cliffside Suites blends Cycladic architecture with modern luxury. Each suite features private infinity pools overlooking the iconic caldera and Aegean Sea.',
    shortDescription: 'Iconic caldera views with private infinity pools in Santorini',
    propertyType: 'Boutique Hotel',
    starRating: 5,
    location: {
      address: 'Oia Village, Santorini',
      city: 'Santorini',
      country: 'Greece',
      coordinates: { type: 'Point', coordinates: [25.3748, 36.4618] },
      nearbyAttractions: [
      'Oia Castle', 
      'Red Beach'
      ],
    },
    coverImage: { url: HOTEL_IMAGES[1] },
    images: [
      { url: HOTEL_IMAGES[1], isPrimary: true },
      { url: HOTEL_IMAGES[3] },
      { url: HOTEL_IMAGES[5] },
    ],
    amenities: {
      general: ['Free WiFi', 'Infinity Pool', 'Air Conditioning', 'Terrace'],
      dining: ['Mediterranean Restaurant', 'Champagne Bar', 'Breakfast in Bed'],
      services: ['Concierge', 'Spa', 'Airport Transfer', 'Wine Tasting'],
      recreation: ['Sunset Cruise', 'Wine Tour', 'Cooking Class'],
    },
    rooms: [
      {
        roomType: 'Deluxe',
        pricePerNight: 380,
        maxGuests: 2,
        bedType: 'Queen',
        size: 45,
        totalRooms: 15,
        amenities: ['Caldera View', 'Private Terrace'],
      },
      {
        roomType: 'Suite',
        pricePerNight: 680,
        maxGuests: 2,
        bedType: 'King',
        size: 75,
        totalRooms: 8,
        amenities: ['Private Infinity Pool', 'Caldera View', 'Jacuzzi'],
      },
    ],
    priceRange: { min: 380, max: 680 },
    ratings: {
      overall: 4.8,
      cleanliness: 4.9,
      location: 5.0,
      service: 4.7,
      valueForMoney: 4.6,
      facilities: 4.8,
    },
    reviewCount: 612,
    policies: {
      checkIn: '3:00 PM',
      checkOut: '11:00 AM',
      cancellation: 'Flexible',
    },
    isFeatured: true,
    isVerified: true,
    isActive: true,
    tags: ['Santorini', 'Caldera View', 'Romantic', 'Honeymoon', 'Greece'],
    totalBookings: 980,
    totalRevenue: 540000,
  },
  {
    name: 'Tokyo Skyline Tower Hotel',
    slug: slugify('Tokyo Skyline Tower Hotel') + '-3',
    description:
      'Located in the heart of Shinjuku, Tokyo Skyline Tower Hotel offers breathtaking panoramic views of Mount Fuji and the Tokyo cityscape. Combining Japanese minimalism with cutting-edge technology.',
    shortDescription: 'Panoramic Tokyo views with Japanese luxury in Shinjuku',
    propertyType: 'Hotel',
    starRating: 5,
    location: {
      address: '2-7-2 Nishi-Shinjuku, Shinjuku-ku',
      city: 'Tokyo',
      country: 'Japan',
      coordinates: { type: 'Point', coordinates: [139.6917, 35.6895] },
      nearbyAttractions: [
        'Shinjuku Gyoen', 
        'Tokyo Metropolitan Government'
      ],
    },
    coverImage: { url: HOTEL_IMAGES[2] },
    images: [
      { url: HOTEL_IMAGES[2], isPrimary: true },
      { url: HOTEL_IMAGES[4] },
      { url: HOTEL_IMAGES[6] },
    ],
    amenities: {
      general: ['Free WiFi', 'Rooftop Pool', 'Fitness Center', 'Business Center'],
      dining: ['Teppanyaki Restaurant', 'Sushi Bar', 'Sky Bar', 'Room Service'],
      services: ['Concierge', 'Spa', 'Valet Parking', 'Translation Services'],
      recreation: ['Pool', 'Gym', 'Karaoke Lounge', 'Tea Ceremony'],
    },
    rooms: [
      {
        roomType: 'Standard',
        pricePerNight: 220,
        maxGuests: 2,
        bedType: 'Double',
        size: 32,
        totalRooms: 50,
        amenities: ['City View', 'Work Desk'],
      },
      {
        roomType: 'Deluxe',
        pricePerNight: 320,
        maxGuests: 2,
        bedType: 'King',
        size: 48,
        totalRooms: 30,
        amenities: ['Mt Fuji View', 'Bathtub', 'Lounge Access'],
      },
      {
        roomType: 'Suite',
        pricePerNight: 580,
        maxGuests: 3,
        bedType: 'King',
        size: 80,
        totalRooms: 12,
        amenities: ['Panoramic View', 'Living Room', 'Dining Area'],
      },
    ],
    priceRange: { min: 220, max: 580 },
    ratings: {
      overall: 4.7,
      cleanliness: 4.8,
      location: 4.9,
      service: 4.6,
      valueForMoney: 4.5,
      facilities: 4.7,
    },
    reviewCount: 1253,
    policies: {
      checkIn: '3:00 PM',
      checkOut: '11:00 AM',
      cancellation: 'Moderate',
    },
    isFeatured: true,
    isVerified: true,
    isActive: true,
    tags: ['Tokyo', 'City Hotel', 'Business', 'Japan', 'Luxury'],
    totalBookings: 2100,
    totalRevenue: 680000,
  },
  {
    name: 'Bali Jungle Eco Lodge',
    slug: slugify('Bali Jungle Eco Lodge') + '-4',
    description:
      'Nestled amid ancient rice terraces and lush tropical jungle in Ubud, Bali Jungle Eco Lodge provides an immersive cultural experience. Each villa features a private plunge pool and traditional Balinese architecture.',
    shortDescription: 'Serene Balinese jungle villas with rice terrace views in Ubud',
    propertyType: 'Villa',
    starRating: 4,
    location: {
      address: 'Jalan Kajeng, Ubud',
      city: 'Bali',
      country: 'Indonesia',
      coordinates: { type: 'Point', coordinates: [115.2625, -8.5069] },
      nearbyAttractions: [
       'Tegalalang Rice Terraces',
       'Sacred Monkey Forest'
      ],
    },
    coverImage: { url: HOTEL_IMAGES[3] },
    images: [
      { url: HOTEL_IMAGES[3], isPrimary: true },
      { url: HOTEL_IMAGES[7] },
      { url: HOTEL_IMAGES[0] },
    ],
    amenities: {
      general: ['Free WiFi', 'Private Pool', 'Air Conditioning', 'Garden'],
      dining: ['Organic Restaurant', 'Pool Bar', 'Cooking Classes'],
      services: ['Spa', 'Yoga Classes', 'Bike Rental', 'Temple Tours'],
      recreation: ['Meditation Garden', 'Pool', 'Cultural Performances'],
    },
    rooms: [
      {
        roomType: 'Standard',
        pricePerNight: 110,
        maxGuests: 2,
        bedType: 'Queen',
        size: 40,
        totalRooms: 12,
        amenities: ['Garden View', 'Outdoor Shower'],
      },
      {
        roomType: 'Deluxe',
        pricePerNight: 185,
        maxGuests: 2,
        bedType: 'King',
        size: 65,
        totalRooms: 8,
        amenities: ['Rice Terrace View', 'Private Pool', 'Outdoor Bath'],
      },
      {
        roomType: 'Suite',
        pricePerNight: 280,
        maxGuests: 3,
        bedType: 'King',
        size: 95,
        totalRooms: 4,
        amenities: ['Jungle View', 'Private Pool', 'Separate Villa'],
      },
    ],
    priceRange: { min: 110, max: 280 },
    ratings: {
      overall: 4.6,
      cleanliness: 4.7,
      location: 4.5,
      service: 4.8,
      valueForMoney: 4.9,
      facilities: 4.5,
    },
    reviewCount: 439,
    policies: {
      checkIn: '2:00 PM',
      checkOut: '12:00 PM',
      cancellation: 'Flexible',
    },
    isFeatured: true,
    isVerified: true,
    isActive: true,
    tags: ['Bali', 'Eco Lodge', 'Jungle', 'Yoga', 'Cultural', 'Budget Luxury'],
    totalBookings: 780,
    totalRevenue: 210000,
  },
  {
    name: 'Dubrovnik Pearl Hotel',
    slug: slugify('Dubrovnik Pearl Hotel') + '-5',
    description:
      "Overlooking the crystalline Adriatic Sea and the UNESCO-listed Old City walls, Dubrovnik Pearl Hotel is your gateway to Croatia's most beloved coastal gem.",
    shortDescription: "Adriatic views with steps to Dubrovnik's famous Old Town",
    propertyType: 'Hotel',
    starRating: 4,
    location: {
      address: 'Ul. Branitelja Dubrovnika 41',
      city: 'Dubrovnik',
      country: 'Croatia',
      coordinates: { type: 'Point', coordinates: [18.0944, 42.6507] },
      nearbyAttractions: [
     'Old City Walls', 
     'Banje Beach'
      ],
    },
    coverImage: { url: HOTEL_IMAGES[4] },
    images: [
      { url: HOTEL_IMAGES[4], isPrimary: true },
      { url: HOTEL_IMAGES[2] },
    ],
    amenities: {
      general: ['Free WiFi', 'Outdoor Pool', 'Sea View Terrace', 'Air Conditioning'],
      dining: ['Seafood Restaurant', 'Cocktail Bar', 'Breakfast Buffet'],
      services: ['Concierge', 'Airport Shuttle', 'Bike Rental'],
      recreation: ['Pool', 'Water Sports', 'City Tours'],
    },
    rooms: [
      {
        roomType: 'Standard',
        pricePerNight: 175,
        maxGuests: 2,
        bedType: 'Double',
        size: 28,
        totalRooms: 25,
        amenities: ['City View'],
      },
      {
        roomType: 'Deluxe',
        pricePerNight: 265,
        maxGuests: 2,
        bedType: 'King',
        size: 42,
        totalRooms: 15,
        amenities: ['Sea View', 'Balcony', 'Bathtub'],
      },
    ],
    priceRange: { min: 175, max: 265 },
    ratings: {
      overall: 4.5,
      cleanliness: 4.6,
      location: 4.8,
      service: 4.4,
      valueForMoney: 4.3,
      facilities: 4.4,
    },
    reviewCount: 328,
    policies: {
      checkIn: '3:00 PM',
      checkOut: '11:00 AM',
      cancellation: 'Moderate',
    },
    isFeatured: false,
    isVerified: true,
    isActive: true,
    tags: ['Dubrovnik', 'Croatia', 'Adriatic', 'Old Town', 'Beach'],
    totalBookings: 560,
    totalRevenue: 145000,
  },
  {
    name: 'Marrakech Riad Luxe',
    slug: slugify('Marrakech Riad Luxe') + '-6',
    description:
      'Hidden behind ancient medina walls, Marrakech Riad Luxe is a traditional Moroccan palace transformed into an intimate luxury retreat. Central courtyard fountains, handcrafted tiles, and authentic hammam experiences.',
    shortDescription: 'Authentic Moroccan palace experience in the heart of the Medina',
    propertyType: 'Boutique Hotel',
    starRating: 5,
    location: {
      address: 'Derb Sidi Ahmed Ou Moussa, Medina',
      city: 'Marrakech',
      country: 'Morocco',
      coordinates: { type: 'Point', coordinates: [-7.9811, 31.6295] },
      nearbyAttractions: [
     'Jemaa el-Fnaa', 
        'Bahia Palace'
      ],
    },
    coverImage: { url: HOTEL_IMAGES[5] },
    images: [
      { url: HOTEL_IMAGES[5], isPrimary: true },
      { url: HOTEL_IMAGES[7] },
    ],
    amenities: {
      general: ['Free WiFi', 'Rooftop Terrace', 'Courtyard Pool', 'Air Conditioning'],
      dining: ['Moroccan Restaurant', 'Rooftop Dining', 'Cooking Workshop'],
      services: ['Hammam', 'Spa', 'Guided Medina Tours', 'Airport Transfer'],
      recreation: ['Rooftop Pool', 'Hammam', 'Cultural Tours'],
    },
    rooms: [
      {
        roomType: 'Standard',
        pricePerNight: 145,
        maxGuests: 2,
        bedType: 'Double',
        size: 30,
        totalRooms: 8,
        amenities: ['Courtyard View', 'Moroccan Decor'],
      },
      {
        roomType: 'Suite',
        pricePerNight: 290,
        maxGuests: 2,
        bedType: 'King',
        size: 65,
        totalRooms: 4,
        amenities: ['Rooftop Access', 'Private Terrace', 'Jacuzzi'],
      },
    ],
    priceRange: { min: 145, max: 290 },
    ratings: {
      overall: 4.8,
      cleanliness: 4.7,
      location: 4.9,
      service: 4.9,
      valueForMoney: 4.8,
      facilities: 4.6,
    },
    reviewCount: 215,
    policies: {
      checkIn: '3:00 PM',
      checkOut: '12:00 PM',
      cancellation: 'Flexible',
    },
    isFeatured: true,
    isVerified: true,
    isActive: true,
    tags: ['Marrakech', 'Riad', 'Morocco', 'Cultural', 'Luxury'],
    totalBookings: 340,
    totalRevenue: 89000,
  },
  {
    name: 'New York Midtown Grand',
    slug: slugify('New York Midtown Grand') + '-7',
    description:
      "Commanding the Manhattan skyline from its prime Midtown location, New York Midtown Grand offers iconic views of Central Park and the Empire State Building. Sophisticated rooms, Michelin-star dining, and legendary service.",
    shortDescription: 'Manhattan luxury with Central Park views and iconic skyline',
    propertyType: 'Hotel',
    starRating: 5,
    location: {
      address: '151 West 54th Street, Midtown',
      city: 'New York',
      country: 'USA',
      coordinates: { type: 'Point', coordinates: [-73.9857, 40.7614] },
      nearbyAttractions: [
      'Central Park', 
      'Times Square'
      ],
    },
    coverImage: { url: HOTEL_IMAGES[6] },
    images: [
      { url: HOTEL_IMAGES[6], isPrimary: true },
      { url: HOTEL_IMAGES[1] },
    ],
    amenities: {
      general: ['Free WiFi', 'Fitness Center', 'Business Center', 'Concierge'],
      dining: ['Michelin Star Restaurant', 'Rooftop Bar', 'Lobby Lounge', '24hr Room Service'],
      services: ['Valet Parking', 'Spa', 'Limousine Service', 'Personal Shopper'],
      recreation: ['Gym', 'Spa', 'Rooftop Terrace'],
    },
    rooms: [
      {
        roomType: 'Standard',
        pricePerNight: 350,
        maxGuests: 2,
        bedType: 'Queen',
        size: 30,
        totalRooms: 80,
        amenities: ['City View', 'Work Desk', 'Keurig'],
      },
      {
        roomType: 'Deluxe',
        pricePerNight: 520,
        maxGuests: 2,
        bedType: 'King',
        size: 45,
        totalRooms: 40,
        amenities: ['Central Park View', 'Marble Bathroom'],
      },
      {
        roomType: 'Suite',
        pricePerNight: 950,
        maxGuests: 4,
        bedType: 'King',
        size: 110,
        totalRooms: 15,
        amenities: ['Skyline View', 'Living Room', 'Dining Area'],
      },
    ],
    priceRange: { min: 350, max: 950 },
    ratings: {
      overall: 4.7,
      cleanliness: 4.8,
      location: 5.0,
      service: 4.6,
      valueForMoney: 4.2,
      facilities: 4.7,
    },
    reviewCount: 2134,
    policies: {
      checkIn: '4:00 PM',
      checkOut: '12:00 PM',
      cancellation: 'Strict',
    },
    isFeatured: true,
    isVerified: true,
    isActive: true,
    tags: ['New York', 'Manhattan', 'Business', 'Luxury', 'City Break'],
    totalBookings: 3400,
    totalRevenue: 1200000,
  },
  {
    name: 'Cape Town Ocean Escape',
    slug: slugify('Cape Town Ocean Escape') + '-8',
    description:
      "Dramatically situated between Table Mountain and the Atlantic Ocean, Cape Town Ocean Escape offers one of the world's most breathtaking hotel settings. Contemporary African design meets world-class amenities.",
    shortDescription: "Between Table Mountain and the Atlantic — Cape Town's finest stay",
    propertyType: 'Hotel',
    starRating: 4,
    location: {
      address: 'Victoria & Alfred Waterfront',
      city: 'Cape Town',
      country: 'South Africa',
      coordinates: { type: 'Point', coordinates: [18.4241, -33.9249] },
      nearbyAttractions: [
      'Table Mountain',
      'V&A Waterfront'
      ],
    },
    coverImage: { url: HOTEL_IMAGES[7] },
    images: [
      { url: HOTEL_IMAGES[7], isPrimary: true },
      { url: HOTEL_IMAGES[3] },
    ],
    amenities: {
      general: ['Free WiFi', 'Rooftop Pool', 'Mountain View', 'Air Conditioning'],
      dining: ['Cape Fusion Restaurant', 'Wine Bar', 'Breakfast Buffet'],
      services: ['Spa', 'Airport Transfer', 'Wine Tours', 'Safari Booking'],
      recreation: ['Rooftop Pool', 'Gym', 'Yoga Classes'],
    },
    rooms: [
      {
        roomType: 'Standard',
        pricePerNight: 160,
        maxGuests: 2,
        bedType: 'Double',
        size: 32,
        totalRooms: 30,
        amenities: ['Garden View'],
      },
      {
        roomType: 'Deluxe',
        pricePerNight: 240,
        maxGuests: 2,
        bedType: 'King',
        size: 50,
        totalRooms: 20,
        amenities: ['Mountain View', 'Balcony'],
      },
      {
        roomType: 'Suite',
        pricePerNight: 420,
        maxGuests: 3,
        bedType: 'King',
        size: 80,
        totalRooms: 8,
        amenities: ['Ocean View', 'Plunge Pool', 'Living Room'],
      },
    ],
    priceRange: { min: 160, max: 420 },
    ratings: {
      overall: 4.6,
      cleanliness: 4.7,
      location: 4.8,
      service: 4.5,
      valueForMoney: 4.6,
      facilities: 4.5,
    },
    reviewCount: 567,
    policies: {
      checkIn: '3:00 PM',
      checkOut: '11:00 AM',
      cancellation: 'Flexible',
    },
    isFeatured: false,
    isVerified: true,
    isActive: true,
    tags: ['Cape Town', 'South Africa', 'Table Mountain', 'Safari', 'Ocean View'],
    totalBookings: 890,
    totalRevenue: 260000,
  },
];

const packages = [
  {
    title: 'Bali Paradise: 7 Days of Culture & Serenity',
    slug: slugify('Bali Paradise 7 Days of Culture and Serenity') + '-1',
    description:
      "Immerse yourself in Bali's spiritual heart. From the emerald rice terraces of Ubud to the surf-kissed shores of Seminyak, this curated journey blends culture, nature, and luxury.",
    shortDescription: '7 days exploring Bali culture, temples, and beaches',
    destination: { city: 'Bali', country: 'Indonesia', region: 'Southeast Asia' },
    duration: { days: 7, nights: 6 },
    packageType: 'Cultural',
    pricing: { perPerson: 1299, originalPrice: 1599, currency: 'USD' },
    groupSize: { min: 1, max: 20 },
    difficulty: 'Easy',
    includes: {
      flights: true,
      accommodation: true,
      meals: 'Breakfast',
      transfers: true,
      guide: true,
      insurance: false,
      activities: ['Temple Tours', 'Rice Terrace Trek', 'Cooking Class'],
    },
    highlights: [
      'Tanah Lot Temple at Sunset',
      'Ubud Monkey Forest',
      'Traditional Cooking Class',
      'Rice Terrace Trek',
      'Balinese Spa Day',
    ],
    coverImage: { url: PACKAGE_IMAGES[0] },
    images: [{ url: PACKAGE_IMAGES[0] }, { url: PACKAGE_IMAGES[1] }],
    tags: ['Bali', 'Culture', 'Beach', 'Temples', 'Yoga'],
    isFeatured: true,
    isBestSeller: true,
    isActive: true,
    ratings: { overall: 4.8, reviewCount: 234 },
    bookingCount: 1240,
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Denpasar & Seminyak',
        description: 'Arrive and check into your beachside hotel',
        activities: ['Airport pickup', 'Hotel check-in', 'Seminyak beach sunset', 'Welcome dinner'],
        meals: { breakfast: false, lunch: false, dinner: true },
        accommodation: 'Seminyak Beach Resort',
        transport: 'Private transfer',
      },
      {
        day: 2,
        title: 'Ubud Cultural Day',
        description: 'Explore the cultural heart of Bali',
        activities: ['Tegalalang Rice Terraces', 'Monkey Forest', 'Ubud Art Market', 'Traditional Dance Show'],
        meals: { breakfast: true, lunch: true, dinner: false },
        accommodation: 'Ubud Jungle Villa',
        transport: 'Private driver',
      },
      {
        day: 3,
        title: 'Temple Trail',
        description: 'Visit Balis most sacred temples',
        activities: ['Tanah Lot Temple', 'Uluwatu Cliff Temple', 'Kecak Fire Dance'],
        meals: { breakfast: true, lunch: false, dinner: true },
        accommodation: 'Ubud Jungle Villa',
        transport: 'Private driver',
      },
    ],
  },
  {
    title: 'Maldives Honeymoon Dream: 5 Nights Overwater',
    slug: slugify('Maldives Honeymoon Dream 5 Nights Overwater') + '-2',
    description:
      'The ultimate romantic escape. Your own overwater bungalow, private snorkeling reef, candlelit dinners on the beach, and dolphin cruises at dusk.',
    shortDescription: '5 nights in overwater villas with all romantic inclusions',
    destination: { city: 'Maldives', country: 'Maldives', region: 'Indian Ocean' },
    duration: { days: 6, nights: 5 },
    packageType: 'Honeymoon',
    pricing: { perPerson: 2899, originalPrice: 3499, currency: 'USD' },
    groupSize: { min: 2, max: 2 },
    difficulty: 'Easy',
    includes: {
      flights: true,
      accommodation: true,
      meals: 'All Inclusive',
      transfers: true,
      guide: false,
      insurance: true,
      activities: ['Snorkeling', 'Dolphin Cruise', 'Couples Spa'],
    },
    highlights: [
      'Overwater Bungalow',
      'Private Snorkeling',
      'Sunset Dolphin Cruise',
      'Underwater Dining',
      'Couples Spa',
    ],
    coverImage: { url: PACKAGE_IMAGES[1] },
    images: [{ url: PACKAGE_IMAGES[1] }, { url: PACKAGE_IMAGES[3] }],
    tags: ['Maldives', 'Honeymoon', 'Overwater', 'All Inclusive', 'Romance'],
    isFeatured: true,
    isBestSeller: true,
    isActive: true,
    ratings: { overall: 4.9, reviewCount: 189 },
    bookingCount: 892,
    itinerary: [],
  },
  {
    title: 'Japan Cherry Blossom Tour: 10 Days',
    slug: slugify('Japan Cherry Blossom Tour 10 Days') + '-3',
    description:
      "Chase the sakura across Japan's most iconic cities. From the neon canyons of Tokyo to the zen temples of Kyoto, experience Japan at its most breathtaking moment.",
    shortDescription: 'Tokyo, Kyoto & Osaka during cherry blossom season',
    destination: { city: 'Tokyo', country: 'Japan', region: 'East Asia' },
    duration: { days: 10, nights: 9 },
    packageType: 'Cultural',
    pricing: { perPerson: 2199, originalPrice: 2799, currency: 'USD' },
    groupSize: { min: 1, max: 15 },
    difficulty: 'Easy',
    includes: {
      flights: true,
      accommodation: true,
      meals: 'Breakfast',
      transfers: true,
      guide: true,
      insurance: false,
      activities: ['Bullet Train Pass', 'Temple Tours', 'Tea Ceremony'],
    },
    highlights: [
      'Ueno Park Cherry Blossoms',
      'Mount Fuji Day Trip',
      'Arashiyama Bamboo Grove',
      'Fushimi Inari Shrine',
      'Osaka Street Food Tour',
    ],
    coverImage: { url: PACKAGE_IMAGES[2] },
    images: [{ url: PACKAGE_IMAGES[2] }, { url: PACKAGE_IMAGES[4] }],
    tags: ['Japan', 'Cherry Blossom', 'Tokyo', 'Kyoto', 'Cultural'],
    isFeatured: true,
    isBestSeller: false,
    isActive: true,
    ratings: { overall: 4.8, reviewCount: 312 },
    bookingCount: 1567,
    itinerary: [],
  },
  {
    title: 'Greek Islands Odyssey: 8 Days',
    slug: slugify('Greek Islands Odyssey 8 Days') + '-4',
    description:
      'Sail the legendary Aegean between Santorini, Mykonos, and Athens. Whitewashed villages, ancient ruins, crystalline seas, and sun-soaked tavernas await.',
    shortDescription: 'Santorini, Mykonos & Athens — 8 days of Greek perfection',
    destination: { city: 'Santorini', country: 'Greece', region: 'Mediterranean' },
    duration: { days: 8, nights: 7 },
    packageType: 'Beach',
    pricing: { perPerson: 1799, originalPrice: 2299, currency: 'USD' },
    groupSize: { min: 2, max: 16 },
    difficulty: 'Easy',
    includes: {
      flights: true,
      accommodation: true,
      meals: 'Breakfast',
      transfers: true,
      guide: false,
      insurance: false,
      activities: ['Island Ferry', 'Wine Tasting', 'Acropolis Tour'],
    },
    highlights: [
      'Santorini Sunset',
      'Mykonos Party Beach',
      'Acropolis & Parthenon',
      'Island Ferry Hopping',
      'Wine Tasting Tour',
    ],
    coverImage: { url: PACKAGE_IMAGES[3] },
    images: [{ url: PACKAGE_IMAGES[3] }, { url: PACKAGE_IMAGES[5] }],
    tags: ['Greece', 'Islands', 'Beach', 'Mediterranean', 'Romance'],
    isFeatured: true,
    isBestSeller: false,
    isActive: true,
    ratings: { overall: 4.7, reviewCount: 245 },
    bookingCount: 1089,
    itinerary: [],
  },
  {
    title: 'Morocco Magic: Desert & Medina 6 Days',
    slug: slugify('Morocco Magic Desert and Medina 6 Days') + '-5',
    description:
      'From the labyrinthine medinas of Marrakech and Fes to a night under the Sahara stars, Morocco is a journey for all the senses.',
    shortDescription: 'Marrakech, Sahara Desert & Fes — 6 days of exotic wonder',
    destination: { city: 'Marrakech', country: 'Morocco', region: 'North Africa' },
    duration: { days: 6, nights: 5 },
    packageType: 'Adventure',
    pricing: { perPerson: 999, originalPrice: 1299, currency: 'USD' },
    groupSize: { min: 2, max: 12 },
    difficulty: 'Moderate',
    includes: {
      flights: false,
      accommodation: true,
      meals: 'Half Board',
      transfers: true,
      guide: true,
      insurance: false,
      activities: ['Camel Trek', 'Desert Camp', 'Hammam'],
    },
    highlights: [
      'Sahara Camel Trek',
      'Starry Desert Night',
      'Jemaa el-Fnaa Square',
      'Atlas Mountain Drive',
      'Moroccan Hammam',
    ],
    coverImage: { url: PACKAGE_IMAGES[4] },
    images: [{ url: PACKAGE_IMAGES[4] }, { url: PACKAGE_IMAGES[0] }],
    tags: ['Morocco', 'Desert', 'Sahara', 'Cultural', 'Adventure'],
    isFeatured: false,
    isBestSeller: false,
    isActive: true,
    ratings: { overall: 4.6, reviewCount: 178 },
    bookingCount: 723,
    itinerary: [],
  },
  {
    title: 'Safari & Victoria Falls: 9 Days Southern Africa',
    slug: slugify('Safari and Victoria Falls 9 Days Southern Africa') + '-6',
    description:
      'Witness the Big Five on Kruger safaris, marvel at mighty Victoria Falls, and cruise the Chobe River at golden hour in this unforgettable Southern Africa adventure.',
    shortDescription: 'Big Five safari, Victoria Falls & Chobe River — 9 epic days',
    destination: { city: 'Cape Town', country: 'South Africa', region: 'Africa' },
    duration: { days: 9, nights: 8 },
    packageType: 'Wildlife',
    pricing: { perPerson: 3299, originalPrice: 3999, currency: 'USD' },
    groupSize: { min: 2, max: 10 },
    difficulty: 'Moderate',
    includes: {
      flights: true,
      accommodation: true,
      meals: 'Full Board',
      transfers: true,
      guide: true,
      insurance: true,
      activities: ['Game Drives', 'Helicopter Tour', 'River Cruise'],
    },
    highlights: [
      'Big Five Game Drives',
      'Victoria Falls Helicopter',
      'Chobe River Sunset Cruise',
      'Cape Town City Tour',
      'Cape of Good Hope',
    ],
    coverImage: { url: PACKAGE_IMAGES[5] },
    images: [{ url: PACKAGE_IMAGES[5] }, { url: PACKAGE_IMAGES[2] }],
    tags: ['Safari', 'Africa', 'Wildlife', 'Victoria Falls', 'Adventure'],
    isFeatured: true,
    isBestSeller: false,
    isActive: true,
    ratings: { overall: 4.9, reviewCount: 143 },
    bookingCount: 456,
    itinerary: [],
  },
];

const flights = [
  {
    flightNumber: 'TP101',
    airline: { name: 'TravelAir', code: 'TP', logo: '' },
    origin: {
      city: 'New York',
      airport: 'John F. Kennedy International',
      airportCode: 'JFK',
      country: 'USA',
      terminal: '4',
    },
    destination: {
      city: 'London',
      airport: 'Heathrow Airport',
      airportCode: 'LHR',
      country: 'UK',
      terminal: '5',
    },
    departureTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    arrivalTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000),
    basePrice: 480,
    stops: 0,
    flightClass: 'Economy',
    seats: {
      total: 210,
      available: 53,
      economy: { total: 180, available: 45, price: 480 },
      business: { total: 30, available: 8, price: 1850 },
    },
    baggage: { carryOn: '10 kg', checkedBaggage: '23 kg' },
    meals: 'Included',
    wifi: true,
    entertainment: true,
    status: 'scheduled',
    isActive: true,
  },
  {
    flightNumber: 'TP205',
    airline: { name: 'SkyWings', code: 'SW', logo: '' },
    origin: {
      city: 'Dubai',
      airport: 'Dubai International Airport',
      airportCode: 'DXB',
      country: 'UAE',
      terminal: '3',
    },
    destination: {
      city: 'Tokyo',
      airport: 'Narita International Airport',
      airportCode: 'NRT',
      country: 'Japan',
      terminal: '2',
    },
    departureTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    arrivalTime: new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000 + 30 * 60 * 1000
    ),
    basePrice: 620,
    stops: 0,
    flightClass: 'Economy',
    seats: {
      total: 242,
      available: 93,
      economy: { total: 200, available: 78, price: 620 },
      business: { total: 42, available: 15, price: 2400 },
    },
    baggage: { carryOn: '7 kg', checkedBaggage: '30 kg' },
    meals: 'Included',
    wifi: true,
    entertainment: true,
    status: 'scheduled',
    isActive: true,
  },
  {
    flightNumber: 'TP312',
    airline: { name: 'EuroJet', code: 'EJ', logo: '' },
    origin: {
      city: 'London',
      airport: 'Gatwick Airport',
      airportCode: 'LGW',
      country: 'UK',
      terminal: 'N',
    },
    destination: {
      city: 'Santorini',
      airport: 'Santorini Airport',
      airportCode: 'JTR',
      country: 'Greece',
      terminal: '1',
    },
    departureTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    arrivalTime: new Date(
      Date.now() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000 + 45 * 60 * 1000
    ),
    basePrice: 220,
    stops: 0,
    flightClass: 'Economy',
    seats: {
      total: 166,
      available: 67,
      economy: { total: 150, available: 62, price: 220 },
      business: { total: 16, available: 5, price: 780 },
    },
    baggage: { carryOn: '10 kg', checkedBaggage: '20 kg' },
    meals: 'Paid',
    wifi: false,
    entertainment: false,
    status: 'scheduled',
    isActive: true,
  },
  {
    flightNumber: 'TP450',
    airline: { name: 'AsiaWings', code: 'AW', logo: '' },
    origin: {
      city: 'Singapore',
      airport: 'Changi Airport',
      airportCode: 'SIN',
      country: 'Singapore',
      terminal: '3',
    },
    destination: {
      city: 'Bali',
      airport: 'Ngurah Rai International Airport',
      airportCode: 'DPS',
      country: 'Indonesia',
      terminal: 'I',
    },
    departureTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    arrivalTime: new Date(
      Date.now() + 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000 + 20 * 60 * 1000
    ),
    basePrice: 190,
    stops: 0,
    flightClass: 'Economy',
    seats: {
      total: 180,
      available: 97,
      economy: { total: 160, available: 88, price: 190 },
      business: { total: 20, available: 9, price: 650 },
    },
    baggage: { carryOn: '7 kg', checkedBaggage: '20 kg' },
    meals: 'Included',
    wifi: true,
    entertainment: false,
    status: 'scheduled',
    isActive: true,
  },
  {
    flightNumber: 'TP567',
    airline: { name: 'TravelAir', code: 'TP', logo: '' },
    origin: {
      city: 'Los Angeles',
      airport: 'Los Angeles International Airport',
      airportCode: 'LAX',
      country: 'USA',
      terminal: 'B',
    },
    destination: {
      city: 'Tokyo',
      airport: 'Narita International Airport',
      airportCode: 'NRT',
      country: 'Japan',
      terminal: '1',
    },
    departureTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    arrivalTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000),
    basePrice: 780,
    stops: 0,
    flightClass: 'Economy',
    seats: {
      total: 273,
      available: 50,
      economy: { total: 220, available: 35, price: 780 },
      business: { total: 45, available: 12, price: 3200 },
      firstClass: { total: 8, available: 3, price: 6500 },
    },
    baggage: { carryOn: '10 kg', checkedBaggage: '23 kg' },
    meals: 'Included',
    wifi: true,
    entertainment: true,
    status: 'scheduled',
    isActive: true,
  },
];

// ── Main Seed Function ─────────────────────────────────────────
const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Drop all collections cleanly to avoid index conflicts
    await Promise.all([
      User.deleteMany({}),
      Hotel.deleteMany({}),
      Flight.deleteMany({}),
      TravelPackage.deleteMany({}),
      Review.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // ── Create Admin User ──────────────────────────────────
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@travelplatform.com',
      password: 'Admin@123456',
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
    });
    console.log('👑 Admin created:', admin.email);

    // ── Create Sample Users ────────────────────────────────
    const users = await User.insertMany([
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: await bcrypt.hash('Password@123', 12),
        role: 'user',
        isEmailVerified: true,
        isActive: true,
        preferences: {
          budget: 'luxury',
          travelStyle: ['romantic', 'relaxation'],
        },
      },
      {
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: await bcrypt.hash('Password@123', 12),
        role: 'user',
        isEmailVerified: true,
        isActive: true,
        preferences: {
          budget: 'mid-range',
          travelStyle: ['adventure', 'cultural'],
        },
      },
      {
        name: 'Carol White',
        email: 'carol@example.com',
        password: await bcrypt.hash('Password@123', 12),
        role: 'user',
        isEmailVerified: true,
        isActive: true,
        preferences: {
          budget: 'budget',
          travelStyle: ['solo', 'adventure'],
        },
      },
    ]);
    console.log(`👥 ${users.length} sample users created`);

    // ── Create Hotels ──────────────────────────────────────
    // ✅ Fixed: bypass pre-save slug hook by inserting directly
    // slug is already set manually above so no duplicate index issue
    const createdHotels = await Hotel.insertMany(
      hotels.map((h) => ({ ...h, owner: admin._id }))
    );
    console.log(`🏨 ${createdHotels.length} hotels created`);

    // ── Create Flights ─────────────────────────────────────
    const createdFlights = await Flight.insertMany(flights);
    console.log(`✈️  ${createdFlights.length} flights created`);

    // ── Create Travel Packages ─────────────────────────────
    const createdPackages = await TravelPackage.insertMany(
      packages.map((p) => ({ ...p, createdBy: admin._id }))
    );
    console.log(`📦 ${createdPackages.length} packages created`);

    // ── Create Sample Reviews ──────────────────────────────
    const reviewTitles = [
      'Absolutely stunning stay!',
      'Exceeded all expectations',
      'Perfect getaway — will return',
      'World-class service and views',
      'A dream come true',
      'Highly recommend to everyone',
    ];

    const reviewBodies = [
      'The staff were incredibly attentive and the facilities were world-class. The location was perfect and the views were absolutely breathtaking. I will definitely be returning!',
      'From the moment we arrived, everything was flawless. The room was immaculate, the food was outstanding, and the team went above and beyond to make us feel special.',
      'A truly memorable experience. The property is stunning, the amenities are top-notch, and the surrounding area offers so much to explore. Could not have asked for more.',
    ];

    const tripTypes = ['Leisure', 'Romantic', 'Family', 'Business', 'Solo'];

    const reviewData = [];

    createdHotels.slice(0, 5).forEach((hotel, hi) => {
      users.slice(0, 2).forEach((user, ui) => {
        reviewData.push({
          user: user._id,
          hotel: hotel._id,
          title: reviewTitles[(hi * 2 + ui) % reviewTitles.length],
          review: reviewBodies[ui % reviewBodies.length],
          ratings: {
            overall:       parseFloat((4 + Math.random()).toFixed(1)),
            cleanliness:   parseFloat((4 + Math.random()).toFixed(1)),
            location:      parseFloat((4 + Math.random()).toFixed(1)),
            service:       parseFloat((4 + Math.random()).toFixed(1)),
            valueForMoney: parseFloat((3.5 + Math.random()).toFixed(1)),
            facilities:    parseFloat((4 + Math.random()).toFixed(1)),
          },
          tripType: tripTypes[(hi + ui) % tripTypes.length],
          isVerified: true,
          isActive: true,
        });
      });
    });

    await Review.insertMany(reviewData);
    console.log(`⭐ ${reviewData.length} reviews created`);

    // ── Done ───────────────────────────────────────────────
    console.log('\n🚀 Database seeded successfully!');
    console.log('─────────────────────────────────────────');
    console.log('  Admin Login:');
    console.log('    Email    : admin@travelplatform.com');
    console.log('    Password : Admin@123456');
    console.log('');
    console.log('  Sample User Login:');
    console.log('    Email    : alice@example.com');
    console.log('    Password : Password@123');
    console.log('─────────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    if (error.code === 11000) {
      console.error('   Duplicate key error — try dropping the DB and re-seeding.');
      console.error('   Duplicate field:', JSON.stringify(error.keyValue));
    }
    console.error(error.stack);
    process.exit(1);
  }
};

seedDB();