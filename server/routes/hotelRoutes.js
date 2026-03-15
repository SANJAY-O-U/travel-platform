// ============================================================
// Hotel Routes
// ============================================================
const express = require('express');
const router = express.Router();
const {
  getHotels, getFeaturedHotels, getPopularDestinations,
  getHotel, checkAvailability, createHotel, updateHotel,
  deleteHotel, getSearchSuggestions, getNearbyHotels,
} = require('../controllers/hotelController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getHotels);
router.get('/featured', getFeaturedHotels);
router.get('/destinations', getPopularDestinations);
router.get('/suggestions', getSearchSuggestions);
router.get('/nearby', getNearbyHotels);
router.get('/:id', getHotel);
router.get('/:id/availability', checkAvailability);
router.post('/', protect, adminOnly, createHotel);
router.put('/:id', protect, adminOnly, updateHotel);
router.delete('/:id', protect, adminOnly, deleteHotel);

module.exports = router;