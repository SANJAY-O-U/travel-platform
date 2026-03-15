// ============================================================
// Booking Model - MongoDB Schema
// ============================================================
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    // Booking reference number
    bookingRef: {
      type: String,
      unique: true,
    },
    // Type of booking
    bookingType: {
      type: String,
      required: true,
      enum: ['hotel', 'flight', 'package'],
    },
    // User who made the booking
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Hotel booking details
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
    },
    room: {
      roomType: String,
      pricePerNight: Number,
      bedType: String,
      maxGuests: Number,
    },
    // Flight booking details
    flight: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flight',
    },
    // Package booking details
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TravelPackage',
    },
    // Guest information
    guests: {
      adults: {
        type: Number,
        default: 1,
        min: 1,
      },
      children: {
        type: Number,
        default: 0,
      },
      infants: {
        type: Number,
        default: 0,
      },
    },
    // Primary guest details
    primaryGuest: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      nationality: String,
      idType: {
        type: String,
        enum: ['Passport', 'National ID', 'Driver License'],
      },
      idNumber: String,
    },
    // Check-in/Check-out dates (for hotels)
    checkIn: Date,
    checkOut: Date,
    nights: Number,
    // Departure/Arrival (for flights)
    departureDate: Date,
    arrivalDate: Date,
    // Pricing breakdown
    pricing: {
      basePrice: {
        type: Number,
        required: true,
      },
      taxes: {
        type: Number,
        default: 0,
      },
      fees: {
        type: Number,
        default: 0,
      },
      discount: {
        type: Number,
        default: 0,
      },
      couponCode: String,
      totalAmount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: 'USD',
      },
    },
    // Payment info
    payment: {
      method: {
        type: String,
        enum: ['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet', 'stripe'],
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded', 'partial_refund'],
        default: 'pending',
      },
      transactionId: String,
      paidAt: Date,
      refundedAmount: Number,
      refundedAt: Date,
    },
    // Booking status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show', 'completed'],
      default: 'pending',
    },
    // Special requests
    specialRequests: {
      type: String,
      maxlength: 500,
    },
    // Additional services
    addOns: [
      {
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    // Cancellation
    cancellation: {
      isCancelled: {
        type: Boolean,
        default: false,
      },
      cancelledAt: Date,
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      reason: String,
      refundAmount: Number,
      refundStatus: {
        type: String,
        enum: ['not_applicable', 'pending', 'processed', 'failed'],
        default: 'not_applicable',
      },
    },
    // Review prompt
    reviewSubmitted: {
      type: Boolean,
      default: false,
    },
    // Internal notes
    notes: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────────
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ hotel: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ bookingRef: 1 });
bookingSchema.index({ 'payment.status': 1 });
bookingSchema.index({ createdAt: -1 });

// ─── Pre-save Middleware ─────────────────────────────────────
// Auto-generate booking reference
bookingSchema.pre('save', function (next) {
  if (this.isNew) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    this.bookingRef = `TP-${timestamp}-${random}`;
  }

  // Calculate nights for hotel bookings
  if (this.bookingType === 'hotel' && this.checkIn && this.checkOut) {
    const msPerDay = 1000 * 60 * 60 * 24;
    this.nights = Math.ceil((this.checkOut - this.checkIn) / msPerDay);
  }

  next();
});

// ─── Static Methods ──────────────────────────────────────────
// Get bookings for a hotel on specific dates (for availability check)
bookingSchema.statics.getOccupiedRooms = async function (hotelId, checkIn, checkOut) {
  return this.find({
    hotel: hotelId,
    status: { $in: ['confirmed', 'checked_in'] },
    $or: [
      { checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } },
    ],
  });
};

// Get user booking stats
bookingSchema.statics.getUserStats = async function (userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalSpent: { $sum: '$pricing.totalAmount' },
      },
    },
  ]);
};

module.exports = mongoose.model('Booking', bookingSchema);