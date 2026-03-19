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
          name:            'Alice Johnson',
          email:           'alice@example.com',
          password:        userHash,
          role:            'user',
          isEmailVerified: true,
          isActive:        true,
          authProvider:    'local',
          avatar:          { url: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=6366f1&color=fff' },
          preferences:     { budget: 'luxury', travelStyle: ['romantic', 'relaxation'] },
        },
        {
          name:            'Bob Smith',
          email:           'bob@example.com',
          password:        userHash,
          role:            'user',
          isEmailVerified: true,
          isActive:        true,
          authProvider:    'local',
          avatar:          { url: 'https://ui-avatars.com/api/?name=Bob+Smith&background=ec4899&color=fff' },
          preferences:     { budget: 'mid-range', travelStyle: ['adventure', 'cultural'] },
        },
        {
          name:            'Carol White',
          email:           'carol@example.com',
          password:        userHash,
          role:            'user',
          isEmailVerified: true,
          isActive:        true,
          authProvider:    'local',
          avatar:          { url: 'https://ui-avatars.com/api/?name=Carol+White&background=f59e0b&color=fff' },
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

    const userCheck = await User.findOne({ email: 'alice@example.com' }).select('+password');
    const userOk    = await bcrypt.compare('Password@123', userCheck.password);
    console.log('🔑 User password verification after insert:', userOk ? '✅ PASS' : '❌ FAIL');

    if (!adminOk || !userOk) {
      throw new Error('Password verification after insert FAILED — pre-save hook may have re-hashed!');
    }

    // ── Insert Hotels ──────────────────────────────────────
    const hotelDocs = await Hotel.insertMany([
      {
        name:             'The Grand Azure Resort',
        slug:             slugify('The Grand Azure Resort', '001'),
        description:      'Perched on the pristine shores of Maldives, The Grand Azure Resort offers an unparalleled luxury experience.',
        shortDescription: 'Ultimate luxury overwater villas in the heart of Maldives',
        propertyType:     'Resort',
        starRating:       5,
        location: {
          address:     'North Male Atoll',
          city:        'Maldives',
          country:     'Maldives',
          coordinates: { type: 'Point', coordinates: [73.5093, 4.1755] },
          nearbyAttractions: [
           'Coral Reef', 
           'Dolphin Cove'
          ],
        },
        coverImage: { url: H[0] },
        images: [
          { url: H[0], isPrimary: true },
          { url: H[1] },
          { url: H[2] },
        ],
        amenities: {
          general:    ['Free WiFi', 'Private Beach', 'Infinity Pool', 'Air Conditioning'],
          dining:     ['Underwater Restaurant', 'Rooftop Bar', 'Room Service'],
          services:   ['24hr Concierge', 'Spa', 'Butler Service', 'Airport Transfer'],
          recreation: ['Snorkeling', 'Diving', 'Kayaking', 'Tennis Court'],
        },
        rooms: [
          { roomType: 'Deluxe',       pricePerNight: 450,  maxGuests: 2, bedType: 'King', size: 55,  totalRooms: 20, amenities: ['Ocean View', 'Balcony', 'Mini Bar'] },
          { roomType: 'Suite',        pricePerNight: 750,  maxGuests: 3, bedType: 'King', size: 90,  totalRooms: 10, amenities: ['Private Pool', 'Ocean View', 'Jacuzzi'] },
          { roomType: 'Presidential', pricePerNight: 1500, maxGuests: 4, bedType: 'King', size: 200, totalRooms: 2,  amenities: ['Private Beach', 'Butler', 'Cinema Room'] },
        ],
        priceRange:    { min: 450,  max: 1500 },
        ratings:       { overall: 4.9, cleanliness: 5.0, location: 4.8, service: 4.9, valueForMoney: 4.7, facilities: 4.9 },
        reviewCount:   847,
        policies:      { checkIn: '3:00 PM', checkOut: '11:00 AM', cancellation: 'Flexible' },
        isFeatured:    true,
        isVerified:    true,
        isActive:      true,
        tags:          ['Overwater Villa', 'Luxury', 'Maldives', 'Honeymoon', 'Beach'],
        totalBookings: 1240,
        totalRevenue:  892000,
        owner:         admin._id,
      },
      {
        name:             'Santorini Cliffside Suites',
        slug:             slugify('Santorini Cliffside Suites', '002'),
        description:      'Carved into the volcanic cliffs of Oia, Santorini Cliffside Suites blends Cycladic architecture with modern luxury.',
        shortDescription: 'Iconic caldera views with private infinity pools in Santorini',
        propertyType:     'Boutique Hotel',
        starRating:       5,
        location: {
          address:     'Oia Village, Santorini',
          city:        'Santorini',
          country:     'Greece',
          coordinates: { type: 'Point', coordinates: [25.3748, 36.4618] },
          nearbyAttractions: [
         'Oia Castle',
          'Red Beach'
          ],
        },
        coverImage: { url: H[1] },
        images:     [{ url: H[1], isPrimary: true }, { url: H[3] }, { url: H[5] }],
        amenities: {
          general:    ['Free WiFi', 'Infinity Pool', 'Air Conditioning', 'Terrace'],
          dining:     ['Mediterranean Restaurant', 'Champagne Bar', 'Breakfast in Bed'],
          services:   ['Concierge', 'Spa', 'Airport Transfer', 'Wine Tasting'],
          recreation: ['Sunset Cruise', 'Wine Tour', 'Cooking Class'],
        },
        rooms: [
          { roomType: 'Deluxe', pricePerNight: 380, maxGuests: 2, bedType: 'Queen', size: 45, totalRooms: 15, amenities: ['Caldera View', 'Private Terrace'] },
          { roomType: 'Suite',  pricePerNight: 680, maxGuests: 2, bedType: 'King',  size: 75, totalRooms: 8,  amenities: ['Private Infinity Pool', 'Caldera View', 'Jacuzzi'] },
        ],
        priceRange:    { min: 380,  max: 680 },
        ratings:       { overall: 4.8, cleanliness: 4.9, location: 5.0, service: 4.7, valueForMoney: 4.6, facilities: 4.8 },
        reviewCount:   612,
        policies:      { checkIn: '3:00 PM', checkOut: '11:00 AM', cancellation: 'Flexible' },
        isFeatured:    true,
        isVerified:    true,
        isActive:      true,
        tags:          ['Santorini', 'Caldera View', 'Romantic', 'Honeymoon', 'Greece'],
        totalBookings: 980,
        totalRevenue:  540000,
        owner:         admin._id,
      },
      {
        name:             'Tokyo Skyline Tower Hotel',
        slug:             slugify('Tokyo Skyline Tower Hotel', '003'),
        description:      'Located in the heart of Shinjuku, Tokyo Skyline Tower Hotel offers breathtaking panoramic views of Mount Fuji.',
        shortDescription: 'Panoramic Tokyo views with Japanese luxury in Shinjuku',
        propertyType:     'Hotel',
        starRating:       5,
        location: {
          address:     '2-7-2 Nishi-Shinjuku',
          city:        'Tokyo',
          country:     'Japan',
          coordinates: { type: 'Point', coordinates: [139.6917, 35.6895] },
          nearbyAttractions: [
       'Shinjuku Gyoen',
          'Tokyo Metropolitan Government'
          ],
        },
        coverImage: { url: H[2] },
        images:     [{ url: H[2], isPrimary: true }, { url: H[4] }, { url: H[6] }],
        amenities: {
          general:    ['Free WiFi', 'Rooftop Pool', 'Fitness Center', 'Business Center'],
          dining:     ['Teppanyaki Restaurant', 'Sushi Bar', 'Sky Bar', 'Room Service'],
          services:   ['Concierge', 'Spa', 'Valet Parking', 'Translation Services'],
          recreation: ['Pool', 'Gym', 'Karaoke Lounge', 'Tea Ceremony'],
        },
        rooms: [
          { roomType: 'Standard', pricePerNight: 220, maxGuests: 2, bedType: 'Double', size: 32, totalRooms: 50, amenities: ['City View', 'Work Desk'] },
          { roomType: 'Deluxe',   pricePerNight: 320, maxGuests: 2, bedType: 'King',   size: 48, totalRooms: 30, amenities: ['Mt Fuji View', 'Bathtub'] },
          { roomType: 'Suite',    pricePerNight: 580, maxGuests: 3, bedType: 'King',   size: 80, totalRooms: 12, amenities: ['Panoramic View', 'Living Room'] },
        ],
        priceRange:    { min: 220,  max: 580 },
        ratings:       { overall: 4.7, cleanliness: 4.8, location: 4.9, service: 4.6, valueForMoney: 4.5, facilities: 4.7 },
        reviewCount:   1253,
        policies:      { checkIn: '3:00 PM', checkOut: '11:00 AM', cancellation: 'Moderate' },
        isFeatured:    true,
        isVerified:    true,
        isActive:      true,
        tags:          ['Tokyo', 'City Hotel', 'Business', 'Japan', 'Luxury'],
        totalBookings: 2100,
        totalRevenue:  680000,
        owner:         admin._id,
      },
      {
        name:             'Bali Jungle Eco Lodge',
        slug:             slugify('Bali Jungle Eco Lodge', '004'),
        description:      'Nestled amid ancient rice terraces and lush tropical jungle in Ubud, Bali Jungle Eco Lodge provides an immersive experience.',
        shortDescription: 'Serene Balinese jungle villas with rice terrace views in Ubud',
        propertyType:     'Villa',
        starRating:       4,
        location: {
          address:     'Jalan Kajeng, Ubud',
          city:        'Bali',
          country:     'Indonesia',
          coordinates: { type: 'Point', coordinates: [115.2625, -8.5069] },
          nearbyAttractions: [
          'Tegalalang Rice Terraces',
           'Sacred Monkey Forest'
          ],
        },
        coverImage: { url: H[3] },
        images:     [{ url: H[3], isPrimary: true }, { url: H[7] }, { url: H[0] }],
        amenities: {
          general:    ['Free WiFi', 'Private Pool', 'Air Conditioning', 'Garden'],
          dining:     ['Organic Restaurant', 'Pool Bar', 'Cooking Classes'],
          services:   ['Spa', 'Yoga Classes', 'Bike Rental', 'Temple Tours'],
          recreation: ['Meditation Garden', 'Pool', 'Cultural Performances'],
        },
        rooms: [
          { roomType: 'Standard', pricePerNight: 110, maxGuests: 2, bedType: 'Queen', size: 40, totalRooms: 12, amenities: ['Garden View', 'Outdoor Shower'] },
          { roomType: 'Deluxe',   pricePerNight: 185, maxGuests: 2, bedType: 'King',  size: 65, totalRooms: 8,  amenities: ['Rice Terrace View', 'Private Pool'] },
          { roomType: 'Suite',    pricePerNight: 280, maxGuests: 3, bedType: 'King',  size: 95, totalRooms: 4,  amenities: ['Jungle View', 'Private Pool'] },
        ],
        priceRange:    { min: 110,  max: 280 },
        ratings:       { overall: 4.6, cleanliness: 4.7, location: 4.5, service: 4.8, valueForMoney: 4.9, facilities: 4.5 },
        reviewCount:   439,
        policies:      { checkIn: '2:00 PM', checkOut: '12:00 PM', cancellation: 'Flexible' },
        isFeatured:    true,
        isVerified:    true,
        isActive:      true,
        tags:          ['Bali', 'Eco Lodge', 'Jungle', 'Yoga', 'Cultural'],
        totalBookings: 780,
        totalRevenue:  210000,
        owner:         admin._id,
      },
      {
        name:             'New York Midtown Grand',
        slug:             slugify('New York Midtown Grand', '005'),
        description:      'Commanding the Manhattan skyline from its prime Midtown location, offering iconic views of Central Park.',
        shortDescription: 'Manhattan luxury with Central Park views and iconic skyline',
        propertyType:     'Hotel',
        starRating:       5,
        location: {
          address:     '151 West 54th Street, Midtown',
          city:        'New York',
          country:     'USA',
          coordinates: { type: 'Point', coordinates: [-73.9857, 40.7614] },
          nearbyAttractions: [
        'Central Park', 
            'Times Square'
          ],
        },
        coverImage: { url: H[6] },
        images:     [{ url: H[6], isPrimary: true }, { url: H[1] }],
        amenities: {
          general:    ['Free WiFi', 'Fitness Center', 'Business Center', 'Concierge'],
          dining:     ['Michelin Star Restaurant', 'Rooftop Bar', '24hr Room Service'],
          services:   ['Valet Parking', 'Spa', 'Limousine Service'],
          recreation: ['Gym', 'Spa', 'Rooftop Terrace'],
        },
        rooms: [
          { roomType: 'Standard', pricePerNight: 350, maxGuests: 2, bedType: 'Queen', size: 30,  totalRooms: 80, amenities: ['City View', 'Work Desk'] },
          { roomType: 'Deluxe',   pricePerNight: 520, maxGuests: 2, bedType: 'King',  size: 45,  totalRooms: 40, amenities: ['Central Park View', 'Marble Bathroom'] },
          { roomType: 'Suite',    pricePerNight: 950, maxGuests: 4, bedType: 'King',  size: 110, totalRooms: 15, amenities: ['Skyline View', 'Living Room'] },
        ],
        priceRange:    { min: 350,   max: 950 },
        ratings:       { overall: 4.7, cleanliness: 4.8, location: 5.0, service: 4.6, valueForMoney: 4.2, facilities: 4.7 },
        reviewCount:   2134,
        policies:      { checkIn: '4:00 PM', checkOut: '12:00 PM', cancellation: 'Strict' },
        isFeatured:    true,
        isVerified:    true,
        isActive:      true,
        tags:          ['New York', 'Manhattan', 'Business', 'Luxury'],
        totalBookings: 3400,
        totalRevenue:  1200000,
        owner:         admin._id,
      },
      {
        name:             'Marrakech Riad Luxe',
        slug:             slugify('Marrakech Riad Luxe', '006'),
        description:      'Hidden behind ancient medina walls, a traditional Moroccan palace transformed into an intimate luxury retreat.',
        shortDescription: 'Authentic Moroccan palace experience in the heart of the Medina',
        propertyType:     'Boutique Hotel',
        starRating:       5,
        location: {
          address:     'Derb Sidi Ahmed Ou Moussa, Medina',
          city:        'Marrakech',
          country:     'Morocco',
          coordinates: { type: 'Point', coordinates: [-7.9811, 31.6295] },
          nearbyAttractions: [
          'Jemaa el-Fnaa', 
            'Bahia Palace'
          ],
        },
        coverImage: { url: H[5] },
        images:     [{ url: H[5], isPrimary: true }, { url: H[7] }],
        amenities: {
          general:    ['Free WiFi', 'Rooftop Terrace', 'Courtyard Pool', 'Air Conditioning'],
          dining:     ['Moroccan Restaurant', 'Rooftop Dining', 'Cooking Workshop'],
          services:   ['Hammam', 'Spa', 'Guided Medina Tours', 'Airport Transfer'],
          recreation: ['Rooftop Pool', 'Hammam', 'Cultural Tours'],
        },
        rooms: [
          { roomType: 'Standard', pricePerNight: 145, maxGuests: 2, bedType: 'Double', size: 30, totalRooms: 8, amenities: ['Courtyard View'] },
          { roomType: 'Suite',    pricePerNight: 290, maxGuests: 2, bedType: 'King',   size: 65, totalRooms: 4, amenities: ['Rooftop Access', 'Private Terrace'] },
        ],
        priceRange:    { min: 145,  max: 290 },
        ratings:       { overall: 4.8, cleanliness: 4.7, location: 4.9, service: 4.9, valueForMoney: 4.8, facilities: 4.6 },
        reviewCount:   215,
        policies:      { checkIn: '3:00 PM', checkOut: '12:00 PM', cancellation: 'Flexible' },
        isFeatured:    true,
        isVerified:    true,
        isActive:      true,
        tags:          ['Marrakech', 'Riad', 'Morocco', 'Cultural', 'Luxury'],
        totalBookings: 340,
        totalRevenue:  89000,
        owner:         admin._id,
      },
      {
        name:             'Cape Town Ocean Escape',
        slug:             slugify('Cape Town Ocean Escape', '007'),
        description:      'Dramatically situated between Table Mountain and the Atlantic Ocean.',
        shortDescription: 'Between Table Mountain and the Atlantic — Cape Towns finest stay',
        propertyType:     'Hotel',
        starRating:       4,
        location: {
          address:     'Victoria and Alfred Waterfront',
          city:        'Cape Town',
          country:     'South Africa',
          coordinates: { type: 'Point', coordinates: [18.4241, -33.9249] },
          nearbyAttractions: [
            'Table Mountain', 
           'Waterfront'
          ],
        },
        coverImage: { url: H[7] },
        images:     [{ url: H[7], isPrimary: true }, { url: H[3] }],
        amenities: {
          general:    ['Free WiFi', 'Rooftop Pool', 'Mountain View', 'Air Conditioning'],
          dining:     ['Cape Fusion Restaurant', 'Wine Bar', 'Breakfast Buffet'],
          services:   ['Spa', 'Airport Transfer', 'Wine Tours', 'Safari Booking'],
          recreation: ['Rooftop Pool', 'Gym', 'Yoga Classes'],
        },
        rooms: [
          { roomType: 'Standard', pricePerNight: 160, maxGuests: 2, bedType: 'Double', size: 32, totalRooms: 30, amenities: ['Garden View'] },
          { roomType: 'Deluxe',   pricePerNight: 240, maxGuests: 2, bedType: 'King',   size: 50, totalRooms: 20, amenities: ['Mountain View', 'Balcony'] },
          { roomType: 'Suite',    pricePerNight: 420, maxGuests: 3, bedType: 'King',   size: 80, totalRooms: 8,  amenities: ['Ocean View', 'Plunge Pool'] },
        ],
        priceRange:    { min: 160,  max: 420 },
        ratings:       { overall: 4.6, cleanliness: 4.7, location: 4.8, service: 4.5, valueForMoney: 4.6, facilities: 4.5 },
        reviewCount:   567,
        policies:      { checkIn: '3:00 PM', checkOut: '11:00 AM', cancellation: 'Flexible' },
        isFeatured:    false,
        isVerified:    true,
        isActive:      true,
        tags:          ['Cape Town', 'South Africa', 'Table Mountain', 'Safari'],
        totalBookings: 890,
        totalRevenue:  260000,
        owner:         admin._id,
      },
      {
        name:             'Dubrovnik Pearl Hotel',
        slug:             slugify('Dubrovnik Pearl Hotel', '008'),
        description:      'Overlooking the crystalline Adriatic Sea and the UNESCO-listed Old City walls.',
        shortDescription: 'Adriatic views with steps to Dubrovniks famous Old Town',
        propertyType:     'Hotel',
        starRating:       4,
        location: {
          address:     'Ul. Branitelja Dubrovnika 41',
          city:        'Dubrovnik',
          country:     'Croatia',
          coordinates: { type: 'Point', coordinates: [18.0944, 42.6507] },
          nearbyAttractions: [
        'Old City Walls',
        'Banje Beach'
          ],
        },
        coverImage: { url: H[4] },
        images:     [{ url: H[4], isPrimary: true }, { url: H[2] }],
        amenities: {
          general:    ['Free WiFi', 'Outdoor Pool', 'Sea View Terrace', 'Air Conditioning'],
          dining:     ['Seafood Restaurant', 'Cocktail Bar', 'Breakfast Buffet'],
          services:   ['Concierge', 'Airport Shuttle', 'Bike Rental'],
          recreation: ['Pool', 'Water Sports', 'City Tours'],
        },
        rooms: [
          { roomType: 'Standard', pricePerNight: 175, maxGuests: 2, bedType: 'Double', size: 28, totalRooms: 25, amenities: ['City View'] },
          { roomType: 'Deluxe',   pricePerNight: 265, maxGuests: 2, bedType: 'King',   size: 42, totalRooms: 15, amenities: ['Sea View', 'Balcony', 'Bathtub'] },
        ],
        priceRange:    { min: 175,  max: 265 },
        ratings:       { overall: 4.5, cleanliness: 4.6, location: 4.8, service: 4.4, valueForMoney: 4.3, facilities: 4.4 },
        reviewCount:   328,
        policies:      { checkIn: '3:00 PM', checkOut: '11:00 AM', cancellation: 'Moderate' },
        isFeatured:    false,
        isVerified:    true,
        isActive:      true,
        tags:          ['Dubrovnik', 'Croatia', 'Adriatic', 'Old Town', 'Beach'],
        totalBookings: 560,
        totalRevenue:  145000,
        owner:         admin._id,
      },
    ]);
    console.log(`🏨 ${hotelDocs.length} hotels created`);

    // ── Insert Flights ─────────────────────────────────────
    const flightDocs = await Flight.insertMany([
      {
        flightNumber:  'TP101',
        airline:       { name: 'TravelAir',  code: 'TP', logo: '' },
        origin:        { city: 'New York',   airport: 'John F. Kennedy International', airportCode: 'JFK', country: 'USA',       terminal: '4' },
        destination:   { city: 'London',     airport: 'Heathrow Airport',              airportCode: 'LHR', country: 'UK',        terminal: '5' },
        departureTime: new Date(Date.now() + 2  * 24 * 60 * 60 * 1000),
        arrivalTime:   new Date(Date.now() + 2  * 24 * 60 * 60 * 1000 + 7  * 60 * 60 * 1000),
        basePrice: 480, stops: 0, flightClass: 'Economy',
        seats: { total: 210, available: 53, economy: { total: 180, available: 45, price: 480  }, business: { total: 30, available: 8,  price: 1850 } },
        baggage: { carryOn: '10 kg', checkedBaggage: '23 kg' },
        meals: 'Included', wifi: true, entertainment: true, status: 'scheduled', isActive: true,
      },
      {
        flightNumber:  'TP205',
        airline:       { name: 'SkyWings',   code: 'SW', logo: '' },
        origin:        { city: 'Dubai',      airport: 'Dubai International Airport',  airportCode: 'DXB', country: 'UAE',       terminal: '3' },
        destination:   { city: 'Tokyo',      airport: 'Narita International Airport', airportCode: 'NRT', country: 'Japan',     terminal: '2' },
        departureTime: new Date(Date.now() + 3  * 24 * 60 * 60 * 1000),
        arrivalTime:   new Date(Date.now() + 3  * 24 * 60 * 60 * 1000 + 9  * 60 * 60 * 1000 + 30 * 60 * 1000),
        basePrice: 620, stops: 0, flightClass: 'Economy',
        seats: { total: 242, available: 93, economy: { total: 200, available: 78, price: 620  }, business: { total: 42, available: 15, price: 2400 } },
        baggage: { carryOn: '7 kg',  checkedBaggage: '30 kg' },
        meals: 'Included', wifi: true, entertainment: true, status: 'scheduled', isActive: true,
      },
      {
        flightNumber:  'TP312',
        airline:       { name: 'EuroJet',    code: 'EJ', logo: '' },
        origin:        { city: 'London',     airport: 'Gatwick Airport',              airportCode: 'LGW', country: 'UK',        terminal: 'N' },
        destination:   { city: 'Santorini',  airport: 'Santorini Airport',            airportCode: 'JTR', country: 'Greece',    terminal: '1' },
        departureTime: new Date(Date.now() + 5  * 24 * 60 * 60 * 1000),
        arrivalTime:   new Date(Date.now() + 5  * 24 * 60 * 60 * 1000 + 3  * 60 * 60 * 1000 + 45 * 60 * 1000),
        basePrice: 220, stops: 0, flightClass: 'Economy',
        seats: { total: 166, available: 67, economy: { total: 150, available: 62, price: 220  }, business: { total: 16, available: 5,  price: 780  } },
        baggage: { carryOn: '10 kg', checkedBaggage: '20 kg' },
        meals: 'Paid', wifi: false, entertainment: false, status: 'scheduled', isActive: true,
      },
      {
        flightNumber:  'TP450',
        airline:       { name: 'AsiaWings',  code: 'AW', logo: '' },
        origin:        { city: 'Singapore',  airport: 'Changi Airport',               airportCode: 'SIN', country: 'Singapore', terminal: '3' },
        destination:   { city: 'Bali',       airport: 'Ngurah Rai International',     airportCode: 'DPS', country: 'Indonesia', terminal: 'I' },
        departureTime: new Date(Date.now() + 4  * 24 * 60 * 60 * 1000),
        arrivalTime:   new Date(Date.now() + 4  * 24 * 60 * 60 * 1000 + 2  * 60 * 60 * 1000 + 20 * 60 * 1000),
        basePrice: 190, stops: 0, flightClass: 'Economy',
        seats: { total: 180, available: 97, economy: { total: 160, available: 88, price: 190  }, business: { total: 20, available: 9,  price: 650  } },
        baggage: { carryOn: '7 kg',  checkedBaggage: '20 kg' },
        meals: 'Included', wifi: true, entertainment: false, status: 'scheduled', isActive: true,
      },
      {
        flightNumber:  'TP567',
        airline:       { name: 'TravelAir',  code: 'TP', logo: '' },
        origin:        { city: 'Los Angeles',airport: 'LAX International Airport',    airportCode: 'LAX', country: 'USA',       terminal: 'B' },
        destination:   { city: 'Tokyo',      airport: 'Narita International Airport', airportCode: 'NRT', country: 'Japan',     terminal: '1' },
        departureTime: new Date(Date.now() + 7  * 24 * 60 * 60 * 1000),
        arrivalTime:   new Date(Date.now() + 7  * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000),
        basePrice: 780, stops: 0, flightClass: 'Economy',
        seats: { total: 273, available: 50, economy: { total: 220, available: 35, price: 780  }, business: { total: 45, available: 12, price: 3200 }, firstClass: { total: 8, available: 3, price: 6500 } },
        baggage: { carryOn: '10 kg', checkedBaggage: '23 kg' },
        meals: 'Included', wifi: true, entertainment: true, status: 'scheduled', isActive: true,
      },
    ]);
    console.log(`✈️  ${flightDocs.length} flights created`);

    // ── Insert Packages ────────────────────────────────────
    const packageDocs = await TravelPackage.insertMany([
      {
        title:            'Bali Paradise: 7 Days of Culture and Serenity',
        slug:             slugify('Bali Paradise 7 Days Culture Serenity', '001'),
        description:      'Immerse yourself in Balis spiritual heart.',
        shortDescription: '7 days exploring Bali culture, temples, and beaches',
        destination:      { city: 'Bali', country: 'Indonesia', region: 'Southeast Asia' },
        duration:         { days: 7, nights: 6 },
        packageType:      'Cultural',
        pricing:          { perPerson: 1299, originalPrice: 1599, currency: 'USD' },
        groupSize:        { min: 1, max: 20 },
        difficulty:       'Easy',
        includes:         { flights: true, accommodation: true, meals: 'Breakfast', transfers: true, guide: true, insurance: false, activities: ['Temple Tours', 'Rice Terrace Trek'] },
        highlights:       ['Tanah Lot Temple at Sunset', 'Ubud Monkey Forest', 'Traditional Cooking Class', 'Rice Terrace Trek', 'Balinese Spa Day'],
        coverImage:       { url: P[0] },
        images:           [{ url: P[0] }, { url: P[1] }],
        tags:             ['Bali', 'Culture', 'Beach', 'Temples', 'Yoga'],
        isFeatured: true, isBestSeller: true, isActive: true,
        ratings:          { overall: 4.8, reviewCount: 234 },
        bookingCount:     1240,
        createdBy:        admin._id,
        itinerary: [
          { day: 1, title: 'Arrival in Denpasar', description: 'Arrive and settle in', activities: ['Airport pickup', 'Hotel check-in', 'Beach sunset'], meals: { breakfast: false, lunch: false, dinner: true },  accommodation: 'Seminyak Resort',    transport: 'Private transfer' },
          { day: 2, title: 'Ubud Cultural Day',   description: 'Cultural exploration',  activities: ['Rice Terraces', 'Monkey Forest', 'Art Market'],      meals: { breakfast: true,  lunch: true,  dinner: false }, accommodation: 'Ubud Jungle Villa', transport: 'Private driver' },
        ],
      },
      {
        title:            'Maldives Honeymoon Dream: 5 Nights Overwater',
        slug:             slugify('Maldives Honeymoon Dream 5 Nights Overwater', '002'),
        description:      'The ultimate romantic escape in overwater bungalows.',
        shortDescription: '5 nights in overwater villas with all romantic inclusions',
        destination:      { city: 'Maldives', country: 'Maldives', region: 'Indian Ocean' },
        duration:         { days: 6, nights: 5 },
        packageType:      'Honeymoon',
        pricing:          { perPerson: 2899, originalPrice: 3499, currency: 'USD' },
        groupSize:        { min: 2, max: 2 },
        difficulty:       'Easy',
        includes:         { flights: true, accommodation: true, meals: 'All Inclusive', transfers: true, guide: false, insurance: true, activities: ['Snorkeling', 'Dolphin Cruise'] },
        highlights:       ['Overwater Bungalow', 'Private Snorkeling', 'Sunset Dolphin Cruise', 'Underwater Dining', 'Couples Spa'],
        coverImage:       { url: P[1] },
        images:           [{ url: P[1] }, { url: P[3] }],
        tags:             ['Maldives', 'Honeymoon', 'Overwater', 'All Inclusive', 'Romance'],
        isFeatured: true, isBestSeller: true, isActive: true,
        ratings:          { overall: 4.9, reviewCount: 189 },
        bookingCount:     892,
        createdBy:        admin._id,
        itinerary:        [],
      },
      {
        title:            'Japan Cherry Blossom Tour: 10 Days',
        slug:             slugify('Japan Cherry Blossom Tour 10 Days', '003'),
        description:      'Chase the sakura across Japans most iconic cities.',
        shortDescription: 'Tokyo, Kyoto and Osaka during cherry blossom season',
        destination:      { city: 'Tokyo', country: 'Japan', region: 'East Asia' },
        duration:         { days: 10, nights: 9 },
        packageType:      'Cultural',
        pricing:          { perPerson: 2199, originalPrice: 2799, currency: 'USD' },
        groupSize:        { min: 1, max: 15 },
        difficulty:       'Easy',
        includes:         { flights: true, accommodation: true, meals: 'Breakfast', transfers: true, guide: true, insurance: false, activities: ['Bullet Train Pass', 'Temple Tours'] },
        highlights:       ['Ueno Park Cherry Blossoms', 'Mount Fuji Day Trip', 'Arashiyama Bamboo Grove', 'Fushimi Inari Shrine', 'Osaka Street Food Tour'],
        coverImage:       { url: P[2] },
        images:           [{ url: P[2] }, { url: P[4] }],
        tags:             ['Japan', 'Cherry Blossom', 'Tokyo', 'Kyoto', 'Cultural'],
        isFeatured: true, isBestSeller: false, isActive: true,
        ratings:          { overall: 4.8, reviewCount: 312 },
        bookingCount:     1567,
        createdBy:        admin._id,
        itinerary:        [],
      },
      {
        title:            'Greek Islands Odyssey: 8 Days',
        slug:             slugify('Greek Islands Odyssey 8 Days', '004'),
        description:      'Sail the legendary Aegean between Santorini, Mykonos, and Athens.',
        shortDescription: 'Santorini, Mykonos and Athens — 8 days of Greek perfection',
        destination:      { city: 'Santorini', country: 'Greece', region: 'Mediterranean' },
        duration:         { days: 8, nights: 7 },
        packageType:      'Beach',
        pricing:          { perPerson: 1799, originalPrice: 2299, currency: 'USD' },
        groupSize:        { min: 2, max: 16 },
        difficulty:       'Easy',
        includes:         { flights: true, accommodation: true, meals: 'Breakfast', transfers: true, guide: false, insurance: false, activities: ['Island Ferry', 'Wine Tasting'] },
        highlights:       ['Santorini Sunset', 'Mykonos Party Beach', 'Acropolis and Parthenon', 'Island Ferry Hopping', 'Wine Tasting Tour'],
        coverImage:       { url: P[3] },
        images:           [{ url: P[3] }, { url: P[5] }],
        tags:             ['Greece', 'Islands', 'Beach', 'Mediterranean', 'Romance'],
        isFeatured: true, isBestSeller: false, isActive: true,
        ratings:          { overall: 4.7, reviewCount: 245 },
        bookingCount:     1089,
        createdBy:        admin._id,
        itinerary:        [],
      },
      {
        title:            'Morocco Magic: Desert and Medina 6 Days',
        slug:             slugify('Morocco Magic Desert Medina 6 Days', '005'),
        description:      'From the medinas of Marrakech to a night under the Sahara stars.',
        shortDescription: 'Marrakech, Sahara Desert and Fes — 6 days of exotic wonder',
        destination:      { city: 'Marrakech', country: 'Morocco', region: 'North Africa' },
        duration:         { days: 6, nights: 5 },
        packageType:      'Adventure',
        pricing:          { perPerson: 999, originalPrice: 1299, currency: 'USD' },
        groupSize:        { min: 2, max: 12 },
        difficulty:       'Moderate',
        includes:         { flights: false, accommodation: true, meals: 'Half Board', transfers: true, guide: true, insurance: false, activities: ['Camel Trek', 'Desert Camp'] },
        highlights:       ['Sahara Camel Trek', 'Starry Desert Night', 'Jemaa el-Fnaa Square', 'Atlas Mountain Drive', 'Moroccan Hammam'],
        coverImage:       { url: P[4] },
        images:           [{ url: P[4] }, { url: P[0] }],
        tags:             ['Morocco', 'Desert', 'Sahara', 'Cultural', 'Adventure'],
        isFeatured: false, isBestSeller: false, isActive: true,
        ratings:          { overall: 4.6, reviewCount: 178 },
        bookingCount:     723,
        createdBy:        admin._id,
        itinerary:        [],
      },
      {
        title:            'Safari and Victoria Falls: 9 Days Southern Africa',
        slug:             slugify('Safari Victoria Falls 9 Days Southern Africa', '006'),
        description:      'Witness the Big Five on Kruger safaris and marvel at Victoria Falls.',
        shortDescription: 'Big Five safari, Victoria Falls and Chobe River — 9 epic days',
        destination:      { city: 'Cape Town', country: 'South Africa', region: 'Africa' },
        duration:         { days: 9, nights: 8 },
        packageType:      'Wildlife',
        pricing:          { perPerson: 3299, originalPrice: 3999, currency: 'USD' },
        groupSize:        { min: 2, max: 10 },
        difficulty:       'Moderate',
        includes:         { flights: true, accommodation: true, meals: 'Full Board', transfers: true, guide: true, insurance: true, activities: ['Game Drives', 'Helicopter Tour'] },
        highlights:       ['Big Five Game Drives', 'Victoria Falls Helicopter', 'Chobe River Sunset Cruise', 'Cape Town City Tour', 'Cape of Good Hope'],
        coverImage:       { url: P[5] },
        images:           [{ url: P[5] }, { url: P[2] }],
        tags:             ['Safari', 'Africa', 'Wildlife', 'Victoria Falls', 'Adventure'],
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
      'The staff were incredibly attentive and the facilities were world-class. The location was perfect and the views absolutely breathtaking. Will definitely return!',
      'From the moment we arrived everything was flawless. The room was immaculate, the food outstanding, and the team went above and beyond.',
      'A truly memorable experience. The property is stunning and the surrounding area offers so much to explore.',
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
    console.log('║    Email    : alice@example.com           ║');
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