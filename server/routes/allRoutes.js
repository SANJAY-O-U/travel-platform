// ============================================================
// Flight Routes
// ============================================================
const express = require('express');
const flightRouter = express.Router();
const {
  searchFlights, getPopularRoutes, createFlight, updateFlight, deleteFlight,
} = require('../controllers/flightController');
const { protect, adminOnly } = require('../middleware/auth');

flightRouter.get('/', searchFlights);
flightRouter.get('/popular-routes', getPopularRoutes);
flightRouter.post('/', protect, adminOnly, createFlight);
flightRouter.put('/:id', protect, adminOnly, updateFlight);
flightRouter.delete('/:id', protect, adminOnly, deleteFlight);

// ============================================================
// Booking Routes
// ============================================================
const bookingRouter = express.Router();
const {
  createBooking, getMyBookings, getBooking,
  cancelBooking, getAllBookings, getBookingStats,
} = require('../controllers/bookingController');

bookingRouter.post('/', protect, createBooking);
bookingRouter.get('/my', protect, getMyBookings);
bookingRouter.get('/stats', protect, adminOnly, getBookingStats);
bookingRouter.get('/all', protect, adminOnly, getAllBookings);
bookingRouter.get('/:id', protect, getBooking);
bookingRouter.put('/:id/cancel', protect, cancelBooking);

// ============================================================
// Package Routes
// ============================================================
const packageRouter = express.Router();
const {
  getPackages, getFeaturedPackages, getPackage,
  createPackage, updatePackage, deletePackage,
} = require('../controllers/packageController');

packageRouter.get('/', getPackages);
packageRouter.get('/featured', getFeaturedPackages);
packageRouter.get('/:id', getPackage);
packageRouter.post('/', protect, adminOnly, createPackage);
packageRouter.put('/:id', protect, adminOnly, updatePackage);
packageRouter.delete('/:id', protect, adminOnly, deletePackage);

// ============================================================
// Review Routes
// ============================================================
const reviewRouter = express.Router();
const {
  getHotelReviews, createReview, voteHelpful, deleteReview,
} = require('../controllers/reviewController');

reviewRouter.get('/hotel/:hotelId', getHotelReviews);
reviewRouter.post('/hotel/:hotelId', protect, createReview);
reviewRouter.post('/:id/helpful', protect, voteHelpful);
reviewRouter.delete('/:id', protect, deleteReview);

// ============================================================
// User Routes
// ============================================================
const userRouter = express.Router();

userRouter.get('/wishlist', protect, async (req, res) => {
  const User = require('../models/User');
  const user = await User.findById(req.user._id).populate(
    'wishlist', 'name slug location coverImage ratings priceRange starRating'
  );
  res.json({ success: true, wishlist: user.wishlist });
});

// ============================================================
// Admin Routes
// ============================================================
const adminRouter = express.Router();
const { getDashboard, getAllUsers, updateUserStatus } = require('../controllers/adminController');

adminRouter.get('/dashboard', protect, adminOnly, getDashboard);
adminRouter.get('/users', protect, adminOnly, getAllUsers);
adminRouter.patch('/users/:id', protect, adminOnly, updateUserStatus);

// ============================================================
// Recommendation Routes
// ============================================================
const recommendationRouter = express.Router();
const Hotel = require('../models/Hotel');
const TravelPackage = require('../models/TravelPackage');
const { optionalAuth } = require('../middleware/auth');

recommendationRouter.get('/', optionalAuth, async (req, res) => {
  try {
    const { destination, budget, type } = req.query;

    // AI-like recommendation logic based on user preferences and search history
    let hotelQuery = { isActive: true };
    let packageQuery = { isActive: true };

    if (destination) {
      hotelQuery['location.city'] = { $regex: destination, $options: 'i' };
      packageQuery['destination.city'] = { $regex: destination, $options: 'i' };
    }

    if (budget) {
      const budgetMap = {
        budget: { min: 0, max: 80 },
        'mid-range': { min: 80, max: 200 },
        luxury: { min: 200, max: 500 },
        'ultra-luxury': { min: 500, max: 99999 },
      };
      const range = budgetMap[budget];
      if (range) {
        hotelQuery['priceRange.min'] = { $gte: range.min, $lte: range.max };
        packageQuery['pricing.perPerson'] = { $gte: range.min * 2, $lte: range.max * 5 };
      }
    }

    // If user is logged in, personalize based on preferences
    if (req.user) {
      const userPrefs = req.user.preferences;
      if (userPrefs?.budget) {
        // Already handled above, or merge
      }
      if (userPrefs?.preferredDestinations?.length > 0 && !destination) {
        const prefDests = userPrefs.preferredDestinations;
        hotelQuery['location.city'] = { $in: prefDests.map(d => new RegExp(d, 'i')) };
      }
    }

    const [hotels, packages, trending] = await Promise.all([
      Hotel.find(hotelQuery)
        .sort({ 'ratings.overall': -1, isFeatured: -1 })
        .limit(6)
        .select('name slug location coverImage ratings priceRange starRating propertyType'),
      TravelPackage.find(packageQuery)
        .sort({ bookingCount: -1, isFeatured: -1 })
        .limit(4)
        .select('title slug destination coverImage pricing duration packageType ratings'),
      Hotel.find({ isActive: true, isFeatured: true })
        .sort({ totalBookings: -1 })
        .limit(4)
        .select('name slug location coverImage ratings priceRange'),
    ]);

    res.json({
      success: true,
      recommendations: {
        hotels,
        packages,
        trending,
        basedOn: req.user ? 'personalized' : 'popular',
        destination: destination || null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = {
  flightRouter,
  bookingRouter,
  packageRouter,
  reviewRouter,
  userRouter,
  adminRouter,
  recommendationRouter,
};