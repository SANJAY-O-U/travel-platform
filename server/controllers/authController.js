// server/controllers/authController.js
'use strict';

const User         = require('../models/User');
const asyncHandler = require('express-async-handler');
const bcrypt       = require('bcryptjs');

// ── Helper: Send Token ────────────────────────────────────────
const sendToken = function(user, statusCode, res, message) {
  const token   = user.generateJWT();
  const userObj = user.toObject();
  delete userObj.password;
  res.status(statusCode).json({
    success: true,
    message: message || 'Success',
    token,
    user:    userObj,
  });
};

// ── Helper: Hash Password ─────────────────────────────────────
const hashPassword = async function(plain) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plain, salt);
};

// ── register ──────────────────────────────────────────────────
const register = asyncHandler(async function(req, res) {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email and password');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const cleanEmail = email.toLowerCase().trim();

  const existing = await User.findOne({ email: cleanEmail }).select('_id googleId');
  if (existing) {
    if (existing.googleId) {
      res.status(400);
      throw new Error('This email uses Google Sign In. Please use Google login.');
    }
    res.status(400);
    throw new Error('Email already registered. Please sign in.');
  }

  const hashed = await hashPassword(password);

  const user = await User.create({
    name:            name.trim(),
    email:           cleanEmail,
    password:        hashed,
    phone:           phone ? phone.trim() : '',
    authProvider:    'local',
    isActive:        true,
    isEmailVerified: false,
    avatar: {
      url: 'https://ui-avatars.com/api/?name=' +
           encodeURIComponent(name.trim()) +
           '&background=0ea5e9&color=fff&size=200',
    },
  });

  console.log('Registered:', cleanEmail);
  sendToken(user, 201, res, 'Welcome, ' + user.name + '!');
});

// ── login ─────────────────────────────────────────────────────
const login = asyncHandler(async function(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const cleanEmail = email.toLowerCase().trim();
  const user       = await User.findOne({ email: cleanEmail }).select('+password');

  console.log('Login:', cleanEmail, '| found:', !!user);

  if (!user) {
    res.status(401);
    throw new Error('No account found with this email. Please register first.');
  }

  if (!user.isActive) {
    res.status(401);
    throw new Error('Account deactivated. Contact support.');
  }

  if (!user.password) {
    res.status(401);
    throw new Error('No password set. Please reset your password.');
  }

  if (user.password.startsWith('google_') || user.authProvider === 'google') {
    res.status(401);
    throw new Error('This account uses Google Sign In. Please use Google login.');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  console.log('Password match:', isMatch);

  if (!isMatch) {
    res.status(401);
    throw new Error('Incorrect password. Please try again.');
  }

  await User.findByIdAndUpdate(user._id, {
    lastLogin: new Date(),
    $inc:      { loginCount: 1 },
  });

  console.log('Login success:', cleanEmail);
  sendToken(user, 200, res, 'Welcome back, ' + user.name + '!');
});

// ── adminLogin ────────────────────────────────────────────────
const adminLogin = asyncHandler(async function(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const cleanEmail = email.toLowerCase().trim();
  const user       = await User.findOne({ email: cleanEmail, role: 'admin' }).select('+password');

  console.log('Admin login:', cleanEmail, '| found:', !!user);

  if (!user) {
    res.status(401);
    throw new Error('Invalid admin credentials');
  }

  if (!user.isActive) {
    res.status(401);
    throw new Error('Admin account is deactivated');
  }

  if (!user.password) {
    res.status(401);
    throw new Error('No password set for admin account');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  console.log('Admin password match:', isMatch);

  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid admin credentials');
  }

  await User.findByIdAndUpdate(user._id, {
    lastLogin: new Date(),
    $inc:      { loginCount: 1 },
  });

  sendToken(user, 200, res, 'Welcome Admin, ' + user.name + '!');
});

// ── getMe ─────────────────────────────────────────────────────
const getMe = asyncHandler(async function(req, res) {
  const user = await User.findById(req.user._id)
    .populate('wishlist', 'name coverImage location ratings priceRange starRating')
    .select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({ success: true, user });
});

// ── updateProfile ─────────────────────────────────────────────
const updateProfile = asyncHandler(async function(req, res) {
  const allowed = ['name','phone','dateOfBirth','nationality','address','preferences','notifications'];
  const updates = {};

  allowed.forEach(function(f) {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: false }
  ).select('-password');

  res.status(200).json({ success: true, message: 'Profile updated', user });
});

// ── changePassword ────────────────────────────────────────────
const changePassword = asyncHandler(async function(req, res) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current and new password');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  const user = await User.findById(req.user._id).select('+password');

  if (!user.password) {
    res.status(400);
    throw new Error('No password set for this account');
  }

  if (user.authProvider === 'google') {
    res.status(400);
    throw new Error('Cannot change password for Google-linked accounts');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  const hashed = await hashPassword(newPassword);

  await User.findByIdAndUpdate(user._id, { password: hashed });

  sendToken(user, 200, res, 'Password changed successfully');
});

// ── toggleWishlist ────────────────────────────────────────────
const toggleWishlist = asyncHandler(async function(req, res) {
  const hotelId = req.params.hotelId;

  const user  = await User.findById(req.user._id).select('wishlist');
  const index = user.wishlist.findIndex(function(id) {
    return id.toString() === hotelId;
  });

  var update;
  var message;

  if (index > -1) {
    update  = { $pull:     { wishlist: hotelId } };
    message = 'Removed from wishlist';
  } else {
    update  = { $addToSet: { wishlist: hotelId } };
    message = 'Added to wishlist';
  }

  const updated = await User.findByIdAndUpdate(
    req.user._id,
    update,
    { new: true }
  ).select('wishlist');

  res.status(200).json({
    success:  true,
    message,
    wishlist: updated.wishlist,
  });
});

// ── googleTokenLogin ──────────────────────────────────────────
const googleTokenLogin = asyncHandler(async function(req, res) {
  const { googleData } = req.body;

  if (!googleData || !googleData.email) {
    res.status(400);
    throw new Error('Google user data is required');
  }

  const { googleId, email, name, picture } = googleData;
  const cleanEmail = email.toLowerCase().trim();

  var user = await User.findOne({
    $or: [{ googleId }, { email: cleanEmail }],
  });

  if (user) {
    if (!user.isActive) {
      res.status(401);
      throw new Error('Account deactivated');
    }
    if (!user.googleId) {
      await User.findByIdAndUpdate(user._id, {
        googleId,
        isEmailVerified: true,
        authProvider:    'google',
        'avatar.url':    picture || '',
      });
    }
  } else {
    const fakePw = await hashPassword('google_' + googleId + '_' + Date.now());
    user = await User.create({
      googleId,
      name:            name || 'Google User',
      email:           cleanEmail,
      password:        fakePw,
      avatar:          { url: picture || '' },
      isEmailVerified: true,
      isActive:        true,
      authProvider:    'google',
    });
  }

  await User.findByIdAndUpdate(user._id, {
    lastLogin: new Date(),
    $inc:      { loginCount: 1 },
  });

  user = await User.findById(user._id).select('-password');

  sendToken(user, 200, res, 'Welcome, ' + user.name + '!');
});

// ── EXPORTS ───────────────────────────────────────────────────
module.exports = {
  register,
  login,
  adminLogin,
  getMe,
  updateProfile,
  changePassword,
  toggleWishlist,
  googleTokenLogin,
};