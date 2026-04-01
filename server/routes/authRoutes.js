// server/routes/authRoutes.js
const express = require('express');
const router  = express.Router();
const {
  register,
  login,
  adminLogin,
  getMe,
  updateProfile,
  changePassword,
  toggleWishlist,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register',              register);
router.post('/login',                 login);
router.post('/admin/login',           adminLogin);
router.get('/me',           protect,  getMe);
router.put('/profile',      protect,  updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/wishlist/:hotelId', protect, toggleWishlist);

// Password reset (no auth required)
router.post('/forgot-password',        forgotPassword);
router.put('/reset-password/:token',   resetPassword);

module.exports = router;