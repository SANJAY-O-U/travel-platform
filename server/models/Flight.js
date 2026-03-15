// ============================================================
// Flight Model - MongoDB Schema
// ============================================================
const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema(
  {
    flightNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    airline: {
      name: {
        type: String,
        required: true,
      },
      code: {
        type: String,
        required: true,
        uppercase: true,
      },
      logo: String,
    },
    // Route
    origin: {
      city: { type: String, required: true },
      airport: { type: String, required: true },
      airportCode: { type: String, required: true, uppercase: true },
      country: String,
      terminal: String,
    },
    destination: {
      city: { type: String, required: true },
      airport: { type: String, required: true },
      airportCode: { type: String, required: true, uppercase: true },
      country: String,
      terminal: String,
    },
    // Times
    departureTime: {
      type: Date,
      required: true,
    },
    arrivalTime: {
      type: Date,
      required: true,
    },
    duration: {
      hours: Number,
      minutes: Number,
      total: Number, // total minutes
    },
    // Flight details
    aircraft: String,
    flightClass: {
      type: String,
      enum: ['Economy', 'Premium Economy', 'Business', 'First Class'],
      default: 'Economy',
    },
    stops: {
      type: Number,
      default: 0,
    },
    layovers: [
      {
        city: String,
        airport: String,
        airportCode: String,
        duration: String,
      },
    ],
    // Seats & Pricing
    seats: {
      total: Number,
      available: {
        type: Number,
        default: 0,
      },
      economy: {
        total: Number,
        available: Number,
        price: Number,
      },
      premiumEconomy: {
        total: Number,
        available: Number,
        price: Number,
      },
      business: {
        total: Number,
        available: Number,
        price: Number,
      },
      firstClass: {
        total: Number,
        available: Number,
        price: Number,
      },
    },
    basePrice: {
      type: Number,
      required: true,
    },
    // Inclusions
    baggage: {
      carryOn: String, // "7 kg"
      checkedBaggage: String, // "20 kg"
      additionalBaggagePrice: Number,
    },
    meals: {
      type: String,
      enum: ['Included', 'Not Included', 'Paid', 'Vegetarian Available'],
      default: 'Not Included',
    },
    entertainment: Boolean,
    wifi: Boolean,
    // Status
    status: {
      type: String,
      enum: ['scheduled', 'delayed', 'cancelled', 'boarding', 'departed', 'arrived'],
      default: 'scheduled',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringDays: [
      {
        type: String,
        enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────────
flightSchema.index({ 'origin.airportCode': 1, 'destination.airportCode': 1 });
flightSchema.index({ departureTime: 1 });
flightSchema.index({ basePrice: 1 });
flightSchema.index({ 'origin.city': 'text', 'destination.city': 'text' });

// ─── Pre-save Middleware ─────────────────────────────────────
flightSchema.pre('save', function (next) {
  // Auto-calculate duration
  if (this.departureTime && this.arrivalTime) {
    const totalMinutes = Math.floor((this.arrivalTime - this.departureTime) / 60000);
    this.duration = {
      hours: Math.floor(totalMinutes / 60),
      minutes: totalMinutes % 60,
      total: totalMinutes,
    };
  }
  next();
});

module.exports = mongoose.model('Flight', flightSchema);