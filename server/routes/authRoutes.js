// ============================================================
// Auth Routes
// ============================================================
const express = require('express');
const router = express.Router();
const {
  register, login, getMe, updateProfile,
  changePassword, toggleWishlist, adminLogin,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post("/register", register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/wishlist/:hotelId', protect, toggleWishlist);

module.exports = router;