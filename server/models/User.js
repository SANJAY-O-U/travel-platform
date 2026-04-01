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
    phone:       { type: String,  default: '' },
    nationality: { type: String,  default: '' },
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
    isActive:            { type: Boolean, default: true },
    lastLogin:           { type: Date },
    loginCount:          { type: Number, default: 0 },
    resetPasswordToken:  { type: String },
    resetPasswordExpire: { type: Date   },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ══════════════════════════════════════════════════════════════
// PRE-SAVE HOOK
// RULES:
//   1. NOT async — use sync bcrypt methods only
//   2. NOT an arrow function — needs `this`
//   3. Always return next() — never just call next()
// ─── Pre-save hook: hash password ────────────────────────────
userSchema.pre('save', async function () {
  // 1. Only hash if password was modified
  if (!this.isModified('password')) {
    return; // Returning early in an async hook is the same as calling next()
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err; // Throwing inside an async hook passes the error to Mongoose
  }
});

// Compare password
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};

// Generate JWT
userSchema.methods.generateJWT = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);