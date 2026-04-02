// ============================================================
// TravelPackage Model - MongoDB Schema
// ============================================================
const mongoose = require('mongoose');

const itineraryDaySchema = new mongoose.Schema({
  day:           Number,
  title:         String,
  description:   String,
  activities:    [String],
  meals: {
    breakfast: Boolean,
    lunch:     Boolean,
    dinner:    Boolean,
  },
  accommodation: String,
  transport:     String,
});

const travelPackageSchema = new mongoose.Schema(
  {
    title: {
      type:      String,
      required:  [true, 'Package title is required'],
      trim:      true,
      maxlength: 150,
    },
    slug: {
      type:      String,
      unique:    true,
      lowercase: true,
    },
    description: {
      type:      String,
      required:  true,
      maxlength: 3000,
    },
    shortDescription: {
      type:      String,
      maxlength: 300,
    },
    destination: {
      city:    { type: String, required: true },
      country: { type: String, required: true },
      region:  String,
    },
    duration: {
      days:   { type: Number, required: true },
      nights: { type: Number, required: true },
    },
    packageType: {
      type:     String,
      required: true,
      enum: [
        'Adventure',
        'Beach',
        'Cultural',
        'Honeymoon',
        'Family',
        'Wildlife',
        'Pilgrimage',
        'Hill Station',
        'Wellness',
        'Luxury',
        'Budget',
        'Cruise',
      ],
    },
    pricing: {
      perPerson:     { type: Number, required: true },
      originalPrice: Number,
      currency:      { type: String, default: 'INR' },
      includes:      [String],
      excludes:      [String],
    },
    groupSize: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 20 },
    },
    difficulty: {
      type:    String,
      enum:    ['Easy', 'Moderate', 'Challenging', 'Extreme'],
      default: 'Easy',
    },
    includes: {
      flights:       { type: Boolean, default: false },
      accommodation: { type: Boolean, default: true  },
      meals: {
        type:    String,
        enum:    ['None', 'Breakfast', 'Half Board', 'Full Board', 'All Inclusive'],
        default: 'Breakfast',
      },
      transfers:  { type: Boolean, default: true  },
      guide:      { type: Boolean, default: false },
      insurance:  { type: Boolean, default: false },
      activities: [String],
    },
    itinerary: [itineraryDaySchema],
    coverImage: { public_id: String, url: String },
    images: [
      {
        public_id: String,
        url:       String,
        caption:   String,
      },
    ],
    ratings: {
      overall:     { type: Number, default: 0 },
      reviewCount: { type: Number, default: 0 },
    },
    availability: [
      {
        startDate:      Date,
        endDate:        Date,
        spotsAvailable: Number,
        priceOverride:  Number,
      },
    ],
    tags:       [String],
    highlights: [String],
    isFeatured:   { type: Boolean, default: false },
    isActive:     { type: Boolean, default: true  },
    isBestSeller: { type: Boolean, default: false },
    bookingCount: { type: Number, default: 0 },
    viewCount:    { type: Number, default: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────
travelPackageSchema.index({ 'destination.city': 1, packageType: 1 });
travelPackageSchema.index({ isFeatured: 1, isActive: 1 });
travelPackageSchema.index({ title: 'text', 'destination.city': 'text', tags: 'text' });

// ── Pre-save ──────────────────────────────────────────────────
travelPackageSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-') +
      '-' + Date.now();
  }
  return next();
});

module.exports = mongoose.model('TravelPackage', travelPackageSchema);