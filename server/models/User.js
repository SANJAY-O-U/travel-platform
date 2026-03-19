// server/models/User.js
// ✅ REMOVE the pre-save hook completely
// We will hash passwords manually everywhere

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, 'Please provide your name'],
      trim:      true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type:      String,
      required:  [true, 'Please provide your email'],
      unique:    true,
      lowercase: true,
      trim:      true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type:   String,
      select: false,
    },
    googleId: {
      type:   String,
      sparse: true,
    },
    authProvider: {
      type:    String,
      enum:    ['local', 'google'],
      default: 'local',
    },
    role: {
      type:    String,
      enum:    ['user', 'admin'],
      default: 'user',
    },
    avatar: {
      public_id: String,
      url:       { type: String, default: '' },
    },
    phone:       { type: String, trim: true },
    dateOfBirth: Date,
    nationality: String,
    address: {
      street:  String,
      city:    String,
      state:   String,
      country: String,
      zipCode: String,
    },
    wishlist: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
    ],
    preferences: {
      budget: {
        type:    String,
        enum:    ['budget', 'mid-range', 'luxury', 'ultra-luxury'],
        default: 'mid-range',
      },
      travelStyle: [
        {
          type: String,
          enum: ['adventure','relaxation','cultural','business','family','romantic','solo'],
        },
      ],
      preferredAmenities:    [String],
      preferredDestinations: [String],
    },
    searchHistory: [
      {
        query:       String,
        destination: String,
        date:        { type: Date, default: Date.now },
      },
    ],
    notifications: {
      email:          { type: Boolean, default: true },
      bookingUpdates: { type: Boolean, default: true },
      promotions:     { type: Boolean, default: false },
    },
    isActive:               { type: Boolean, default: true },
    isEmailVerified:        { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpire:Date,
    resetPasswordToken:     String,
    resetPasswordExpire:    Date,
    lastLogin:              Date,
    loginCount:             { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────
userSchema.index({ email:    1 }, { unique: true });
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ role:     1 });

// ── NO PRE-SAVE HOOK ──────────────────────────────────────────
// Passwords are hashed manually in controllers and seeder
// This prevents double-hashing and "next is not a function" errors

// ── Instance Methods ──────────────────────────────────────────
userSchema.methods.generateJWT = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET || 'fallback_secret_change_in_production',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

userSchema.methods.generatePasswordResetToken = function() {
  const resetToken         = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken  = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);