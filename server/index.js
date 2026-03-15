// ============================================================
// Travel Platform - Main Server Entry Point
// ============================================================

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const path = require('path')
require('dotenv').config()

// Import route files
const authRoutes = require('./routes/authRoutes')
const hotelRoutes = require('./routes/hotelRoutes')
const flightRoutes = require('./routes/flightRoutes')
const bookingRoutes = require('./routes/bookingRoutes')
const packageRoutes = require('./routes/packageRoutes')
const userRoutes = require('./routes/userRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const adminRoutes = require('./routes/adminRoutes')
const recommendationRoutes = require('./routes/recommendationRoutes')

const app = express()

// ─── Security Middleware ────────────────────────────────────
app.use(helmet())

// ─── Rate Limiting ──────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again later.',
})

app.use('/api/', limiter)

// ─── CORS Configuration ─────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))

// ─── Body Parsers ───────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ─── Logging ────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// ─── Static Files ───────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ─── API Routes ─────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/hotels', hotelRoutes)
app.use('/api/flights', flightRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/packages', packageRoutes)
app.use('/api/users', userRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/recommendations', recommendationRoutes)

// ─── Health Check ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Travel Platform API is running',
    timestamp: new Date().toISOString()
  })
})

// ─── 404 Handler ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" })
})

// ─── Global Error Handler ───────────────────────────────────
app.use((err, req, res, next) => {

  console.error(err.stack)

  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'

  if (err.code === 11000) {
    statusCode = 400
    const field = Object.keys(err.keyValue)[0]
    message = `${field} already exists`
  }

  if (err.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(err.errors).map(e => e.message).join(', ')
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
  }

  res.status(statusCode).json({
    success: false,
    message
  })
})

// ─── Database Connection ────────────────────────────────────
const PORT = process.env.PORT || 5000

const connectDB = async () => {
  try {

    const conn = await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/travel-platform'
    )

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)

  } catch (error) {

    console.error(`❌ MongoDB Connection Error: ${error.message}`)
    process.exit(1)

  }
}

// ─── Start Server ───────────────────────────────────────────
const startServer = async () => {

  await connectDB()

  app.listen(PORT, () => {

    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📡 API: http://localhost:${PORT}/api`)

  })
}

startServer()

// ─── Handle Unhandled Promise Rejections ────────────────────
process.on('unhandledRejection', (err) => {

  console.error('Unhandled Rejection:', err.message)
  process.exit(1)

})

module.exports = app