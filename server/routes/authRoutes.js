// server/routes/authRoutes.js
const express  = require('express');
const router   = express.Router();
const { protect } = require('../middleware/auth');

// Import controller
const authController = require('../controllers/authController');

// Debug — log what was imported
console.log('Auth Controller exports:', Object.keys(authController));

const {
  register,
  login,
  adminLogin,
  getMe,
  updateProfile,
  changePassword,
  toggleWishlist,
  googleTokenLogin,
} = authController;

// Verify each function exists before registering routes
if (typeof register       !== 'function') console.error('❌ register is not a function');
if (typeof login          !== 'function') console.error('❌ login is not a function');
if (typeof adminLogin     !== 'function') console.error('❌ adminLogin is not a function');
if (typeof getMe          !== 'function') console.error('❌ getMe is not a function');
if (typeof updateProfile  !== 'function') console.error('❌ updateProfile is not a function');
if (typeof changePassword !== 'function') console.error('❌ changePassword is not a function');
if (typeof toggleWishlist !== 'function') console.error('❌ toggleWishlist is not a function');

// Public routes
router.post('/register',     register);
router.post('/login',        login);
router.post('/admin/login',  adminLogin);

// Google OAuth
router.post('/google/token', googleTokenLogin || function(req, res) {
  res.status(501).json({ success: false, message: 'Google auth not configured' });
});

// Protected routes
router.get('/me',                 protect, getMe);
router.put('/profile',            protect, updateProfile);
router.put('/change-password',    protect, changePassword);
router.post('/wishlist/:hotelId', protect, toggleWishlist);

module.exports = router;