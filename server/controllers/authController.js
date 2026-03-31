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
// server/controllers/authController.js — Add forgotPassword & resetPassword
const nodemailer = require('nodemailer');
const crypto     = require('crypto');

// ── @POST /api/auth/forgot-password ───────────────────────────
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) { res.status(400); throw new Error('Please provide email'); }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Return 200 even if not found (security: don't leak emails)
    return res.status(200).json({
      success: true,
      message: 'If that email exists, a reset link has been sent.',
    });
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  // Send email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,   // App password, not real password
    },
  });

  await transporter.sendMail({
    from:    `"TravelPlatform" <${process.env.EMAIL_USER}>`,
    to:      user.email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0ea5e9">Reset your password</h2>
        <p>Hi ${user.name},</p>
        <p>Click the link below to reset your password. This link expires in <strong>15 minutes</strong>.</p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#0ea5e9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">
          Reset Password
        </a>
        <p style="color:#888;font-size:12px">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });

  res.status(200).json({
    success: true,
    message: 'Password reset email sent. Check your inbox.',
  });
});

// ── @PUT /api/auth/reset-password/:token ──────────────────────
const resetPassword = asyncHandler(async (req, res) => {
  const { token }       = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    res.status(400);
    throw new Error('Password must be at least 8 characters');
  }

  // Hash the incoming token to match stored hash
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken:  hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token. Please request a new one.');
  }

  user.password            = newPassword;
  user.resetPasswordToken  = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password reset successful! You are now logged in.');
});

// Add to exports:
module.exports = {
  register, login, getMe, updateProfile,
  changePassword, toggleWishlist, adminLogin,
  forgotPassword, resetPassword,              // ← add
};
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
  forgotPassword, resetPassword, 
};