// ============================================================
// User Model - MongoDB Schema
// ============================================================
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: {
      public_id: String,
      url: {
        type: String,
        default: 'https://ui-avatars.com/api/?background=0ea5e9&color=fff&size=200',
      },
    },
    phone: {
      type: String,
      trim: true,
    },
    dateOfBirth: Date,
    nationality: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    // Wishlist - saved hotels
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
      },
    ],
    // User preferences for AI recommendations
    preferences: {
      budget: {
        type: String,
        enum: ['budget', 'mid-range', 'luxury', 'ultra-luxury'],
        default: 'mid-range',
      },
      travelStyle: [
        {
          type: String,
          enum: ['adventure', 'relaxation', 'cultural', 'business', 'family', 'romantic', 'solo'],
        },
      ],
      preferredAmenities: [String],
      preferredDestinations: [String],
    },
    // Search history for AI recommendations
    searchHistory: [
      {
        query: String,
        destination: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Notification settings
    notifications: {
      email: { type: Boolean, default: true },
      bookingUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: Date,
    loginCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtual Fields ─────────────────────────────────────────
// Get user's bookings count via virtual
userSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'user',
  count: true,
});

// ─── Indexes ─────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// ─── Pre-save Middleware ─────────────────────────────────────
// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance Methods ────────────────────────────────────────
// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.generateJWT = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
  return resetToken;
};

// Add to search history
userSchema.methods.addSearchHistory = function (query, destination) {
  // Keep only last 20 searches
  if (this.searchHistory.length >= 20) {
    this.searchHistory.shift();
  }
  this.searchHistory.push({ query, destination });
};

module.exports = mongoose.model('User', userSchema);