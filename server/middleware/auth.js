// ============================================================
// Auth Middleware - JWT Verification & Role-Based Access
// ============================================================
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Protect Routes (Require Login) ─────────────────────────
const protect = async (req, res, next) => {
  let token;

  // Get token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in to continue.',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists and is active
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

// ─── Admin-Only Access ───────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Admin privileges required.',
  });
};

// ─── Optional Auth (doesn't fail if no token) ───────────────
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    req.user = user || null;
  } catch {
    req.user = null;
  }

  next();
};

// ─── Resource Ownership Check ────────────────────────────────
const isOwnerOrAdmin = (Model, paramField = 'id') => async (req, res, next) => {
  try {
    const resource = await Model.findById(req.params[paramField]);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Admin can access everything
    if (req.user.role === 'admin') return next();

    // Check if user owns the resource
    const ownerId = resource.user || resource.owner;
    if (ownerId && ownerId.toString() === req.user._id.toString()) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'You are not authorized to perform this action',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { protect, adminOnly, optionalAuth, isOwnerOrAdmin };