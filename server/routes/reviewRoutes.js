// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const { getHotelReviews, createReview, voteHelpful, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
router.get('/hotel/:hotelId', getHotelReviews);
router.post('/hotel/:hotelId', protect, createReview);
router.post('/:id/helpful', protect, voteHelpful);
router.delete('/:id', protect, deleteReview);
module.exports = router;