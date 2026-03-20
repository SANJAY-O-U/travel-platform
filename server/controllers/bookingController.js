// ============================================================
// Booking Controller - Full Booking Lifecycle Management
// ============================================================
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const Flight = require('../models/Flight');
const TravelPackage = require('../models/TravelPackage');
const asyncHandler = require('express-async-handler');

// ─── @POST /api/bookings ─────────────────────────────────────
// Create a new booking


  // Create booking
  // server/controllers/bookingController.js
// Replace createBooking with this version

const createBooking = asyncHandler(async function(req, res) {
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

  // Validate hotel booking
  if (bookingType === 'hotel') {
    if (!hotelId) {
      res.status(400);
      throw new Error('Hotel ID is required');
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      res.status(404);
      throw new Error('Hotel not found');
    }

    if (checkIn && checkOut) {
      const checkInDate  = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      if (checkInDate >= checkOutDate) {
        res.status(400);
        throw new Error('Check-out must be after check-in');
      }
    }
  }

  if (bookingType === 'flight' && !flightId) {
    res.status(400);
    throw new Error('Flight ID is required');
  }

  if (bookingType === 'package' && !packageId) {
    res.status(400);
    throw new Error('Package ID is required');
  }

  // Build booking object
  const bookingData = {
    bookingType,
    user:    req.user._id,
    guests:  guests || { adults: 1, children: 0, infants: 0 },
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
    status:          'confirmed',
    payment: {
      method: 'stripe',
      status: 'paid',
      paidAt: new Date(),
    },
  };

  if (bookingType === 'hotel') {
    bookingData.hotel    = hotelId;
    bookingData.checkIn  = checkIn  ? new Date(checkIn)  : undefined;
    bookingData.checkOut = checkOut ? new Date(checkOut) : undefined;
    if (room) bookingData.room = room;
  }

  if (bookingType === 'flight')  bookingData.flight  = flightId;
  if (bookingType === 'package') bookingData.package = packageId;

  const booking = await Booking.create(bookingData);

  // Update stats
  if (bookingType === 'hotel' && hotelId) {
    await Hotel.findByIdAndUpdate(hotelId, {
      $inc: {
        totalBookings: 1,
        totalRevenue:  pricing?.totalAmount || 0,
      },
    });
  }

  if (bookingType === 'package' && packageId) {
    const TravelPackage = require('../models/TravelPackage');
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
// ─── @GET /api/bookings/my ───────────────────────────────────
// Get current user's bookings
const getMyBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const filter = { user: req.user._id };
  if (status) filter.status = status;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('hotel', 'name location coverImage')
      .populate('flight', 'flightNumber airline origin destination departureTime')
      .populate('package', 'title destination coverImage duration'),
    Booking.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    bookings,
    total,
    pages: Math.ceil(total / limit),
    currentPage: Number(page),
  });
});

// ─── @GET /api/bookings/:id ──────────────────────────────────
// Get single booking by ID
const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('hotel', 'name location coverImage contact policies')
    .populate('flight')
    .populate('package')
    .populate('user', 'name email phone');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Only allow access to own bookings (or admin)
  if (
    booking.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to view this booking');
  }

  res.status(200).json({
    success: true,
    booking,
  });
});

// ─── @PUT /api/bookings/:id/cancel ──────────────────────────
// Cancel a booking
const cancelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Only allow owner or admin
  if (
    booking.user.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to cancel this booking');
  }

  // Check if already cancelled
  if (booking.status === 'cancelled') {
    res.status(400);
    throw new Error('Booking is already cancelled');
  }

  // Check if cancellation is too late (within 24hrs for demo)
  if (booking.checkIn) {
    const hoursUntilCheckIn = (booking.checkIn - new Date()) / (1000 * 60 * 60);
    if (hoursUntilCheckIn < 24 && req.user.role !== 'admin') {
      res.status(400);
      throw new Error('Cannot cancel booking within 24 hours of check-in');
    }
  }

  // Calculate refund based on cancellation policy
  let refundAmount = 0;
  if (booking.checkIn) {
    const daysUntilCheckIn = Math.ceil((booking.checkIn - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilCheckIn >= 7) {
      refundAmount = booking.pricing.totalAmount * 0.9; // 90% refund
    } else if (daysUntilCheckIn >= 3) {
      refundAmount = booking.pricing.totalAmount * 0.5; // 50% refund
    }
  } else {
    refundAmount = booking.pricing.totalAmount * 0.9;
  }

  booking.status = 'cancelled';
  booking.cancellation = {
    isCancelled: true,
    cancelledAt: new Date(),
    cancelledBy: req.user._id,
    reason: reason || 'Cancelled by user',
    refundAmount,
    refundStatus: refundAmount > 0 ? 'pending' : 'not_applicable',
  };
  booking.payment.refundedAmount = refundAmount;

  await booking.save();

  res.status(200).json({
    success: true,
    message: 'Booking cancelled successfully',
    booking,
    refundAmount,
    refundMessage: refundAmount > 0
      ? `Refund of $${refundAmount.toFixed(2)} will be processed within 5-7 business days`
      : 'No refund applicable',
  });
});

// ─── @GET /api/bookings (Admin) ──────────────────────────────
// Get all bookings (Admin only)
const getAllBookings = asyncHandler(async (req, res) => {
  const { status, bookingType, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (bookingType) filter.bookingType = bookingType;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('user', 'name email')
      .populate('hotel', 'name location')
      .populate('flight', 'flightNumber airline'),
    Booking.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    bookings,
    total,
    pages: Math.ceil(total / limit),
  });
});

// ─── @GET /api/bookings/stats ────────────────────────────────
// Get booking statistics (Admin)
const getBookingStats = asyncHandler(async (req, res) => {
  const stats = await Booking.aggregate([
    {
      $facet: {
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$pricing.totalAmount' } } },
        ],
        byType: [
          { $group: { _id: '$bookingType', count: { $sum: 1 } } },
        ],
        monthly: [
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
              },
              bookings: { $sum: 1 },
              revenue: { $sum: '$pricing.totalAmount' },
            },
          },
          { $sort: { '_id.year': -1, '_id.month': -1 } },
          { $limit: 12 },
        ],
        total: [
          {
            $group: {
              _id: null,
              totalBookings: { $sum: 1 },
              totalRevenue: { $sum: '$pricing.totalAmount' },
              avgBookingValue: { $avg: '$pricing.totalAmount' },
            },
          },
        ],
      },
    },
  ]);

  res.status(200).json({
    success: true,
    stats: stats[0],
  });
});

module.exports = {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  getAllBookings,
  getBookingStats,
};