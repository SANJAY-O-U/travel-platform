// ============================================================
// Review Model - MongoDB Schema
// ============================================================
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    title: {
      type: String,
      required: [true, 'Review title is required'],
      maxlength: 100,
    },
    review: {
      type: String,
      required: [true, 'Review content is required'],
      maxlength: 1000,
    },
    ratings: {
      overall: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      cleanliness: { type: Number, min: 1, max: 5 },
      location: { type: Number, min: 1, max: 5 },
      service: { type: Number, min: 1, max: 5 },
      valueForMoney: { type: Number, min: 1, max: 5 },
      facilities: { type: Number, min: 1, max: 5 },
    },
    // Trip type
    tripType: {
      type: String,
      enum: ['Business', 'Leisure', 'Family', 'Romantic', 'Solo', 'Group'],
    },
    stayDuration: String, // "3 nights"
    // Photos attached to review
    photos: [
      {
        public_id: String,
        url: String,
      },
    ],
    // Helpful votes
    helpfulVotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Management response
    managementResponse: {
      response: String,
      respondedAt: Date,
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// One review per user per hotel
reviewSchema.index({ user: 1, hotel: 1 }, { unique: true });
reviewSchema.index({ hotel: 1, createdAt: -1 });

// ─── Post-save: Update Hotel Rating ─────────────────────────
reviewSchema.post('save', async function () {
  await updateHotelRating(this.hotel);
});

reviewSchema.post('remove', async function () {
  await updateHotelRating(this.hotel);
});

async function updateHotelRating(hotelId) {
  const Review = mongoose.model('Review');
  const Hotel = mongoose.model('Hotel');

  const stats = await Review.aggregate([
    { $match: { hotel: hotelId, isActive: true } },
    {
      $group: {
        _id: '$hotel',
        avgOverall: { $avg: '$ratings.overall' },
        avgCleanliness: { $avg: '$ratings.cleanliness' },
        avgLocation: { $avg: '$ratings.location' },
        avgService: { $avg: '$ratings.service' },
        avgValue: { $avg: '$ratings.valueForMoney' },
        avgFacilities: { $avg: '$ratings.facilities' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Hotel.findByIdAndUpdate(hotelId, {
      'ratings.overall': Math.round(stats[0].avgOverall * 10) / 10,
      'ratings.cleanliness': Math.round(stats[0].avgCleanliness * 10) / 10,
      'ratings.location': Math.round(stats[0].avgLocation * 10) / 10,
      'ratings.service': Math.round(stats[0].avgService * 10) / 10,
      'ratings.valueForMoney': Math.round(stats[0].avgValue * 10) / 10,
      'ratings.facilities': Math.round(stats[0].avgFacilities * 10) / 10,
      reviewCount: stats[0].count,
    });
  } else {
    await Hotel.findByIdAndUpdate(hotelId, {
      'ratings.overall': 0,
      reviewCount: 0,
    });
  }
}

module.exports = mongoose.model('Review', reviewSchema);