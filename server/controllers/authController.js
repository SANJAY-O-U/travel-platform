const User         = require('../models/User');
const asyncHandler = require('express-async-handler');
const crypto       = require('crypto');
const nodemailer   = require('nodemailer');

const sendToken = (user, statusCode, res, message = 'Success') => {
  const token   = user.generateJWT();
  const userObj = user.toObject();
  delete userObj.password;
  res.status(statusCode).json({ success: true, message, token, user: userObj });
};

// ── Register ──────────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    res.status(400); throw new Error('Please provide name, email and password');
  }
  const exists = await User.findOne({ email: email.toLowerCase().trim() });
  if (exists) {
    res.status(400); throw new Error('An account with this email already exists');
  }
  const user = await User.create({
    name:  name.trim(),
    email: email.toLowerCase().trim(),
    password,
    phone: phone || '',
  });
  sendToken(user, 201, res, `Welcome to BharatYatra, ${user.name}!`);
});

// ── Login ─────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400); throw new Error('Please provide email and password');
  }
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user || !user.comparePassword(password)) {
    res.status(401); throw new Error('Invalid email or password');
  }
  if (!user.isActive) {
    res.status(401); throw new Error('Account deactivated. Contact support.');
  }
  // ✅ findByIdAndUpdate — does NOT trigger pre-save hook
  await User.findByIdAndUpdate(user._id, {
    lastLogin:  new Date(),
    $inc: { loginCount: 1 },
  });
  sendToken(user, 200, res, `Welcome back, ${user.name}!`);
});

// ── Admin Login ───────────────────────────────────────────────
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({
    email: email.toLowerCase().trim(),
    role:  'admin',
  }).select('+password');
  if (!user || !user.comparePassword(password)) {
    res.status(401); throw new Error('Invalid admin credentials');
  }
  // ✅ findByIdAndUpdate — does NOT trigger pre-save hook
  await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
  sendToken(user, 200, res, `Welcome back Admin, ${user.name}!`);
});

// ── Get Me ────────────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('wishlist', 'name coverImage location ratings priceRange')
    .select('-password');
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.status(200).json({ success: true, user });
});

// ── Update Profile ────────────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'phone', 'dateOfBirth', 'nationality', 'address', 'preferences', 'notifications'];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  // ✅ findByIdAndUpdate — does NOT trigger pre-save hook
  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true, runValidators: true,
  }).select('-password');
  res.status(200).json({ success: true, message: 'Profile updated successfully', user });
});

// ── Change Password ───────────────────────────────────────────
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400); throw new Error('Please provide current and new password');
  }
  if (newPassword.length < 8) {
    res.status(400); throw new Error('New password must be at least 8 characters');
  }
  const user = await User.findById(req.user._id).select('+password');
  if (!user.comparePassword(currentPassword)) {
    res.status(401); throw new Error('Current password is incorrect');
  }
  // ✅ intentional save() — we WANT the pre-save hook to hash the new password
  user.password = newPassword;
  await user.save();
  sendToken(user, 200, res, 'Password changed successfully');
});

// ── Toggle Wishlist ───────────────────────────────────────────
const toggleWishlist = asyncHandler(async (req, res) => {
  const user    = await User.findById(req.user._id);
  const hotelId = req.params.hotelId;
  const index   = user.wishlist.findIndex(id => id.toString() === hotelId);
  let message;
  if (index > -1) {
    user.wishlist.splice(index, 1);
    message = 'Removed from wishlist';
  } else {
    user.wishlist.push(hotelId);
    message = 'Added to wishlist';
  }
  // ✅ findByIdAndUpdate — does NOT trigger pre-save hook
  await User.findByIdAndUpdate(req.user._id, { wishlist: user.wishlist });
  res.status(200).json({ success: true, message, wishlist: user.wishlist });
});

// ── Forgot Password ───────────────────────────────────────────
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) { res.status(400); throw new Error('Email is required'); }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    // Don't reveal if email exists
    return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  }

  const resetToken  = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // ✅ findByIdAndUpdate — does NOT trigger pre-save hook
  await User.findByIdAndUpdate(user._id, {
    resetPasswordToken:  hashedToken,
    resetPasswordExpire: new Date(Date.now() + 30 * 60 * 1000),
  });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    const transporter = nodemailer.createTransport({
      host:   process.env.EMAIL_HOST,
      port:   Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      tls: {
    rejectUnauthorized: false // This bypasses local certificate issues
  }
    });
    await transporter.sendMail({
      from:    `"BharatYatra" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to:      user.email,
      subject: 'Reset Your BharatYatra Password',
      html: `<div style="font-family:sans-serif;padding:32px;">
        <h2 style="color:#0ea5e9;">Reset Your Password</h2>
        <p>Hi ${user.name}, click below to reset your password. Expires in 30 minutes.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#0ea5e9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
          Reset Password →
        </a>
        <p style="color:#888;font-size:12px;">If you didn't request this, ignore this email.</p>
        <p style="color:#888;font-size:12px;">Link: ${resetUrl}</p>
      </div>`,
    });
    res.status(200).json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (emailErr) {
    // ✅ findByIdAndUpdate — does NOT trigger pre-save hook
    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken:  undefined,
      resetPasswordExpire: undefined,
    });
    console.error('Email error:', emailErr.message);
    res.status(500); throw new Error('Email could not be sent. Please try again.');
  }
});
// authController.js — REPLACE the googleLogin function
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// REPLACE the entire googleLogin function with:
const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    res.status(400);
    throw new Error('Google ID Token is missing');
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    res.status(401);
    throw new Error('Invalid Google token: ' + err.message);
  }

  const { name, email, picture } = payload;

  let user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    const randomPassword = crypto.randomBytes(20).toString('hex');
    user = await User.create({
      name,
      email:    email.toLowerCase(),
      password: randomPassword,
      avatar:   { url: picture },
    });
  } else {
    // ✅ findByIdAndUpdate — does NOT trigger pre-save hook
    await User.findByIdAndUpdate(user._id, {
      'avatar.url': picture,
      lastLogin:    new Date(),
    });
  }

  sendToken(user, 200, res, `Welcome, ${user.name}!`);
});
// ── Reset Password ────────────────────────────────────────────
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 8) {
    res.status(400); throw new Error('Password must be at least 8 characters');
  }

  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken:  hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400); throw new Error('Reset link is invalid or expired. Please request a new one.');
  }

  // ✅ intentional save() — we WANT the pre-save hook to hash the new password
  user.password            = password;
  user.resetPasswordToken  = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendToken(user, 200, res, 'Password reset successful!');
});

module.exports = {
  register, login, adminLogin, getMe,
  updateProfile, changePassword, toggleWishlist,
  forgotPassword, resetPassword,googleLogin,
};