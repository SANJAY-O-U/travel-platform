// ============================================================
// Review Controller
// ============================================================
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const asyncHandler = require('express-async-handler');

const getHotelReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = 'newest' } = req.query;

  let sortOption = {};
  if (sort === 'newest') sortOption = { createdAt: -1 };
  else if (sort === 'highest') sortOption = { 'ratings.overall': -1 };
  else if (sort === 'lowest') sortOption = { 'ratings.overall': 1 };
  else if (sort === 'helpful') sortOption = { helpfulVotes: -1 };

  const [reviews, total] = await Promise.all([
    Review.find({ hotel: req.params.hotelId, isActive: true })
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('user', 'name avatar'),
    Review.countDocuments({ hotel: req.params.hotelId, isActive: true }),
  ]);

  res.status(200).json({ success: true, reviews, total, pages: Math.ceil(total / limit) });
});

const createReview = asyncHandler(async (req, res) => {
  req.body.user = req.user._id;
  req.body.hotel = req.params.hotelId;

  // Check if user already reviewed
  const existing = await Review.findOne({ user: req.user._id, hotel: req.params.hotelId });
  if (existing) {
    res.status(400);
    throw new Error('You have already reviewed this hotel');
  }

  // Verify user stayed at this hotel
  const booking = await Booking.findOne({
    user: req.user._id,
    hotel: req.params.hotelId,
    status: { $in: ['completed', 'checked_out'] },
  });

  req.body.isVerified = !!booking;
  if (booking) req.body.booking = booking._id;

  const review = await Review.create(req.body);
  const populated = await Review.findById(review._id).populate('user', 'name avatar');

  res.status(201).json({ success: true, message: 'Review submitted!', review: populated });
});

const voteHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error('Review not found'); }

  const idx = review.helpfulVotes.indexOf(req.user._id);
  if (idx > -1) {
    review.helpfulVotes.splice(idx, 1);
  } else {
    review.helpfulVotes.push(req.user._id);
  }
  await review.save();

  res.status(200).json({ success: true, helpfulCount: review.helpfulVotes.length });
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error('Review not found'); }

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }

  review.isActive = false;
  await review.save();

  res.status(200).json({ success: true, message: 'Review deleted' });
});

module.exports = { getHotelReviews, createReview, voteHelpful, deleteReview };