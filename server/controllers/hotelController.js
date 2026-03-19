// server/controllers/hotelController.js
const Hotel        = require('../models/Hotel');
const Booking      = require('../models/Booking');
const asyncHandler = require('express-async-handler');

// ── @GET /api/hotels ──────────────────────────────────────────
const getHotels = asyncHandler(async (req, res) => {
  const result = await Hotel.searchHotels(req.query);
  res.status(200).json({ success: true, ...result });
});

// ── @GET /api/hotels/featured ─────────────────────────────────
const getFeaturedHotels = asyncHandler(async (req, res) => {
  const hotels = await Hotel.find({ isFeatured: true, isActive: true })
    .sort({ 'ratings.overall': -1 })
    .limit(8)
    .select('name slug location coverImage images ratings priceRange propertyType starRating isFeatured');

  res.status(200).json({ success: true, count: hotels.length, hotels });
});

// ── @GET /api/hotels/destinations ────────────────────────────
const getPopularDestinations = asyncHandler(async (req, res) => {
  const destinations = await Hotel.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id:        '$location.city',
        country:    { $first: '$location.country' },
        hotelCount: { $sum: 1 },
        avgRating:  { $avg: '$ratings.overall' },
        minPrice:   { $min: '$priceRange.min' },
        coverImage: { $first: '$coverImage' },
      },
    },
    { $sort: { hotelCount: -1 } },
    { $limit: 10 },
  ]);

  res.status(200).json({ success: true, destinations });
});

// ── @GET /api/hotels/suggestions ─────────────────────────────
const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(200).json({ success: true, suggestions: [] });
  }

  const hotels = await Hotel.find({
    isActive: true,
    $or: [
      { name:               { $regex: q, $options: 'i' } },
      { 'location.city':    { $regex: q, $options: 'i' } },
      { 'location.country': { $regex: q, $options: 'i' } },
    ],
  })
    .limit(10)
    .select('name location.city location.country');

  const citySet    = new Set();
  const suggestions = [];

  hotels.forEach((hotel) => {
    const cityKey = `${hotel.location.city}, ${hotel.location.country}`;
    if (!citySet.has(cityKey)) {
      citySet.add(cityKey);
      suggestions.push({
        type:    'destination',
        label:   cityKey,
        city:    hotel.location.city,
        country: hotel.location.country,
      });
    }
  });

  res.status(200).json({ success: true, suggestions });
});

// ── @GET /api/hotels/nearby ───────────────────────────────────
const getNearbyHotels = asyncHandler(async (req, res) => {
  const { longitude, latitude, maxDistance = 10000 } = req.query;

  if (!longitude || !latitude) {
    res.status(400);
    throw new Error('Please provide longitude and latitude');
  }

  const hotels = await Hotel.find({
    isActive: true,
    'location.coordinates': {
      $near: {
        $geometry: {
          type:        'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        $maxDistance: parseInt(maxDistance),
      },
    },
  })
    .limit(10)
    .select('name location coverImage ratings priceRange');

  res.status(200).json({ success: true, count: hotels.length, hotels });
});

// ── @GET /api/hotels/:id ──────────────────────────────────────
const getHotel = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let hotel = null;

  // 1. Try by MongoDB ObjectId
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    hotel = await Hotel.findOne({ _id: id, isActive: true }).populate({
      path:     'reviews',
      match:    { isActive: true },
      options:  { sort: { createdAt: -1 }, limit: 10 },
      populate: { path: 'user', select: 'name avatar' },
    });
  }

  // 2. Try by slug
  if (!hotel) {
    hotel = await Hotel.findOne({ slug: id, isActive: true }).populate({
      path:     'reviews',
      match:    { isActive: true },
      options:  { sort: { createdAt: -1 }, limit: 10 },
      populate: { path: 'user', select: 'name avatar' },
    });
  }

  // 3. Try partial name match
  if (!hotel) {
    hotel = await Hotel.findOne({
      name:     { $regex: id.replace(/-\d+$/, '').replace(/-/g, ' '), $options: 'i' },
      isActive: true,
    }).populate({
      path:     'reviews',
      match:    { isActive: true },
      options:  { sort: { createdAt: -1 }, limit: 10 },
      populate: { path: 'user', select: 'name avatar' },
    });
  }

  if (!hotel) {
    res.status(404);
    throw new Error(`Hotel not found with id: ${id}`);
  }

  res.status(200).json({ success: true, hotel });
});

// ── @GET /api/hotels/:id/availability ────────────────────────
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

  const checkInDate  = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (checkInDate >= checkOutDate) {
    res.status(400);
    throw new Error('Check-out must be after check-in');
  }

  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

  // Get existing bookings for date range
  const existingBookings = await Booking.find({
    hotel:  req.params.id,
    status: { $in: ['confirmed', 'checked_in'] },
    $or:    [{ checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }],
  });

  const availableRooms = hotel.rooms.map((room) => {
    const bookedCount = existingBookings.filter(
      (b) => b.room && b.room.roomType === room.roomType
    ).length;

    const availableCount = Math.max(0, (room.totalRooms || 1) - bookedCount);

    return {
      ...room.toObject(),
      availableCount,
      isAvailable: availableCount > 0,
      totalPrice:  room.pricePerNight * nights,
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

// ── @POST /api/hotels ─────────────────────────────────────────
const createHotel = asyncHandler(async (req, res) => {
  req.body.owner = req.user._id;

  // Auto-generate slug if not provided
  if (!req.body.slug && req.body.name) {
    req.body.slug =
      req.body.name
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() +
      '-' + Date.now();
  }

  const hotel = await Hotel.create(req.body);
  res.status(201).json({ success: true, message: 'Hotel created successfully', hotel });
});

// ── @PUT /api/hotels/:id ──────────────────────────────────────
const updateHotel = asyncHandler(async (req, res) => {
  let hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    res.status(404);
    throw new Error('Hotel not found');
  }

  hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
    new:           true,
    runValidators: true,
  });

  res.status(200).json({ success: true, message: 'Hotel updated successfully', hotel });
});

// ── @DELETE /api/hotels/:id ───────────────────────────────────
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

  res.status(200).json({ success: true, message: 'Hotel removed successfully' });
});

// ── @GET /api/hotels/search/nearby ───────────────────────────
const searchByLocation = asyncHandler(async (req, res) => {
  const { city, country } = req.query;

  const query = { isActive: true };
  if (city)    query['location.city']    = { $regex: city,    $options: 'i' };
  if (country) query['location.country'] = { $regex: country, $options: 'i' };

  const hotels = await Hotel.find(query)
    .sort({ 'ratings.overall': -1 })
    .limit(12)
    .select('name slug location coverImage ratings priceRange starRating propertyType');

  res.status(200).json({ success: true, count: hotels.length, hotels });
});

// ── EXPORTS ───────────────────────────────────────────────────
// ✅ ALL functions exported — this was the root cause of the error
module.exports = {
  getHotels,
  getFeaturedHotels,
  getPopularDestinations,
  getSearchSuggestions,
  getNearbyHotels,
  getHotel,
  checkAvailability,
  createHotel,
  updateHotel,
  deleteHotel,
  searchByLocation,
};