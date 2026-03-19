// server/routes/hotelRoutes.js
// ✅ CRITICAL: specific routes MUST come before /:id
const express = require('express');
const router  = express.Router();
const {
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
} = require('../controllers/hotelController');
const { protect, adminOnly } = require('../middleware/auth');

// ✅ Specific named routes FIRST — before /:id
router.get('/featured',         getFeaturedHotels);
router.get('/destinations',     getPopularDestinations);
router.get('/suggestions',      getSearchSuggestions);
router.get('/nearby',           getNearbyHotels);

// ✅ Dynamic routes LAST
router.get('/',                 getHotels);
router.get('/:id',              getHotel);
router.get('/:id/availability', checkAvailability);

router.post('/',    protect, adminOnly, createHotel);
router.put('/:id',  protect, adminOnly, updateHotel);
router.delete('/:id', protect, adminOnly, deleteHotel);

module.exports = router;