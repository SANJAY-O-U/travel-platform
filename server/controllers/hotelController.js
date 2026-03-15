// ============================================================
// Hotel Controller - Full CRUD + Search + Filtering
// ============================================================
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const asyncHandler = require('express-async-handler');

// ─── @GET /api/hotels ─────────────────────────────────────── 
// Get all hotels with filtering, sorting, pagination
const getHotels = asyncHandler(async (req, res) => {
  const result = await Hotel.searchHotels(req.query);

  res.status(200).json({
    success: true,
    ...result,
  });
});

// ─── @GET /api/hotels/featured ────────────────────────────── 
// Get featured hotels for homepage
const getFeaturedHotels = asyncHandler(async (req, res) => {
  const hotels = await Hotel.find({ isFeatured: true, isActive: true })
    .sort({ 'ratings.overall': -1 })
    .limit(8)
    .select('name slug location coverImage images ratings priceRange propertyType starRating');

  res.status(200).json({
    success: true,
    count: hotels.length,
    hotels,
  });
});

// ─── @GET /api/hotels/destinations ────────────────────────── 
// Get popular destinations
const getPopularDestinations = asyncHandler(async (req, res) => {
  const destinations = await Hotel.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$location.city',
        country: { $first: '$location.country' },
        hotelCount: { $sum: 1 },
        avgRating: { $avg: '$ratings.overall' },
        minPrice: { $min: '$priceRange.min' },
        coverImage: { $first: '$coverImage' },
      },
    },
    { $sort: { hotelCount: -1 } },
    { $limit: 10 },
  ]);

  res.status(200).json({
    success: true,
    destinations,
  });
});

// ─── @GET /api/hotels/:id ─────────────────────────────────── 
// Get single hotel by ID or slug
const getHotel = asyncHandler(async (req, res) => {
  const query = req.params.id.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: req.params.id }
    : { slug: req.params.id };

  const hotel = await Hotel.findOne({ ...query, isActive: true })
    .populate({
      path: 'reviews',
      match: { isActive: true },
      options: { sort: { createdAt: -1 }, limit: 10 },
      populate: { path: 'user', select: 'name avatar' },
    });

  if (!hotel) {
    res.status(404);
    throw new Error('Hotel not found');
  }

  res.status(200).json({
    success: true,
    hotel,
  });
});

// ─── @GET /api/hotels/:id/availability ────────────────────── 
// Check room availability for given dates
const checkAvailability = asyncHandler(async (req, res) => {
  const { checkIn, checkOut, guests } = req.query;

  if (!checkIn || !checkOut) {
    res.status(400);
    throw new Error('Please provide check-in and check-out dates');
  }

  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) {
    res.status(404);
    throw new Error('Hotel not found');
  }

  // Get confirmed bookings for the date range
  const existingBookings = await Booking.getOccupiedRooms(
    req.params.id,
    new Date(checkIn),
    new Date(checkOut)
  );

  // Calculate nights
  const nights = Math.ceil(
    (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
  );

  // Filter available rooms
  const availableRooms = hotel.rooms.map((room) => {
    const bookedCount = existingBookings.filter(
      (b) => b.room && b.room.roomType === room.roomType
    ).length;

    return {
      ...room.toObject(),
      availableCount: Math.max(0, room.totalRooms - bookedCount),
      totalPrice: room.pricePerNight * nights,
      nights,
    };
  });

  res.status(200).json({
    success: true,
    checkIn,
    checkOut,
    nights,
    availableRooms,
  });
});

// ─── @POST /api/hotels ────────────────────────────────────── 
// Create new hotel (Admin only)
const createHotel = asyncHandler(async (req, res) => {
  req.body.owner = req.user._id;

  const hotel = await Hotel.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Hotel created successfully',
    hotel,
  });
});

// ─── @PUT /api/hotels/:id ─────────────────────────────────── 
// Update hotel (Admin only)
const updateHotel = asyncHandler(async (req, res) => {
  let hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    res.status(404);
    throw new Error('Hotel not found');
  }

  hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Hotel updated successfully',
    hotel,
  });
});

// ─── @DELETE /api/hotels/:id ──────────────────────────────── 
// Delete hotel (Admin only) - soft delete
const deleteHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!hotel) {
    res.status(404);
    throw new Error('Hotel not found');
  }

  res.status(200).json({
    success: true,
    message: 'Hotel removed successfully',
  });
});

// ─── @GET /api/hotels/search/suggestions ──────────────────── 
// Auto-complete search suggestions
const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.length < 2) {
    return res.status(200).json({ success: true, suggestions: [] });
  }

  const hotels = await Hotel.find({
    isActive: true,
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { 'location.city': { $regex: q, $options: 'i' } },
      { 'location.country': { $regex: q, $options: 'i' } },
    ],
  })
    .limit(8)
    .select('name location.city location.country');

  // Build suggestion list
  const citySet = new Set();
  const suggestions = [];

  hotels.forEach((hotel) => {
    const cityKey = `${hotel.location.city}, ${hotel.location.country}`;
    if (!citySet.has(cityKey)) {
      citySet.add(cityKey);
      suggestions.push({
        type: 'destination',
        label: cityKey,
        city: hotel.location.city,
        country: hotel.location.country,
      });
    }
  });

  res.status(200).json({
    success: true,
    suggestions,
  });
});

// ─── @GET /api/hotels/nearby ──────────────────────────────── 
// Get hotels near a location
const getNearbyHotels = asyncHandler(async (req, res) => {
  const { longitude, latitude, maxDistance = 10000 } = req.query; // distance in meters

  if (!longitude || !latitude) {
    res.status(400);
    throw new Error('Please provide longitude and latitude');
  }

  const hotels = await Hotel.find({
    isActive: true,
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        $maxDistance: parseInt(maxDistance),
      },
    },
  })
    .limit(10)
    .select('name location coverImage ratings priceRange');

  res.status(200).json({
    success: true,
    count: hotels.length,
    hotels,
  });
});

module.exports = {
  getHotels,
  getFeaturedHotels,
  getPopularDestinations,
  getHotel,
  checkAvailability,
  createHotel,
  updateHotel,
  deleteHotel,
  getSearchSuggestions,
  getNearbyHotels,
};