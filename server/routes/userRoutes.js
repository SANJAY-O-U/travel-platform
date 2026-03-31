// server/routes/userRoutes.js
const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// GET /api/users/wishlist
router.get('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'wishlist',
      'name slug location coverImage ratings priceRange starRating propertyType'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, wishlist: user.wishlist || [] });
  } catch (err) {
    console.error('Wishlist fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to load wishlist' });
  }
});

// GET /api/users/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const [user, bookingCount] = await Promise.all([
      User.findById(req.user._id).select('-password'),
      Booking.countDocuments({ user: req.user._id }),
    ]);
    res.json({
      success: true,
      stats: {
        wishlistCount: user?.wishlist?.length || 0,
        bookingCount,
        memberSince: user?.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;