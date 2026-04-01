// server/controllers/bookingController.js
const Booking       = require('../models/Booking');
const Hotel         = require('../models/Hotel');
const Flight        = require('../models/Flight');
const TravelPackage = require('../models/TravelPackage');
const asyncHandler  = require('express-async-handler');
const mongoose      = require('mongoose');

// @POST /api/bookings
const createBooking = asyncHandler(async (req, res) => {
  const {
    bookingType,
    hotelId,
    flightId,
    packageId,
    room,
    checkIn,
    checkOut,
    guests,
    primaryGuest,
    pricing,
    specialRequests,
    addOns,
  } = req.body;

  if (!bookingType) {
    res.status(400);
    throw new Error('Booking type is required');
  }

  if (bookingType === 'hotel') {
    if (!hotelId || !checkIn || !checkOut) {
      res.status(400);
      throw new Error('Hotel ID, check-in and check-out dates are required');
    }
    const hotel = await Hotel.findById(hotelId);
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
  }

  if (bookingType === 'flight' && !flightId) {
    res.status(400);
    throw new Error('Flight ID is required for flight bookings');
  }

  if (bookingType === 'package' && !packageId) {
    res.status(400);
    throw new Error('Package ID is required for package bookings');
  }

  const bookingData = {
    bookingType,
    user: req.user._id,
    guests:       guests      || { adults: 1, children: 0, infants: 0 },
    primaryGuest: primaryGuest || {
      name:  req.user.name,
      email: req.user.email,
      phone: req.user.phone || '',
    },
    pricing: {
      basePrice:   pricing?.basePrice   || 0,
      taxes:       pricing?.taxes       || 0,
      fees:        pricing?.fees        || 0,
      discount:    pricing?.discount    || 0,
      totalAmount: pricing?.totalAmount || 0,
      currency:    pricing?.currency    || 'USD',
    },
    specialRequests: specialRequests || '',
    addOns:          addOns          || [],
    status:  'confirmed',
    payment: {
      method: 'stripe',
      status: 'paid',
      paidAt: new Date(),
    },
  };

  if (bookingType === 'hotel') {
    bookingData.hotel    = hotelId;
    bookingData.room     = room;
    bookingData.checkIn  = new Date(checkIn);
    bookingData.checkOut = new Date(checkOut);
  }
  if (bookingType === 'flight') {
    bookingData.flight = flightId;
    if (req.body.departureDate) bookingData.departureDate = new Date(req.body.departureDate);
  }
  if (bookingType === 'package') {
    bookingData.package = packageId;
  }

  const booking = await Booking.create(bookingData);

  // Update stats using findByIdAndUpdate — never user.save()
  if (bookingType === 'hotel' && hotelId) {
    await Hotel.findByIdAndUpdate(hotelId, {
      $inc: {
        totalBookings: 1,
        totalRevenue:  pricing?.totalAmount || 0,
      },
    });
  }
  if (bookingType === 'package' && packageId) {
    await TravelPackage.findByIdAndUpdate(packageId, {
      $inc: { bookingCount: 1 },
    });
  }

  const populated = await Booking.findById(booking._id)
    .populate('hotel',   'name location coverImage contact')
    .populate('flight',  'flightNumber airline origin destination departureTime')
    .populate('package', 'title destination duration coverImage')
    .populate('user',    'name email');

  res.status(201).json({
    success: true,
    message: 'Booking confirmed successfully!',
    booking: populated,
  });
});

// @GET /api/bookings/my
const getMyBookings = asyncHandler(async (req, res) => {
  const { status, bookingType, page = 1, limit = 10 } = req.query;

  const filter = { user: req.user._id };
  if (status)      filter.status      = status;
  if (bookingType) filter.bookingType = bookingType;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('hotel',   'name location coverImage')
      .populate('flight',  'flightNumber airline origin destination departureTime')
      .populate('package', 'title destination coverImage duration'),
    Booking.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    bookings,
    total,
    pages:       Math.ceil(total / Number(limit)),
    currentPage: Number(page),
  });
});

// @GET /api/bookings/:id
const getBooking = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid booking ID');
  }

  const booking = await Booking.findById(req.params.id)
    .populate('hotel',   'name location coverImage contact policies')
    .populate('flight')
    .populate('package')
    .populate('user',    'name email phone');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (
    booking.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to view this booking');
  }

  res.status(200).json({ success: true, booking });
});

