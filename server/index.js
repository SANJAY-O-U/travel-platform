// server/index.js
const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');
const path      = require('path');
require('dotenv').config();

const authRoutes           = require('./routes/authRoutes');
const hotelRoutes          = require('./routes/hotelRoutes');
const flightRoutes         = require('./routes/flightRoutes');
const bookingRoutes        = require('./routes/bookingRoutes');
const packageRoutes        = require('./routes/packageRoutes');
const userRoutes           = require('./routes/userRoutes');
const reviewRoutes         = require('./routes/reviewRoutes');
const adminRoutes          = require('./routes/adminRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

const app = express();

// ── Security ───────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy:     false,
  })
);

// ── CORS ───────────────────────────────────────────────────────
const corsOptions = {
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      process.env.CLIENT_URL,
    ].filter(Boolean);

    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // allow all in development
    }
  },
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// ✅ Fixed: use specific path instead of '*' for preflight
app.options('/{*path}', cors(corsOptions));

// ── Rate Limiting ──────────────────────────────────────────────
const limiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             300,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  message:  { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
});
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);

// ── Body Parsers ───────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logging ────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Static Files ───────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ─────────────────────────────────────────────────
app.use('/api/auth',            authRoutes);
app.use('/api/hotels',          hotelRoutes);
app.use('/api/flights',         flightRoutes);
app.use('/api/bookings',        bookingRoutes);
app.use('/api/packages',        packageRoutes);
app.use('/api/users',           userRoutes);
app.use('/api/reviews',         reviewRoutes);
app.use('/api/admin',           adminRoutes);
app.use('/api/recommendations', recommendationRoutes);

// ── Health Check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.status(200).json({
    success:     true,
    message:     'TravelPlatform API is running!',
    environment: process.env.NODE_ENV || 'development',
    database:    states[mongoose.connection.readyState] || 'unknown',
    timestamp:   new Date().toISOString(),
    uptime:      `${Math.floor(process.uptime())}s`,
  });
});

// ✅ Fixed: use '/(*)' instead of '*' for 404 handler
// This works with both Express 4 and Express 5
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── Global Error Handler ───────────────────────────────────────
// ✅ Must have 4 parameters for Express to recognise as error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);

  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal Server Error';

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message     = `${field || 'Field'} already exists`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message    = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message    = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError')  { statusCode = 401; message = 'Invalid token. Please log in.'; }
  if (err.name === 'TokenExpiredError')  { statusCode = 401; message = 'Token expired. Please log in again.'; }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Connect to MongoDB ─────────────────────────────────────────
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ MONGO_URI not set in .env');
    return false;
  }

  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS:          45000,
    });
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
    return true;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);

    if (err.message.includes('whitelist') || err.message.includes('IP')) {
      console.error('');
      console.error('🔒 Your IP is not whitelisted in MongoDB Atlas!');
      console.error('   Fix: Atlas → Security → Network Access');
      console.error('   → ADD IP ADDRESS → ALLOW ACCESS FROM ANYWHERE (0.0.0.0/0)');
    }

    if (err.message.includes('authentication failed')) {
      console.error('');
      console.error('🔑 Wrong username or password in MONGO_URI!');
      console.error('   Fix: Atlas → Database Access → Edit your user password');
    }

    return false;
  }
};

// ── Start Server ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Start HTTP server first
  app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log(`║  🚀 TravelPlatform API                   ║`);
    console.log(`║  Port : ${PORT}                              ║`);
    console.log(`║  Mode : ${(process.env.NODE_ENV || 'development').padEnd(30)}║`);
    console.log('╚══════════════════════════════════════════╝');
  });

  // Then connect to database
  const connected = await connectDB();

  if (connected) {
    console.log('');
    console.log('✅ Server + Database ready!');
    console.log(`   API    → http://localhost:${PORT}/api`);
    console.log(`   Health → http://localhost:${PORT}/api/health`);
    console.log('');
  }
};

// ── Process Handlers ───────────────────────────────────────────
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

startServer();
module.exports = app;