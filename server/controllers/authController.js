// ============================================================
// Auth Controller - Registration, Login, Profile Management
// ============================================================
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// ─── Helper: Send Token Response ────────────────────────────
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = user.generateJWT();

  // Remove password from output
  const userObj = user.toObject();
  delete userObj.password;

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userObj,
  });
};

// ─── @POST /api/auth/register ────────────────────────────────
// Register a new user
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  // Create user
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    phone,
  });

  sendTokenResponse(user, 201, res, 'Account created successfully! Welcome to TravelPlatform.');
});

// ─── @POST /api/auth/login ───────────────────────────────────
// Login user
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Find user and include password for comparison
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(401);
    throw new Error('Your account has been deactivated. Please contact support.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Update last login
  user.lastLogin = new Date();
  user.loginCount += 1;
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, `Welcome back, ${user.name}!`);
});

// ─── @GET /api/auth/me ───────────────────────────────────────
// Get current logged-in user
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('wishlist', 'name coverImage location ratings priceRange')
    .select('-password');

  res.status(200).json({
    success: true,
    user,
  });
});

// ─── @PUT /api/auth/profile ──────────────────────────────────
// Update user profile
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'phone', 'dateOfBirth', 'nationality', 'address', 'preferences', 'notifications'];

  const updateData = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user,
  });
});

// ─── @PUT /api/auth/change-password ─────────────────────────
// Change password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current and new password');
  }

  if (newPassword.length < 8) {
    res.status(400);
    throw new Error('New password must be at least 8 characters');
  }

  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password changed successfully');
});

// ─── @POST /api/auth/wishlist/:hotelId ──────────────────────
// Toggle hotel in wishlist
const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const hotelId = req.params.hotelId;

  const index = user.wishlist.indexOf(hotelId);
  let message;

  if (index > -1) {
    user.wishlist.splice(index, 1);
    message = 'Removed from wishlist';
  } else {
    user.wishlist.push(hotelId);
    message = 'Added to wishlist';
  }

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message,
    wishlist: user.wishlist,
  });
});

// ─── @POST /api/auth/admin/login ────────────────────────────
// Admin login
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase(), role: 'admin' }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid admin credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid admin credentials');
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, `Welcome back, Admin ${user.name}!`);
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  toggleWishlist,
  adminLogin,
};