// @PUT /api/bookings/:id/cancel
const cancelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid booking ID');
  }

  const booking = await Booking.findById(req.params.id);

  if (!booking) { res.status(404); throw new Error('Booking not found'); }

  if (
    booking.user.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to cancel this booking');
  }

  if (booking.status === 'cancelled') {
    res.status(400); throw new Error('Booking is already cancelled');
  }
  if (booking.status === 'completed' || booking.status === 'checked_out') {
    res.status(400); throw new Error('Cannot cancel a completed booking');
  }

  let refundAmount  = 0;
  let refundMessage = 'No refund applicable';

  if (booking.checkIn) {
    const hoursToCheckIn = (booking.checkIn - new Date()) / (1000 * 60 * 60);
    const daysToCheckIn  = hoursToCheckIn / 24;

    if      (hoursToCheckIn < 0)   { refundAmount = 0;                                refundMessage = 'No refund — check-in date has passed'; }
    else if (daysToCheckIn  >= 7)  { refundAmount = booking.pricing.totalAmount * 0.9; refundMessage = '90% refund in 5–7 business days'; }
    else if (daysToCheckIn  >= 3)  { refundAmount = booking.pricing.totalAmount * 0.5; refundMessage = '50% refund in 5–7 business days'; }
    else if (daysToCheckIn  >= 1)  { refundAmount = booking.pricing.totalAmount * 0.25;refundMessage = '25% refund in 5–7 business days'; }
    else                            { refundAmount = 0;                                refundMessage = 'No refund — within 24 hours of check-in'; }
  } else {
    refundAmount  = booking.pricing.totalAmount * 0.9;
    refundMessage = '90% refund in 5–7 business days';
  }

  // Use findByIdAndUpdate — never booking.save() which may cascade to User
  const updated = await Booking.findByIdAndUpdate(
    req.params.id,
    {
      status: 'cancelled',
      cancellation: {
        isCancelled:  true,
        cancelledAt:  new Date(),
        cancelledBy:  req.user._id,
        reason:       reason || 'Cancelled by user',
        refundAmount: Math.round(refundAmount),
        refundStatus: refundAmount > 0 ? 'pending' : 'not_applicable',
      },
      'payment.refundedAmount': Math.round(refundAmount),
      'payment.status':         refundAmount > 0 ? 'refunded' : 'paid',
      'payment.refundedAt':     refundAmount > 0 ? new Date() : undefined,
    },
    { new: true }
  );

  res.status(200).json({
    success:      true,
    message:      'Booking cancelled successfully',
    booking:      updated,
    refundAmount: Math.round(refundAmount),
    refundMessage,
  });
});

// @GET /api/bookings/all  (Admin)
const getAllBookings = asyncHandler(async (req, res) => {
  const { status, bookingType, userId, hotelId, page = 1, limit = 20, sort = '-createdAt' } = req.query;
  const filter = {};
  if (status)      filter.status      = status;
  if (bookingType) filter.bookingType = bookingType;
  if (userId)      filter.user        = userId;
  if (hotelId)     filter.hotel       = hotelId;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('user',   'name email')
      .populate('hotel',  'name location')
      .populate('flight', 'flightNumber airline'),
    Booking.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true, bookings, total,
    pages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
  });
});

// @GET /api/bookings/stats  (Admin)
const getBookingStats = asyncHandler(async (req, res) => {
  const stats = await Booking.aggregate([
    {
      $facet: {
        byStatus: [{ $group: { _id: '$status',      count: { $sum: 1 }, revenue: { $sum: '$pricing.totalAmount' } } }],
        byType:   [{ $group: { _id: '$bookingType', count: { $sum: 1 } } }],
        totals:   [{ $group: { _id: null, totalBookings: { $sum: 1 }, totalRevenue: { $sum: '$pricing.totalAmount' }, avgBookingValue: { $avg: '$pricing.totalAmount' } } }],
      },
    },
  ]);
  res.status(200).json({ success: true, stats: stats[0] });
});

// @PATCH /api/bookings/:id/status  (Admin)
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending','confirmed','checked_in','checked_out','completed','cancelled','no_show'];
  if (!allowed.includes(status)) { res.status(400); throw new Error('Invalid booking status'); }

  const booking = await Booking.findByIdAndUpdate(
    req.params.id, { status }, { new: true, runValidators: true }
  ).populate('user', 'name email').populate('hotel', 'name');

  if (!booking) { res.status(404); throw new Error('Booking not found'); }

  res.status(200).json({ success: true, message: `Booking status updated to ${status}`, booking });
});

module.exports = {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  getAllBookings,
  getBookingStats,
  updateBookingStatus,
};