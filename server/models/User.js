const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, 'Name is required'],
      trim:      true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select:    false,
    },
    role: {
      type:    String,
      enum:    ['user', 'admin'],
      default: 'user',
    },
    phone:       { type: String, default: '' },
    nationality: { type: String, default: '' },
    dateOfBirth: { type: Date },
    avatar: {
      public_id: String,
      url:       String,
    },
    address: {
      street:  String,
      city:    String,
      country: String,
      zipCode: String,
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' }],
    preferences: {
      budget:                { type: String, default: 'mid-range' },
      travelStyle:           [String],
      preferredDestinations: [String],
    },
    notifications: {
      email:     { type: Boolean, default: true  },
      sms:       { type: Boolean, default: false },
      marketing: { type: Boolean, default: true  },
    },
    // Required by seeder
    isEmailVerified: { type: Boolean, default: false },
    authProvider: {
      type:    String,
      default: 'local',
      enum:    ['local', 'google', 'facebook'],
    },
    isActive:            { type: Boolean, default: true },
    lastLogin:           { type: Date },
    loginCount:          { type: Number, default: 0 },
    resetPasswordToken:  { type: String },
    resetPasswordExpire: { type: Date },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ══════════════════════════════════════════════════════════════
// PRE-SAVE HOOK — SYNC, NOT ASYNC, NOT ARROW FUNCTION
// ══════════════════════════════════════════════════════════════
userSchema.pre('save', function(next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = bcrypt.hashSync(this.password, 12);
    return next();
  } catch (err) {
    return next(err);
  }
});

// ── Instance Methods ──────────────────────────────────────────
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};

userSchema.methods.generateJWT = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// ── Indexes ───────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);