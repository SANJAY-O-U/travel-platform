// ============================================================
// Admin Controller - Dashboard Analytics & Management
// ============================================================
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const TravelPackage = require('../models/TravelPackage');
const Review = require('../models/Review');
const asyncHandler = require('express-async-handler');

// ─── @GET /api/admin/dashboard ───────────────────────────────
const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalHotels,
    totalBookings,
    totalFlights,
    totalPackages,
    recentBookings,
    revenueStats,
    userGrowth,
    topHotels,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Hotel.countDocuments({ isActive: true }),
    Booking.countDocuments(),
    Flight.countDocuments({ isActive: true }),
    TravelPackage.countDocuments({ isActive: true }),

    Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .populate('hotel', 'name'),

    Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$pricing.totalAmount' },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),

    User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          newUsers: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),

    Hotel.find({ isActive: true })
      .sort({ totalBookings: -1 })
      .limit(5)
      .select('name location coverImage totalBookings totalRevenue ratings'),
  ]);

  // Calculate total revenue
  const revenueResult = await Booking.aggregate([
    { $match: { 'payment.status': 'paid' } },
    { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } },
  ]);

  const totalRevenue = revenueResult[0]?.total || 0;

  // Booking status breakdown
  const bookingsByStatus = await Booking.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalHotels,
      totalBookings,
      totalFlights,
      totalPackages,
      totalRevenue,
    },
    recentBookings,
    revenueStats,
    userGrowth,
    topHotels,
    bookingsByStatus,
  });
});

// ─── @GET /api/admin/users ───────────────────────────────────
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-password'),
    User.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, users, total, pages: Math.ceil(total / limit) });
});

// ─── @PATCH /api/admin/users/:id ────────────────────────────
const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive, role } = req.body;
  const update = {};
  if (isActive !== undefined) update.isActive = isActive;
  if (role) update.role = role;

  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
  if (!user) { res.status(404); throw new Error('User not found'); }

  res.status(200).json({ success: true, message: 'User updated', user });
});

module.exports = { getDashboard, getAllUsers, updateUserStatus };
