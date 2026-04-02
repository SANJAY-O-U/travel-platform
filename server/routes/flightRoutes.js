// routes/flightRoutes.js
const express = require('express');
const router = express.Router();
const { searchFlights, getPopularRoutes, createFlight, updateFlight, deleteFlight } = require('../controllers/flightController');
const { protect, adminOnly } = require('../middleware/auth');
router.get('/', searchFlights);
router.get('/popular-routes', getPopularRoutes);
router.post('/', protect, adminOnly, createFlight);
router.put('/:id', protect, adminOnly, updateFlight);
router.delete('/:id', protect, adminOnly, deleteFlight);
module.exports = router;
