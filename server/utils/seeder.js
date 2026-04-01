// server/utils/seeder.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User          = require('../models/User');
const Hotel         = require('../models/Hotel');
const Flight        = require('../models/Flight');
const TravelPackage = require('../models/TravelPackage');
const Review        = require('../models/Review');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/travel-platform';

const slugify = (str, suffix) =>
  str.toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() + '-' + suffix;

const H = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
  'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
];

const P = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
  'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800',
  'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800',
];

const seedDB = async () => {
  try {
    console.log('\n🌱 TravelPlatform Seeder Starting...');
    console.log('=====================================');

    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('✅ Connected to MongoDB');

    // Drop indexes
    const cols = ['users','hotels','flights','travelpackages','reviews','bookings'];
    for (const col of cols) {
      try {
        await mongoose.connection.db.collection(col).dropIndexes();
      } catch (e) { /* collection doesn't exist yet */ }
    }
    console.log('✅ Indexes reset');

    // Clear data
    await Promise.all([
      User.deleteMany({}),
      Hotel.deleteMany({}),
      Flight.deleteMany({}),
      TravelPackage.deleteMany({}),
      Review.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // ── Hash passwords ─────────────────────────────────────
    // ✅ Hash BEFORE insertMany — bypass pre-save hook completely
    console.log('🔐 Hashing passwords...');
    const salt        = await bcrypt.genSalt(12);
    const adminHash   = await bcrypt.hash('Admin@123456', salt);
    const userHash    = await bcrypt.hash('Password@123', salt);

    // Verify hashes work immediately
    const adminVerify = await bcrypt.compare('Admin@123456', adminHash);
    const userVerify  = await bcrypt.compare('Password@123', userHash);

    console.log('✅ Admin hash verify:', adminVerify);
    console.log('✅ User hash verify:', userVerify);

    if (!adminVerify || !userVerify) {
      throw new Error('Password hashing verification failed!');
    }

    // ── Insert Users ───────────────────────────────────────
    const userDocs = await User.insertMany(
      [
        {
          name:            'Admin User',
          email:           'admin@travelplatform.com',
          password:        adminHash,
          role:            'admin',
          isEmailVerified: true,
          isActive:        true,
          authProvider:    'local',
          avatar:          { url: 'https://ui-avatars.com/api/?name=Admin+User&background=0ea5e9&color=fff' },
        },
        {
          name:            'Priya Sharma',
          email:           'priya@example.com',
          password:        userHash,
          role:            'user',
          isEmailVerified: true,
          isActive:        true,
          authProvider:    'local',
          avatar:          { url: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=6366f1&color=fff' },
          preferences:     { budget: 'luxury', travelStyle: ['romantic', 'relaxation'] },
        },
        {
          name:            'Arjun Mehta',
          email:           'arjun@example.com',
          password:        userHash,
          role:            'user',
          isEmailVerified: true,
          isActive:        true,
          authProvider:    'local',
          avatar:          { url: 'https://ui-avatars.com/api/?name=Arjun+Mehta&background=ec4899&color=fff' },
          preferences:     { budget: 'mid-range', travelStyle: ['adventure', 'cultural'] },
        },
        {
          name:            'Rohan Desai',
          email:           'rohan@example.com',
          password:        userHash,
          role:            'user',
          isEmailVerified: true,
          isActive:        true,
          authProvider:    'local',
          avatar:          { url: 'https://ui-avatars.com/api/?name=Rohan+Desai&background=f59e0b&color=fff' },
          preferences:     { budget: 'budget', travelStyle: ['solo', 'adventure'] },
        },
      ],
      { validateBeforeSave: false } // ✅ bypass pre-save hook
    );

    const admin = userDocs[0];
    const users = userDocs.slice(1);
    console.log(`👥 ${userDocs.length} users created`);

    // Verify stored passwords are correct
    const adminCheck = await User.findOne({ email: 'admin@travelplatform.com' }).select('+password');
    const adminOk    = await bcrypt.compare('Admin@123456', adminCheck.password);
    console.log('🔑 Admin password verification after insert:', adminOk ? '✅ PASS' : '❌ FAIL');

    const userCheck = await User.findOne({ email: 'priya@example.com' }).select('+password');
    const userOk    = await bcrypt.compare('Password@123', userCheck.password);
    console.log('🔑 User password verification after insert:', userOk ? '✅ PASS' : '❌ FAIL');

    if (!adminOk || !userOk) {
      throw new Error('Password verification after insert FAILED — pre-save hook may have re-hashed!');
    }

    // ── Insert Hotels ──────────────────────────────────────
    const hotelDocs = await Hotel.insertMany([
      {
        name:             'Taj Lake Palace Udaipur',
        slug:             slugify('Taj Lake Palace Udaipur', '001'),
        description:      'Rising like a marble dream from the shimmering waters of Lake Pichola, the Taj Lake Palace is one of the most iconic and romantic hotels in the world. Originally built as the winter palace of Maharana Jagat Singh II in 1746, this 18th-century palace seamlessly blends regal Rajput and Mughal architecture with unmatched modern luxury.',
        shortDescription: 'Iconic 18th-century marble palace floating on Lake Pichola in Udaipur',
        propertyType:     'Heritage Hotel',
        starRating:       5,
        location: {
          address:     'Lake Pichola',
          city:        'Udaipur',
          country:     'India',
          coordinates: { type: 'Point', coordinates: [73.6835, 24.5764] },
          nearbyAttractions: [
            'City Palace Udaipur',
            'Jagdish Temple',
          ],
        },
        coverImage: { url: H[0] },
        images: [
          { url: H[0], isPrimary: true },
          { url: H[1] },
          { url: H[2] },
        ],
        amenities: {
          general:    ['Free WiFi', 'Lake View', 'Outdoor Pool', 'Air Conditioning'],
          dining:     ['Neel Kamal Restaurant', 'Jharokha Breakfast Terrace', 'Room Service'],
          services:   ['24hr Concierge', 'Ayurvedic Spa', 'Butler Service', 'Boat Transfer'],
          recreation: ['Yoga Center', 'Cultural Performances', 'Cooking Classes', 'Sundowner Cruise'],
        },
        rooms: [
          { roomType: 'Deluxe',       pricePerNight: 35000,  maxGuests: 2, bedType: 'King', size: 55,  totalRooms: 20, amenities: ['Lake View', 'Balcony', 'Mini Bar'] },
          { roomType: 'Suite',        pricePerNight: 62000,  maxGuests: 3, bedType: 'King', size: 90,  totalRooms: 10, amenities: ['Private Courtyard', 'Lake View', 'Jacuzzi'] },
          { roomType: 'Presidential', pricePerNight: 120000, maxGuests: 4, bedType: 'King', size: 200, totalRooms: 2,  amenities: ['Private Terrace', 'Butler', 'Heritage Artefacts'] },
        ],
        priceRange:    { min: 35000,  max: 120000 },
        ratings:       { overall: 4.9, cleanliness: 5.0, location: 4.8, service: 4.9, valueForMoney: 4.7, facilities: 4.9 },
        reviewCount:   847,
        policies:      { checkIn: '3:00 PM', checkOut: '11:00 AM', cancellation: 'Flexible' },
        isFeatured:    true,
        isVerified:    true,
        isActive:      true,
        tags:          ['Heritage', 'Luxury', 'Rajasthan', 'Romantic', 'Lake View'],
        totalBookings: 1240,
        totalRevenue:  72000000,
        owner:         admin._id,
      },
      {
        name:             'ITC Grand Chola Chennai',
        slug:             slugify('ITC Grand Chola Chennai', '002'),
        description:      'A tribute to the grandeur of the great Chola dynasty, ITC Grand Chola in Chennai stands as a magnificent monument to South Indian heritage. Inspired by the legendary Chola temples of Tamil Nadu, this luxury hotel redefines hospitality with its palatial architecture, world-class dining, and impeccable service.',
        shortDescription: 'Grand Chola-inspired palace hotel in the heart of Chennai',
        propertyType:     'Hotel',
        starRating:       5,
        location: {
          address:     '63, Mount Road, Guindy',
          city:        'Chennai',
          country:     'India',
          coordinates: { type: 'Point', coordinates: [80.2205, 13.0067] },
          nearbyAttractions: [
            'Kapaleeshwarar Temple',
            'Marina Beach',
          ],
        },
        coverImage: { url: H[1] },
        images:     [{ url: H[1], isPrimary: true }, { url: H[3] }, { url: H[5] }],
        amenities: {
          general:    ['Free WiFi', 'Outdoor Pool', 'Air Conditioning', 'Business Center'],
          dining:     ['Ottimo Italian Kitchen', 'Royal Vega Vegetarian', 'Peshawri NWFP Cuisine', 'Pan Asian Restaurant'],
          services:   ['Concierge', 'Kaya Kalp Spa', 'Valet Parking', 'Airport Transfer'],
          recreation: ['Rooftop Pool', 'Yoga Center', 'Fitness Center', 'Squash Court'],
        },
        rooms: [
          { roomType: 'Deluxe', pricePerNight: 22000, maxGuests: 2, bedType: 'Queen', size: 45, totalRooms: 30, amenities: ['City View', 'Marble Bathroom'] },
          { roomType: 'Suite',  pricePerNight: 55000, maxGuests: 2, bedType: 'King',  size: 95, totalRooms: 12, amenities: ['Private Lounge', 'Panoramic City View', 'Jacuzzi'] },
        ],
        priceRange:    { min: 22000,  max: 55000 },
        ratings:       { overall: 4.8, cleanliness: 4.9, location: 5.0, service: 4.7, valueForMoney: 4.6, facilities: 4.8 },
        reviewCount:   612,
        policies:      { checkIn: '3:00 PM', checkOut: '11:00 AM', cancellation: 'Flexible' },
        isFeatured:    true,
        isVerified:    true,
        isActive:      true,
        tags:          ['Chennai', 'Heritage', 'Business', 'Luxury', 'South India'],
        totalBookings: 980,
        totalRevenue:  44000000,
        owner:         admin._id,
      },
      {
        name:             'W Goa Vagator Beach Resort',
        slug:             slugify('W Goa Vagator Beach Resort', '003'),
        description:      'Dramatically perched on a cliff overlooking the cerulean Arabian Sea at Vagator Beach, W Goa is a bold, design-forward resort that fuses vibrant Goan culture with contemporary flair. With its striking architecture, vibrant social spaces, and stunning sea views, W Goa brings an electric energy to the shores of North Goa.',
        shortDescription: 'Clifftop design resort overlooking Vagator Beach in North Goa',
        propertyType:     'Resort',
        starRating:       5,
        location: {
          address:     'Vagator Beach Road, Bardez',
          city:        'Goa',
          country:     'India',
          coordinates: { type: 'Point', coordinates: [73.7441, 15.5993] },
          nearbyAttractions: [
            'Chapora Fort',
            'Anjuna Flea Market',
          ],
        },
        coverImage: { url: H[2] },
        images:     [{ url: H[2], isPrimary: true }, { url: H[4] }, { url: H[6] }],
        amenities: {
          general:    ['Free WiFi', 'Infinity Pool', 'Private Beach Access', 'Air Conditioning'],
          dining:     ['Spice Traders Restaurant', 'WET Pool Bar', 'Sunset Bar', 'Room Service'],
          services:   ['Concierge', 'AWAY Spa', 'Watersports Desk', 'Yoga Center'],
          recreation: ['Infinity Pool', 'Water Sports', 'Beach Volleyball', 'DJ Nights'],
        },
        rooms: [
          { roomType: 'Wonderful',      pricePerNight: 18000, maxGuests: 2, bedType: 'Double', size: 38, totalRooms: 50, amenities: ['Garden View', 'Rain Shower'] },
          { roomType: 'Spectacular',    pricePerNight: 26000, maxGuests: 2, bedType: 'King',   size: 52, totalRooms: 30, amenities: ['Sea View', 'Bathtub', 'Private Balcony'] },
          { roomType: 'Fabulous Suite', pricePerNight: 48000, maxGuests: 3, bedType: 'King',   size: 85, totalRooms: 12, amenities: ['Panoramic Sea View', 'Living Room', 'Plunge Pool'] },
        ],
        priceRange:    { min: 18000,  max: 48000 },
        ratings:       { overall: 4.7, cleanliness: 4.8, location: 4.9, service: 4.6, valueForMoney: 4.5, facilities: 4.7 },
        reviewCount:   1253,
        policies:      { checkIn: '3:00 PM', checkOut: '11:00 AM', cancellation: 'Moderate' },
        isFeatured:    true,
        isVerified:    true,
        isActive:      true,
        tags:          ['Goa', 'Beach', 'Luxury', 'Party', 'Clifftop'],
        totalBookings: 2100,
        totalRevenue:  55000000,
        owner:         admin._id,
      },
      {
        name:             'Kumarakom Lake Resort Kerala',
        slug:             slugify('Kumarakom Lake Resort Kerala', '004'),
        description:      'Nestled along the tranquil shores of Vembanad Lake amid swaying coconut palms and emerald paddy fields, Kumarakom Lake Resort is the finest expression of Kerala hospitality. Experience the magic of houseboat-style villas, traditional Kerala cuisine, and Ayurvedic healing in a setting of extraordinary natural beauty.',
        shortDescription: 'Serene heritage villas and houseboats on Vembanad Lake in Kerala',
        propertyType:     'Resort',
        starRating:       5,
        location: {
          address:     'Kumarakom North, Kottayam District',
          city:        'Kumarakom',
          country:     'India',
          coordinates: { type: 'Point', coordinates: [76.4356, 9.6084] },
          nearbyAttractions: [
            'Vembanad Lake Backwaters',
            'Kumarakom Bird Sanctuary',
          ],
        },
        coverImage: { url: H[3] },
        images:     [{ url: H[3], isPrimary: true }, { url: H[7] }, { url: H[0] }],
        amenities: {
          general:    ['Free WiFi', 'Private Pool', 'Air Conditioning', 'Lakeside Garden'],
          dining:     ['Ettukettu Restaurant', 'Coconut Lagoon Cafe', 'Cooking Demonstrations'],
          services:   ['Ayurvedic Spa', 'Yoga Center', 'Houseboat Cruise', 'Cultural Performances'],
          recreation: ['Infinity Pool', 'Canoe Rides', 'Village Tours', 'Meditation Garden'],
        },
        rooms: [
          { roomType: 'Heritage Villa',     pricePerNight: 12000, maxGuests: 2, bedType: 'Queen', size: 50,  totalRooms: 12, amenities: ['Garden View', 'Outdoor Shower', 'Teak Wood Decor'] },
          { roomType: 'Luxury Villa',       pricePerNight: 20000, maxGuests: 2, bedType: 'King',  size: 80,  totalRooms: 8,  amenities: ['Lake View', 'Private Pool', 'Butler Service'] },
          { roomType: 'Premium Houseboat',  pricePerNight: 32000, maxGuests: 3, bedType: 'King',  size: 110, totalRooms: 4,  amenities: ['360 Lake View', 'Private Deck', 'Personalised Chef'] },
        ],
        priceRange:    { min: 12000,  max: 32000 },
        ratings:       { overall: 4.6, cleanliness: 4.7, location: 4.5, service: 4.8, valueForMoney: 4.9, facilities: 4.5 },
        reviewCount:   439,
        policies:      { checkIn: '2:00 PM', checkOut: '12:00 PM', cancellation: 'Flexible' },
        isFeatured:    true,
        isVerified:    true,
        isActive:      true,
        tags:          ['Kerala', 'Backwaters', 'Ayurveda', 'Yoga', 'Heritage'],
        totalBookings: 780,
        totalRevenue:  18000000,
        owner:         admin._id,
      },
      {
        name:             'Rambagh Palace Jaipur',
        slug:             slugify('Rambagh Palace Jaipur', '005'),
        description:      'Once the jewel of Jaipur and the residence of the Maharaja of Jaipur, Rambagh Palace is a stunning example of Indo-Saracenic architecture set in 47 acres of manicured Mughal gardens. Today managed by Taj Hotels, it remains the most storied and regal heritage hotel in Rajasthan.',
        shortDescription: 'The Jewel of Jaipur — former royal palace set in sprawling Mughal gardens',
        propertyType:     'Heritage Hotel',
        starRating:       5,
        location: {
          address:     'Bhawani Singh Road',
          city:        'Jaipur',
          country:     'India',
          coordinates: { type: 'Point', coordinates: [75.8069, 26.8997] },
          nearbyAttractions: [
            'Amber Fort',
            'City Palace Jaipur',
          ],
        },
        coverImage: { url: H[6] },
        images:     [{ url: H[6], isPrimary: true }, { url: H[1] }],
        amenities: {
          general:    ['Free WiFi', 'Outdoor Pool', 'Mughal Gardens', 'Concierge'],
          dining:     ['Suvarna Mahal Fine Dining', 'Rajput Room', 'Steam Bar', 'High Tea Terrace'],
          services:   ['Jiva Grande Spa', 'Heritage Walk', 'Cultural Evenings', 'Limousine Service'],
          recreation: ['Pool', 'Yoga Center', 'Croquet Lawn', 'Polo Ground'],
        },
        rooms: [
          { roomType: 'Luxury Room',  pricePerNight: 28000, maxGuests: 2, bedType: 'Queen', size: 38,  totalRooms: 50, amenities: ['Garden View', 'Heritage Furnishings'] },
          { roomType: 'Grand Luxury', pricePerNight: 40000, maxGuests: 2, bedType: 'King',  size: 58,  totalRooms: 25, amenities: ['Palace Garden View', 'Marble Bathroom'] },
          { roomType: 'Royal Suite',  pricePerNight: 80000, maxGuests: 4, bedType: 'King',  size: 130, totalRooms: 10, amenities: ['Private Garden', 'Living Room', 'Butler Service'] },
        ],
        priceRange:    { min: 28000,   max: 80000 },
        ratings:       { overall: 4.7, cleanliness: 4.8, location: 5.0, service: 4.6, valueForMoney: 4.2, facilities: 4.7 },
        reviewCount:   2134,
        policies:      { checkIn: '4:00 PM', checkOut: '12:00 PM', cancellation: 'Strict' },
        isFeatured:    true,
        isVerified:    true,
        isActive:      true,
        tags:          ['Jaipur', 'Rajasthan', 'Heritage', 'Royal', 'Palace'],
        totalBookings: 3400,
        totalRevenue:  98000000,
        owner:         admin._id,
      },
      {
        name:             'The Oberoi Amarvilas Agra',
        slug:             slugify('The Oberoi Amarvilas Agra', '006'),
        description:      'Every single room and suite at The Oberoi Amarvilas offers an uninterrupted view of the Taj Mahal, placing one of the world\'s most magnificent monuments right outside your window. Set amid Mughal-inspired cascading terraces, fountains, and reflection pools, Amarvilas is consistently ranked among the finest hotels in the world.',
        shortDescription: 'Every room with an uninterrupted Taj Mahal view — pure magnificence',
        propertyType:     'Hotel',
        starRating:       5,
        location: {
          address:     'Taj East Gate Road',
          city:        'Agra',
          country:     'India',
          coordinates: { type: 'Point', coordinates: [78.0421, 27.1751] },
          nearbyAttractions: [
            'Taj Mahal',
            'Agra Fort',
          ],
        },
        coverImage: { url: H[5] },
        images:     [{ url: H[5], isPrimary: true }, { url: H[7] }],
        amenities: {
          general:    ['Free WiFi', 'Rooftop Terrace', 'Outdoor Pool', 'Air Conditioning'],
          dining:     ['Bellevue Restaurant', 'Esphahan Mughal Cuisine', 'Champagne Bar'],
          services:   ['Oberoi Spa', 'Yoga Center', 'Guided Taj Tours', 'Airport Transfer'],
          recreation: ['Infinity Pool', 'Mughal Gardens', 'Cultural Tours', 'Sunset Terrace'],
        },
        rooms: [
          { roomType: 'Premier Room', pricePerNight: 38000, maxGuests: 2, bedType: 'Double', size: 42, totalRooms: 30, amenities: ['Taj Mahal View', 'Marble Bathroom'] },
          { roomType: 'Luxury Suite', pricePerNight: 75000, maxGuests: 2, bedType: 'King',   size: 80, totalRooms: 12, amenities: ['Panoramic Taj View', 'Private Terrace', 'Jacuzzi'] },
        ],
        priceRange:    { min: 38000,  max: 75000 },
        ratings:       { overall: 4.8, cleanliness: 4.7, location: 4.9, service: 4.9, valueForMoney: 4.8, facilities: 4.6 },
        reviewCount:   215,
        policies:      { checkIn: '3:00 PM', checkOut: '12:00 PM', cancellation: 'Flexible' },
        isFeatured:    true,
        isVerified:    true,
        isActive:      true,
        tags:          ['Agra', 'Taj Mahal', 'Heritage', 'Romantic', 'Luxury'],
        totalBookings: 340,
        totalRevenue:  22000000,
        owner:         admin._id,
      },
      {
        name:             'Wildflower Hall Shimla Himalaya',
        slug:             slugify('Wildflower Hall Shimla Himalaya', '007'),
        description:      'Dramatically set at 8,250 feet on the crest of a pine and rhododendron forest in the Himalayas above Shimla, Wildflower Hall was once the residence of Lord Kitchener, Commander-in-Chief of India. Rebuilt as a luxury retreat by Oberoi Hotels, it remains the most stunning mountain hotel in India.',
        shortDescription: 'Former colonial estate at 8,250 ft in the pine forests above Shimla',
        propertyType:     'Resort',
        starRating:       5,
        location: {
          address:     'Chharabra, Shimla Hills',
          city:        'Shimla',
          country:     'India',
          coordinates: { type: 'Point', coordinates: [77.1734, 31.1048] },
          nearbyAttractions: [
            'Jakhu Temple',
            'The Ridge Shimla',
          ],
        },
        coverImage: { url: H[7] },
        images:     [{ url: H[7], isPrimary: true }, { url: H[3] }],
        amenities: {
          general:    ['Free WiFi', 'Heated Pool', 'Mountain View', 'Fireplace'],
          dining:     ['The Himalayan Restaurant', 'Cedar Bar', 'Breakfast Buffet'],
          services:   ['Oberoi Spa', 'Yoga Center', 'Trekking Guided Tours', 'Airport Transfer'],
          recreation: ['Mountain Treks', 'Mountain Biking', 'Fly Fishing', 'Billiards Room'],
        },
        rooms: [
          { roomType: 'Standard',    pricePerNight: 14000, maxGuests: 2, bedType: 'Double', size: 38, totalRooms: 30, amenities: ['Forest View', 'Fireplace'] },
          { roomType: 'Deluxe',      pricePerNight: 22000, maxGuests: 2, bedType: 'King',   size: 55, totalRooms: 20, amenities: ['Himalayan View', 'Balcony', 'Bathtub'] },
          { roomType: 'Grand Suite', pricePerNight: 42000, maxGuests: 3, bedType: 'King',   size: 90, totalRooms: 8,  amenities: ['Panoramic Mountain View', 'Plunge Pool', 'Study'] },
        ],
        priceRange:    { min: 14000,  max: 42000 },
        ratings:       { overall: 4.6, cleanliness: 4.7, location: 4.8, service: 4.5, valueForMoney: 4.6, facilities: 4.5 },
        reviewCount:   567,
        policies:      { checkIn: '3:00 PM', checkOut: '11:00 AM', cancellation: 'Flexible' },
        isFeatured:    false,
        isVerified:    true,
        isActive:      true,
        tags:          ['Shimla', 'Himalayas', 'Mountain', 'Heritage', 'Colonial'],
        totalBookings: 890,
        totalRevenue:  21000000,
        owner:         admin._id,
      },
      {
        name:             'Taj Fort Aguada Resort Goa',
        slug:             slugify('Taj Fort Aguada Resort Goa', '008'),
        description:      'Overlooking the shimmering Arabian Sea and the imposing 17th-century Portuguese Fort Aguada, Taj Fort Aguada Resort is an iconic landmark on the Goan coastline. With its whitewashed colonial architecture cascading down verdant hillside terraces to a private beach, this resort perfectly captures the timeless spirit of Goa.',
        shortDescription: 'Iconic Portuguese fort-facing resort with a private beach in North Goa',
        propertyType:     'Resort',
        starRating:       5,
        location: {
          address:     'Sinquerim, Bardez',
          city:        'Goa',
          country:     'India',
          coordinates: { type: 'Point', coordinates: [73.7605, 15.4989] },
          nearbyAttractions: [
            'Fort Aguada',
            'Calangute Beach',
          ],
        },
        coverImage: { url: H[4] },
        images:     [{ url: H[4], isPrimary: true }, { url: H[2] }],
        amenities: {
          general:    ['Free WiFi', 'Private Beach', 'Outdoor Pool', 'Air Conditioning'],
          dining:     ['Morisco Seafood Restaurant', 'Splash Bar', 'Breakfast Buffet'],
          services:   ['Concierge', 'Jiva Spa', 'Watersports Desk', 'Ayurvedic Centre'],
          recreation: ['Pool', 'Water Sports', 'Beach Volleyball', 'Yoga Center'],
        },
        rooms: [
          { roomType: 'Deluxe',     pricePerNight: 15000, maxGuests: 2, bedType: 'Double', size: 32, totalRooms: 40, amenities: ['Garden View', 'Private Sit-Out'] },
          { roomType: 'Sea Facing', pricePerNight: 24000, maxGuests: 2, bedType: 'King',   size: 48, totalRooms: 25, amenities: ['Sea View', 'Balcony', 'Bathtub'] },
        ],
        priceRange:    { min: 15000,  max: 24000 },
        ratings:       { overall: 4.5, cleanliness: 4.6, location: 4.8, service: 4.4, valueForMoney: 4.3, facilities: 4.4 },
        reviewCount:   328,
        policies:      { checkIn: '3:00 PM', checkOut: '11:00 AM', cancellation: 'Moderate' },
        isFeatured:    false,
        isVerified:    true,
        isActive:      true,
        tags:          ['Goa', 'Beach', 'Portuguese', 'Heritage', 'Arabian Sea'],
        totalBookings: 560,
        totalRevenue:  12000000,
        owner:         admin._id,
      },
    ]);
    console.log(`🏨 ${hotelDocs.length} hotels created`);

    // ── Insert Flights ─────────────────────────────────────
    const flightDocs = await Flight.insertMany([
      {
        flightNumber:  '6E 204',
        airline:       { name: 'IndiGo', code: '6E', logo: '' },
        origin:        { city: 'Mumbai',    airport: 'Chhatrapati Shivaji Maharaj International Airport', airportCode: 'BOM', country: 'India', terminal: '2' },
        destination:   { city: 'Delhi',     airport: 'Indira Gandhi International Airport',               airportCode: 'DEL', country: 'India', terminal: '2' },
        departureTime: new Date(Date.now() + 2  * 24 * 60 * 60 * 1000),
        arrivalTime:   new Date(Date.now() + 2  * 24 * 60 * 60 * 1000 + 2  * 60 * 60 * 1000 + 10 * 60 * 1000),
        basePrice: 3500, stops: 0, flightClass: 'Economy',
        seats: { total: 186, available: 53, economy: { total: 180, available: 49, price: 3500  }, business: { total: 6,  available: 4,  price: 12000 } },
        baggage: { carryOn: '7 kg', checkedBaggage: '15 kg' },
        meals: 'Paid', wifi: false, entertainment: false, status: 'scheduled', isActive: true,
      },
      {
        flightNumber:  'AI 504',
        airline:       { name: 'Air India', code: 'AI', logo: '' },
        origin:        { city: 'Bangalore', airport: 'Kempegowda International Airport',                  airportCode: 'BLR', country: 'India', terminal: '2' },
        destination:   { city: 'Kolkata',   airport: 'Netaji Subhash Chandra Bose International Airport', airportCode: 'CCU', country: 'India', terminal: '2' },
        departureTime: new Date(Date.now() + 3  * 24 * 60 * 60 * 1000),
        arrivalTime:   new Date(Date.now() + 3  * 24 * 60 * 60 * 1000 + 2  * 60 * 60 * 1000 + 45 * 60 * 1000),
        basePrice: 4200, stops: 0, flightClass: 'Economy',
        seats: { total: 156, available: 93, economy: { total: 138, available: 80, price: 4200  }, business: { total: 18, available: 13, price: 18000 } },
        baggage: { carryOn: '8 kg', checkedBaggage: '25 kg' },
        meals: 'Included', wifi: true, entertainment: true, status: 'scheduled', isActive: true,
      },
      {
        flightNumber:  'UK 871',
        airline:       { name: 'Vistara', code: 'UK', logo: '' },
        origin:        { city: 'Delhi',    airport: 'Indira Gandhi International Airport', airportCode: 'DEL', country: 'India', terminal: '3' },
        destination:   { city: 'Udaipur',  airport: 'Maharana Pratap Airport',             airportCode: 'UDR', country: 'India', terminal: '1' },
        departureTime: new Date(Date.now() + 5  * 24 * 60 * 60 * 1000),
        arrivalTime:   new Date(Date.now() + 5  * 24 * 60 * 60 * 1000 + 1  * 60 * 60 * 1000 + 20 * 60 * 1000),
        basePrice: 5800, stops: 0, flightClass: 'Economy',
        seats: { total: 148, available: 67, economy: { total: 132, available: 62, price: 5800  }, business: { total: 16, available: 5,  price: 22000 } },
        baggage: { carryOn: '7 kg', checkedBaggage: '20 kg' },
        meals: 'Included', wifi: true, entertainment: false, status: 'scheduled', isActive: true,
      },
      {
        flightNumber:  '6E 612',
        airline:       { name: 'IndiGo', code: '6E', logo: '' },
        origin:        { city: 'Chennai', airport: 'Chennai International Airport',         airportCode: 'MAA', country: 'India', terminal: '1' },
        destination:   { city: 'Goa',     airport: 'Goa International Airport (Dabolim)',   airportCode: 'GOI', country: 'India', terminal: '1' },
        departureTime: new Date(Date.now() + 4  * 24 * 60 * 60 * 1000),
        arrivalTime:   new Date(Date.now() + 4  * 24 * 60 * 60 * 1000 + 1  * 60 * 60 * 1000 + 35 * 60 * 1000),
        basePrice: 2900, stops: 0, flightClass: 'Economy',
        seats: { total: 180, available: 97, economy: { total: 174, available: 91, price: 2900  }, business: { total: 6,  available: 6,  price: 10500 } },
        baggage: { carryOn: '7 kg', checkedBaggage: '15 kg' },
        meals: 'Paid', wifi: false, entertainment: false, status: 'scheduled', isActive: true,
      },
      {
        flightNumber:  'AI 665',
        airline:       { name: 'Air India', code: 'AI', logo: '' },
        origin:        { city: 'Mumbai', airport: 'Chhatrapati Shivaji Maharaj International Airport', airportCode: 'BOM', country: 'India', terminal: '2' },
        destination:   { city: 'Leh',    airport: 'Kushok Bakula Rimpochee Airport',                  airportCode: 'IXL', country: 'India', terminal: '1' },
        departureTime: new Date(Date.now() + 7  * 24 * 60 * 60 * 1000),
        arrivalTime:   new Date(Date.now() + 7  * 24 * 60 * 60 * 1000 + 2  * 60 * 60 * 1000 + 30 * 60 * 1000),
        basePrice: 9500, stops: 0, flightClass: 'Economy',
        seats: { total: 136, available: 50, economy: { total: 124, available: 39, price: 9500  }, business: { total: 12, available: 11, price: 32000 }, firstClass: { total: 0, available: 0, price: 0 } },
        baggage: { carryOn: '8 kg', checkedBaggage: '25 kg' },
        meals: 'Included', wifi: true, entertainment: true, status: 'scheduled', isActive: true,
      },
    ]);
    console.log(`✈️  ${flightDocs.length} flights created`);

    // ── Insert Packages ────────────────────────────────────
    const packageDocs = await TravelPackage.insertMany([
      {
        title:            'Golden Triangle: Delhi, Agra & Jaipur — 7 Days',
        slug:             slugify('Golden Triangle Delhi Agra Jaipur 7 Days', '001'),
        description:      'Experience the most celebrated circuit in Indian tourism — the iconic Golden Triangle. Witness the grandeur of Mughal Delhi, stand in awe before the Taj Mahal at sunrise, and explore the Pink City of Jaipur with its opulent palaces, vibrant bazaars, and majestic forts.',
        shortDescription: '7 days exploring Delhi, Agra and Jaipur — India\'s iconic Golden Triangle',
        destination:      { city: 'Delhi', country: 'India', region: 'North India' },
        duration:         { days: 7, nights: 6 },
        packageType:      'Cultural',
        pricing:          { perPerson: 48000, originalPrice: 62000, currency: 'INR' },
        groupSize:        { min: 1, max: 20 },
        difficulty:       'Easy',
        includes:         { flights: true, accommodation: true, meals: 'Breakfast', transfers: true, guide: true, insurance: false, activities: ['Taj Mahal Tour', 'Amber Fort Jeep Safari'] },
        highlights:       ['Taj Mahal at Sunrise', 'Amber Fort Jeep Safari', 'Qutub Minar & Old Delhi Walk', 'Jaipur City Palace Tour', 'Rajasthani Cultural Dinner'],
        coverImage:       { url: P[0] },
        images:           [{ url: P[0] }, { url: P[1] }],
        tags:             ['Rajasthan', 'Heritage', 'Delhi', 'Agra', 'Jaipur'],
        isFeatured: true, isBestSeller: true, isActive: true,
        ratings:          { overall: 4.8, reviewCount: 234 },
        bookingCount:     1240,
        createdBy:        admin._id,
        itinerary: [
          { day: 1, title: 'Arrival in Delhi',             description: 'Arrive and explore Old Delhi',      activities: ['Airport pickup', 'Jama Masjid Visit', 'Chandni Chowk Food Walk'],      meals: { breakfast: false, lunch: false, dinner: true },  accommodation: 'The Imperial New Delhi',  transport: 'Private transfer' },
          { day: 2, title: 'Delhi Monuments Day',          description: 'Explore New Delhi landmarks',       activities: ['Qutub Minar', 'India Gate', 'Humayuns Tomb'],                          meals: { breakfast: true,  lunch: true,  dinner: false }, accommodation: 'The Imperial New Delhi',  transport: 'Private driver' },
          { day: 3, title: 'Agra and the Taj Mahal',       description: 'Drive to Agra for Taj sunrise',     activities: ['Taj Mahal Sunrise', 'Agra Fort', 'Mehtab Bagh Sunset View'],           meals: { breakfast: true,  lunch: true,  dinner: false }, accommodation: 'Oberoi Amarvilas Agra',   transport: 'AC Car' },
          { day: 4, title: 'Agra to Jaipur via Fatehpur', description: 'Scenic drive to the Pink City',     activities: ['Fatehpur Sikri Stop', 'Jaipur Heritage Walk', 'Local Bazaar'],         meals: { breakfast: true,  lunch: false, dinner: true },  accommodation: 'Rambagh Palace Jaipur',   transport: 'Private driver' },
          { day: 5, title: 'Jaipur Palaces and Forts',    description: 'Explore the walled Pink City',      activities: ['Amber Fort Jeep Safari', 'City Palace', 'Hawa Mahal'],                  meals: { breakfast: true,  lunch: true,  dinner: false }, accommodation: 'Rambagh Palace Jaipur',   transport: 'Private driver' },
          { day: 6, title: 'Jaipur Markets and Culture',  description: 'Shopping and cultural evening',     activities: ['Johari Bazaar Shopping', 'Block Printing Workshop', 'Cultural Dinner'], meals: { breakfast: true,  lunch: false, dinner: true },  accommodation: 'Rambagh Palace Jaipur',   transport: 'Private driver' },
          { day: 7, title: 'Departure from Jaipur',       description: 'Check out and transfer to airport', activities: ['Jantar Mantar Visit', 'Airport Drop'],                                  meals: { breakfast: true,  lunch: false, dinner: false }, accommodation: '',                        transport: 'Private transfer' },
        ],
      },
      {
        title:            'Kerala Backwaters & Ayurveda: 6 Nights',
        slug:             slugify('Kerala Backwaters Ayurveda 6 Nights', '002'),
        description:      'Drift through the legendary backwaters of Kerala on a traditional kettuvallam houseboat, rejuvenate with authentic Ayurvedic treatments in serene wellness retreats, and explore the spice-scented hills of Munnar. God\'s Own Country at its most indulgent.',
        shortDescription: '6 nights of houseboats, Ayurveda and misty hill stations across Kerala',
        destination:      { city: 'Kochi', country: 'India', region: 'South India' },
        duration:         { days: 7, nights: 6 },
        packageType:      'Wellness',
        pricing:          { perPerson: 65000, originalPrice: 85000, currency: 'INR' },
        groupSize:        { min: 2, max: 10 },
        difficulty:       'Easy',
        includes:         { flights: true, accommodation: true, meals: 'All Inclusive', transfers: true, guide: false, insurance: true, activities: ['Houseboat Overnight Cruise', 'Ayurvedic Treatments'] },
        highlights:       ['Alleppey Houseboat Overnight', 'Vembanad Lake Sunset Cruise', 'Thekkady Spice Plantation Walk', 'Munnar Tea Estate Tour', 'Panchakarma Ayurvedic Session'],
        coverImage:       { url: P[1] },
        images:           [{ url: P[1] }, { url: P[3] }],
        tags:             ['Kerala', 'Backwaters', 'Ayurveda', 'Houseboat', 'Wellness'],
        isFeatured: true, isBestSeller: true, isActive: true,
        ratings:          { overall: 4.9, reviewCount: 189 },
        bookingCount:     892,
        createdBy:        admin._id,
        itinerary:        [],
      },
      {
        title:            'Spiritual Varanasi & Ganga Aarti: 4 Days',
        slug:             slugify('Spiritual Varanasi Ganga Aarti 4 Days', '003'),
        description:      'Journey to the spiritual heart of India — Varanasi, one of the world\'s oldest living cities on the banks of the sacred Ganges. Witness the transcendental Ganga Aarti, take a dawn boat ride through the ancient ghats, and experience the profound spiritual intensity of this eternal city.',
        shortDescription: 'The spiritual soul of India — ghats, Ganga Aarti and ancient temples',
        destination:      { city: 'Varanasi', country: 'India', region: 'North India' },
        duration:         { days: 4, nights: 3 },
        packageType:      'Cultural',
        pricing:          { perPerson: 22000, originalPrice: 30000, currency: 'INR' },
        groupSize:        { min: 1, max: 15 },
        difficulty:       'Easy',
        includes:         { flights: true, accommodation: true, meals: 'Breakfast', transfers: true, guide: true, insurance: false, activities: ['Ganga Aarti Ceremony', 'Sunrise Boat Ride'] },
        highlights:       ['Dashashwamedh Ghat Aarti', 'Sunrise Boat Ride on the Ganges', 'Kashi Vishwanath Temple Darshan', 'Sarnath Buddhist Site', 'Banarasi Silk Weaving Visit'],
        coverImage:       { url: P[2] },
        images:           [{ url: P[2] }, { url: P[4] }],
        tags:             ['Varanasi', 'Spiritual', 'Ganges', 'Temples', 'Heritage'],
        isFeatured: true, isBestSeller: false, isActive: true,
        ratings:          { overall: 4.8, reviewCount: 312 },
        bookingCount:     1567,
        createdBy:        admin._id,
        itinerary:        [],
      },
      {
        title:            'Himalayan Trek — Triund & McLeod Ganj: 5 Days',
        slug:             slugify('Himalayan Trek Triund McLeod Ganj 5 Days', '004'),
        description:      'Lace up your boots for an exhilarating trek through the Dhauladhar mountain range of Himachal Pradesh. Starting from the Tibetan-influenced town of McLeod Ganj, you\'ll trek to the stunning Triund ridge offering panoramic Himalayan views, camp under a blanket of stars, and soak in the unique spiritual energy of Little Lhasa.',
        shortDescription: 'Trek to Triund ridge and explore McLeod Ganj — 5 days in Himachal Pradesh',
        destination:      { city: 'Dharamshala', country: 'India', region: 'Himachal Pradesh' },
        duration:         { days: 5, nights: 4 },
        packageType:      'Adventure',
        pricing:          { perPerson: 28000, originalPrice: 38000, currency: 'INR' },
        groupSize:        { min: 2, max: 12 },
        difficulty:       'Moderate',
        includes:         { flights: false, accommodation: true, meals: 'Full Board', transfers: true, guide: true, insurance: false, activities: ['Triund Trek', 'Mountain Camping'] },
        highlights:       ['Triund Summit Sunrise', 'Camping Under Himalayan Stars', 'Bhagsu Waterfall Walk', 'Dalai Lama Temple Visit', 'Tibetan Monastery Tour'],
        coverImage:       { url: P[3] },
        images:           [{ url: P[3] }, { url: P[5] }],
        tags:             ['Himachal Pradesh', 'Trek', 'Himalaya', 'Adventure', 'Camping'],
        isFeatured: false, isBestSeller: false, isActive: true,
        ratings:          { overall: 4.7, reviewCount: 245 },
        bookingCount:     1089,
        createdBy:        admin._id,
        itinerary:        [],
      },
      {
        title:            'Rajasthan Royal Heritage: Jodhpur & Jaisalmer — 7 Days',
        slug:             slugify('Rajasthan Royal Heritage Jodhpur Jaisalmer 7 Days', '005'),
        description:      'Venture beyond the Golden Triangle into the raw, magnificent heart of Rajasthan. Explore the blue city of Jodhpur with its imposing Mehrangarh Fort, camel-trek into the golden dunes of the Thar Desert around Jaisalmer, and sleep under the stars in a luxury desert camp.',
        shortDescription: 'Blue city, golden desert and royal palaces — 7 days of Rajasthan splendour',
        destination:      { city: 'Jodhpur', country: 'India', region: 'Rajasthan' },
        duration:         { days: 7, nights: 6 },
        packageType:      'Cultural',
        pricing:          { perPerson: 52000, originalPrice: 68000, currency: 'INR' },
        groupSize:        { min: 2, max: 16 },
        difficulty:       'Easy',
        includes:         { flights: false, accommodation: true, meals: 'Half Board', transfers: true, guide: true, insurance: false, activities: ['Camel Safari', 'Luxury Desert Camp Stay'] },
        highlights:       ['Mehrangarh Fort Jodhpur', 'Thar Desert Camel Safari', 'Luxury Desert Camp Night', 'Jaisalmer Golden Fort', 'Village Safaris and Folk Music'],
        coverImage:       { url: P[4] },
        images:           [{ url: P[4] }, { url: P[0] }],
        tags:             ['Rajasthan', 'Jodhpur', 'Jaisalmer', 'Desert', 'Heritage'],
        isFeatured: true, isBestSeller: false, isActive: true,
        ratings:          { overall: 4.6, reviewCount: 178 },
        bookingCount:     723,
        createdBy:        admin._id,
        itinerary:        [],
      },
      {
        title:            'Goa Beach Escape: Sun, Sand & Spice — 5 Days',
        slug:             slugify('Goa Beach Escape Sun Sand Spice 5 Days', '006'),
        description:      'Surrender to the irresistible charm of Goa — India\'s beloved coastal paradise. From the golden sands of North Goa\'s vibrant beach shacks to the serene coconut-fringed shores of South Goa, this package blends beach bliss with Portuguese heritage, spice plantation tours, and the legendary Goan seafood trail.',
        shortDescription: 'Beaches, Portuguese forts, spice trails and seafood — 5 perfect days in Goa',
        destination:      { city: 'Panaji', country: 'India', region: 'Goa' },
        duration:         { days: 5, nights: 4 },
        packageType:      'Beach',
        pricing:          { perPerson: 32000, originalPrice: 42000, currency: 'INR' },
        groupSize:        { min: 2, max: 20 },
        difficulty:       'Easy',
        includes:         { flights: true, accommodation: true, meals: 'Breakfast', transfers: true, guide: false, insurance: false, activities: ['Spice Plantation Tour', 'Mandovi Sunset Cruise'] },
        highlights:       ['Calangute and Baga Beach Days', 'Old Goa Churches UNESCO Tour', 'Spice Plantation Lunch Tour', 'Mandovi River Sunset Cruise', 'Seafood Trail at Fishermans Wharf'],
        coverImage:       { url: P[5] },
        images:           [{ url: P[5] }, { url: P[2] }],
        tags:             ['Goa', 'Beach', 'Portuguese', 'Seafood', 'Coastal'],
        isFeatured: true, isBestSeller: false, isActive: true,
        ratings:          { overall: 4.9, reviewCount: 143 },
        bookingCount:     456,
        createdBy:        admin._id,
        itinerary:        [],
      },
    ]);
    console.log(`📦 ${packageDocs.length} packages created`);

    // ── Insert Reviews ─────────────────────────────────────
    const reviewBodies = [
      'The staff were incredibly attentive and the facilities were world-class. The location was perfect and the views absolutely breathtaking. The Ayurvedic spa and yoga sessions were the highlight of our stay. Will definitely return!',
      'From the moment we arrived everything was flawless. The room was immaculate, the food outstanding, and the team went above and beyond. The heritage decor and cultural performances made us feel truly connected to India.',
      'A truly memorable experience. The property is stunning and the surrounding area offers so much to explore. The guided tours of local temples and monuments were exceptionally well organised.',
    ];
    const reviewTitles = [
      'Absolutely stunning stay',
      'Exceeded all expectations',
      'Perfect getaway will return',
      'World-class service',
      'A dream come true',
      'Highly recommend',
    ];
    const tripTypes  = ['Leisure', 'Romantic', 'Family', 'Business', 'Solo'];
    const reviewDocs = [];

    hotelDocs.slice(0, 5).forEach(function(hotel, hi) {
      users.slice(0, 2).forEach(function(user, ui) {
        reviewDocs.push({
          user:    user._id,
          hotel:   hotel._id,
          title:   reviewTitles[(hi * 2 + ui) % reviewTitles.length],
          review:  reviewBodies[ui % reviewBodies.length],
          ratings: {
            overall:       parseFloat((4   + Math.random()).toFixed(1)),
            cleanliness:   parseFloat((4   + Math.random()).toFixed(1)),
            location:      parseFloat((4   + Math.random()).toFixed(1)),
            service:       parseFloat((4   + Math.random()).toFixed(1)),
            valueForMoney: parseFloat((3.5 + Math.random()).toFixed(1)),
            facilities:    parseFloat((4   + Math.random()).toFixed(1)),
          },
          tripType:   tripTypes[(hi + ui) % tripTypes.length],
          isVerified: true,
          isActive:   true,
        });
      });
    });

    await Review.insertMany(reviewDocs);
    console.log(`⭐ ${reviewDocs.length} reviews created`);

    // ── Final Summary ──────────────────────────────────────
    console.log('\n╔═══════════════════════════════════════════╗');
    console.log('║   ✅ Database seeded successfully!        ║');
    console.log('╠═══════════════════════════════════════════╣');
    console.log('║  Admin:                                   ║');
    console.log('║    Email    : admin@travelplatform.com    ║');
    console.log('║    Password : Admin@123456                ║');
    console.log('║                                           ║');
    console.log('║  User:                                    ║');
    console.log('║    Email    : priya@example.com           ║');
    console.log('║    Password : Password@123                ║');
    console.log('╚═══════════════════════════════════════════╝\n');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error.stack);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDB();
