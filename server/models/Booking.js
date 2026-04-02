// ============================================================
// Booking Model - MongoDB Schema
// ============================================================
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingRef: {
      type:   String,
      unique: true,
    },
    bookingType: {
      type:     String,
      required: true,
      enum:     ['hotel', 'flight', 'package'],
    },
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Hotel',
    },
    room: {
      roomType:      String,
      pricePerNight: Number,
      bedType:       String,
      maxGuests:     Number,
    },
    flight: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Flight',
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'TravelPackage',
    },
    guests: {
      adults:   { type: Number, default: 1, min: 1 },
      children: { type: Number, default: 0 },
      infants:  { type: Number, default: 0 },
    },
    primaryGuest: {
      name:        { type: String, required: true },
      email:       { type: String, required: true },
      phone:       { type: String, required: true },
      nationality: String,
      idType:      { type: String, enum: ['Passport', 'National ID', 'Driver License'] },
      idNumber:    String,
    },
    checkIn:       Date,
    checkOut:      Date,
    nights:        Number,
    departureDate: Date,
    arrivalDate:   Date,
    pricing: {
      basePrice:   { type: Number, required: true },
      taxes:       { type: Number, default: 0 },
      fees:        { type: Number, default: 0 },
      discount:    { type: Number, default: 0 },
      couponCode:  String,
      totalAmount: { type: Number, required: true },
      currency:    { type: String, default: 'USD' },
    },
    payment: {
      method: {
        type: String,
        enum: ['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet', 'stripe'],
      },
      status: {
        type:    String,
        enum:    ['pending', 'paid', 'failed', 'refunded', 'partial_refund'],
        default: 'pending',
      },
      transactionId:  String,
      paidAt:         Date,
      refundedAmount: Number,
      refundedAt:     Date,
    },
    status: {
      type:    String,
      enum:    ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show', 'completed'],
      default: 'pending',
    },
    specialRequests: { type: String, maxlength: 500 },
    addOns: [
      {
        name:     String,
        price:    Number,
        quantity: Number,
      },
    ],
    cancellation: {
      isCancelled: { type: Boolean, default: false },
      cancelledAt: Date,
      cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reason:      String,
      refundAmount: Number,
      refundStatus: {
        type:    String,
        enum:    ['not_applicable', 'pending', 'processed', 'failed'],
        default: 'not_applicable',
      },
    },
    reviewSubmitted: { type: Boolean, default: false },
    notes:           String,
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ hotel: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ bookingRef: 1 });
bookingSchema.index({ 'payment.status': 1 });
bookingSchema.index({ createdAt: -1 });

// ══════════════════════════════════════════════════════════════
// PRE-SAVE HOOK — SYNC, NOT ASYNC, NOT ARROW FUNCTION
// ══════════════════════════════════════════════════════════════
bookingSchema.pre('save', function(next) {
  // Auto-generate booking reference for new bookings
  if (this.isNew) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random    = Math.random().toString(36).substr(2, 5).toUpperCase();
    this.bookingRef = `TP-${timestamp}-${random}`;
  }

  // Calculate nights for hotel bookings
  if (this.bookingType === 'hotel' && this.checkIn && this.checkOut) {
    const start = new Date(this.checkIn);
    const end   = new Date(this.checkOut);
    if (end > start) {
      this.nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }
  }

  return next();
});

// ── Static Methods ────────────────────────────────────────────
bookingSchema.statics.getOccupiedRooms = async function(hotelId, checkIn, checkOut) {
  return this.find({
    hotel:  hotelId,
    status: { $in: ['confirmed', 'checked_in'] },
    $or:    [{ checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }],
  });
};

bookingSchema.statics.getUserStats = async function(userId) {
  return this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id:        '$status',
        count:      { $sum: 1 },
        totalSpent: { $sum: '$pricing.totalAmount' },
      },
    },
  ]);
};

module.exports = mongoose.model('Booking', bookingSchema);