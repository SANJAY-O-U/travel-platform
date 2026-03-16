TravelPlatform — Complete README.md
markdown# ✈️ TravelPlatform — AI-Powered Full Stack Travel Booking Platform

<div align="center">

![TravelPlatform Banner](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80)

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Redux](https://img.shields.io/badge/Redux_Toolkit-2.0-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**A startup-grade, production-ready travel booking platform combining the best of Airbnb, MakeMyTrip, and Booking.com — built with the MERN stack.**

[Live Demo](#) · [Report Bug](#) · [Request Feature](#) · [Documentation](#)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Pages & Routes](#-pages--routes)
- [Database Models](#-database-models)
- [Authentication](#-authentication)
- [Screenshots](#-screenshots)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌍 Overview

**TravelPlatform** is a comprehensive full-stack travel booking web application designed as a startup MVP and final-year computer science project. It solves the major pain points of existing travel platforms by combining hotel bookings, flight search, curated travel packages, AI-powered recommendations, and a complete user dashboard — all in one seamless, beautifully designed experience.

### 🎯 Problem It Solves

| Problem | Solution |
|---------|----------|
| Multiple apps for hotels, flights, packages | Single unified platform |
| Poor UI and slow experience | Dark glassmorphism design with Framer Motion animations |
| No personalized recommendations | AI recommendation engine based on search history & preferences |
| Complicated booking management | Clean dashboard with real-time booking status |
| No integrated travel planning | Smart search + availability calendar + price calculator |

---

## ✨ Features

### 🏨 Hotel Booking System
- Browse thousands of hotels with real-time filtering
- Advanced search by city, price range, star rating, property type, amenities
- Image gallery with full-screen viewer
- Room availability checker with date-based pricing
- Booking confirmation with PDF-style receipt
- Cancellation with automatic refund calculation

### ✈️ Flight Booking Module
- Search flights by origin, destination, date, and passengers
- Filter by price, duration, airline, and class
- Popular routes display
- Seat availability indicator
- Multi-class support (Economy, Business, First Class)

### 📦 Travel Package Explorer
- Curated holiday packages with day-by-day itineraries
- Filter by type (Adventure, Beach, Cultural, Honeymoon, Wildlife, etc.)
- Detailed inclusions (flights, meals, transfers, guide, insurance)
- Best seller and featured tags
- Discount badges with original price comparison

### 🤖 AI Recommendation Engine
- Personalized suggestions based on user search history
- Budget-based filtering (Budget → Ultra Luxury)
- Travel style preferences (Adventure, Relaxation, Cultural, etc.)
- Dynamic homepage recommendations

### 🗺️ Interactive Maps
- Leaflet-powered hotel location maps
- Nearby attractions listing
- Coordinate-based geo search

### 👤 User Dashboard
- Complete booking history with status tracking
- One-click booking cancellation
- Wishlist management (save favorite hotels)
- Profile settings and preferences
- Notification preferences

### 🛠️ Admin Dashboard
- Real-time analytics with Recharts graphs
- Revenue and booking trend charts
- Booking status pie chart
- Hotel CRUD management
- User management with activate/deactivate
- Recent bookings feed
- Top performing hotels leaderboard

### 🔐 Authentication & Security
- JWT-based authentication with 30-day token expiry
- Bcrypt password hashing (salt rounds: 12)
- Role-based access control (User / Admin)
- Rate limiting (200 requests per 15 minutes)
- Helmet.js security headers
- CORS protection

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI library |
| Vite | 5.0 | Build tool & dev server |
| Tailwind CSS | 3.4 | Utility-first styling |
| Framer Motion | 10.16 | Animations & transitions |
| Redux Toolkit | 2.0 | Global state management |
| React Router | 6.21 | Client-side routing |
| Axios | 1.6 | HTTP client |
| Recharts | 2.10 | Admin charts & analytics |
| Lucide React | 0.303 | Icon library |
| React Hot Toast | 2.4 | Toast notifications |
| React Leaflet | 4.2 | Interactive maps |
| Swiper | 11.0 | Image carousels |
| Date-fns | 3.0 | Date formatting |
| Radix UI | Various | Accessible UI primitives |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime environment |
| Express.js | 4.18 | Web framework |
| MongoDB | 7.0 | NoSQL database |
| Mongoose | 8.0 | MongoDB ODM |
| JSON Web Token | 9.0 | Authentication tokens |
| Bcryptjs | 2.4 | Password hashing |
| Helmet | 7.1 | Security headers |
| Morgan | 1.10 | HTTP request logging |
| Multer | 1.4 | File upload handling |
| Cloudinary | 1.41 | Cloud image storage |
| Nodemailer | 6.9 | Email notifications |
| Stripe | 14.10 | Payment processing |
| Express Rate Limit | 7.1 | API rate limiting |

---

## 📁 Project Structure
```
travel-platform/
│
├── 📁 client/                          # React Frontend (Vite)
│   ├── public/
│   │   └── globe.svg
│   ├── src/
│   │   ├── 📁 components/
│   │   │   ├── 📁 common/
│   │   │   │   ├── Navbar.jsx          # Navigation with auth state
│   │   │   │   ├── Footer.jsx          # Site footer
│   │   │   │   ├── HotelCard.jsx       # Glassmorphism hotel card
│   │   │   │   ├── StarRating.jsx      # Interactive star rating
│   │   │   │   ├── SkeletonCard.jsx    # Loading skeletons
│   │   │   │   ├── PageLoader.jsx      # Full page loader
│   │   │   │   └── ScrollToTop.jsx     # Auto scroll on route change
│   │   │   ├── 📁 hotel/
│   │   │   ├── 📁 flight/
│   │   │   ├── 📁 package/
│   │   │   ├── 📁 dashboard/
│   │   │   └── 📁 admin/
│   │   │
│   │   ├── 📁 pages/
│   │   │   ├── HomePage.jsx            # Hero + search + featured
│   │   │   ├── HotelsPage.jsx          # Listing with filters
│   │   │   ├── HotelDetailPage.jsx     # Gallery, rooms, reviews
│   │   │   ├── FlightsPage.jsx         # Flight search
│   │   │   ├── PackagesPage.jsx        # Package explorer
│   │   │   ├── PackageDetailPage.jsx   # Package details + itinerary
│   │   │   ├── BookingPage.jsx         # Multi-step checkout
│   │   │   ├── BookingConfirmPage.jsx  # Booking confirmation
│   │   │   ├── DashboardPage.jsx       # User dashboard
│   │   │   ├── AdminDashboard.jsx      # Admin panel
│   │   │   ├── LoginPage.jsx           # Login with demo creds
│   │   │   ├── RegisterPage.jsx        # Registration with password strength
│   │   │   ├── ContactPage.jsx         # Contact form
│   │   │   └── NotFoundPage.jsx        # 404 page
│   │   │
│   │   ├── 📁 store/
│   │   │   ├── store.js                # Redux store config
│   │   │   └── 📁 slices/
│   │   │       ├── authSlice.js        # Auth state & thunks
│   │   │       ├── hotelSlice.js       # Hotel state & thunks
│   │   │       ├── bookingSlice.js     # Booking state & thunks
│   │   │       ├── flightSlice.js      # Flight state & thunks
│   │   │       ├── packageSlice.js     # Package state & thunks
│   │   │       └── uiSlice.js          # UI state (modals, dark mode)
│   │   │
│   │   ├── 📁 utils/
│   │   │   ├── api.js                  # Axios instance + interceptors
│   │   │   └── helpers.js             # Utility functions
│   │   │
│   │   ├── App.jsx                     # Root component + routing
│   │   ├── main.jsx                    # React entry point
│   │   └── index.css                   # Global styles + Tailwind
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── 📁 server/                          # Node.js Backend
│   ├── 📁 config/
│   │   └── db.js                       # MongoDB connection
│   │
│   ├── 📁 controllers/
│   │   ├── authController.js           # Register, login, profile
│   │   ├── hotelController.js          # Hotel CRUD + search
│   │   ├── flightController.js         # Flight search + CRUD
│   │   ├── bookingController.js        # Booking lifecycle
│   │   ├── packageController.js        # Travel packages CRUD
│   │   ├── reviewController.js         # Reviews + ratings
│   │   └── adminController.js          # Dashboard analytics
│   │
│   ├── 📁 middleware/
│   │   └── auth.js                     # JWT verification + RBAC
│   │
│   ├── 📁 models/
│   │   ├── User.js                     # User schema + methods
│   │   ├── Hotel.js                    # Hotel schema + geo index
│   │   ├── Booking.js                  # Booking lifecycle schema
│   │   ├── Flight.js                   # Flight schema
│   │   ├── Review.js                   # Review + auto-rating update
│   │   └── TravelPackage.js            # Package + itinerary schema
│   │
│   ├── 📁 routes/
│   │   ├── authRoutes.js
│   │   ├── hotelRoutes.js
│   │   ├── flightRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── packageRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── userRoutes.js
│   │   ├── adminRoutes.js
│   │   └── recommendationRoutes.js
│   │
│   ├── 📁 utils/
│   │   └── seeder.js                   # Database seeder with sample data
│   │
│   ├── index.js                        # Main server entry point
│   ├── .env.example                    # Environment variables template
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
```bash
node --version    # v18.0.0 or higher
npm --version     # v9.0.0 or higher
mongod --version  # v6.0 or higher
git --version     # Any recent version
```

### Step 1 — Clone the Repository
```bash
git clone https://github.com/yourusername/travel-platform.git
cd travel-platform
```

### Step 2 — Install Server Dependencies
```bash
cd server
npm install
```

### Step 3 — Install Client Dependencies
```bash
cd ../client
npm install
```

### Step 4 — Configure Environment Variables
```bash
cd ../server
cp .env.example .env
```

Open `.env` and fill in your values:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/travel-platform
JWT_SECRET=your_super_secret_key_here_min_32_chars
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

### Step 5 — Start MongoDB
```bash
# macOS / Linux
mongod

# Windows
net start MongoDB

# Using MongoDB Atlas (Cloud)
# Just paste your Atlas connection string in MONGO_URI
```

### Step 6 — Seed the Database
```bash
cd server
node utils/seeder.js
```

Expected output:
```
✅ Connected to MongoDB
🗑️  Cleared existing data
👤 Admin created: admin@travelplatform.com
👥 3 sample users created
🏨 8 hotels created
✈️  5 flights created
📦 6 packages created
⭐ 8 reviews created

🚀 Database seeded successfully!
─────────────────────────────────
Admin Login:
  Email: admin@travelplatform.com
  Password: Admin@123456

Sample User Login:
  Email: alice@example.com
  Password: Password@123
─────────────────────────────────
```

### Step 7 — Start the Application

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```
```
✅ MongoDB Connected: localhost
🚀 Server running in development mode on port 5000
📡 API: http://localhost:5000/api
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```
```
  VITE v5.0.8  ready in 342 ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.x:5173/
```

### Step 8 — Open in Browser
```
http://localhost:5173
```

---

## 🔐 Demo Login Credentials

| Role  | Email | Password | Access |
|-------|-------|----------|--------|
| 👑 Admin | admin@travelplatform.com | Admin@123456 | Full admin panel + all features |
| 👤 User | alice@example.com | Password@123 | All user features |
| 👤 User | bob@example.com | Password@123 | All user features |
| 👤 User | carol@example.com | Password@123 | All user features |

---

## 🌐 Environment Variables

### Server `.env`
```env
# ── Server ──────────────────────────────────────
NODE_ENV=development
PORT=5000

# ── Database ─────────────────────────────────────
MONGO_URI=mongodb://localhost:27017/travel-platform
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/travel-platform

# ── JWT Authentication ───────────────────────────
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# ── CORS ─────────────────────────────────────────
CLIENT_URL=http://localhost:5173

# ── Cloudinary (Image Uploads) ───────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── Email (Nodemailer) ───────────────────────────
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@travelplatform.com

# ── Stripe Payments ──────────────────────────────
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# ── Google Maps ──────────────────────────────────
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Client `.env` (optional)
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_KEY=your_google_maps_key
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | User login | ❌ |
| POST | `/auth/admin/login` | Admin login | ❌ |
| GET | `/auth/me` | Get current user | ✅ |
| PUT | `/auth/profile` | Update profile | ✅ |
| PUT | `/auth/change-password` | Change password | ✅ |
| POST | `/auth/wishlist/:hotelId` | Toggle wishlist | ✅ |

### Hotel Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/hotels` | Search & filter hotels | ❌ |
| GET | `/hotels/featured` | Get featured hotels | ❌ |
| GET | `/hotels/destinations` | Get popular destinations | ❌ |
| GET | `/hotels/suggestions?q=` | Autocomplete search | ❌ |
| GET | `/hotels/nearby` | Hotels near coordinates | ❌ |
| GET | `/hotels/:id` | Get hotel details | ❌ |
| GET | `/hotels/:id/availability` | Check room availability | ❌ |
| POST | `/hotels` | Create hotel | ✅ Admin |
| PUT | `/hotels/:id` | Update hotel | ✅ Admin |
| DELETE | `/hotels/:id` | Remove hotel | ✅ Admin |

### Booking Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/bookings` | Create booking | ✅ |
| GET | `/bookings/my` | Get my bookings | ✅ |
| GET | `/bookings/:id` | Get booking details | ✅ |
| PUT | `/bookings/:id/cancel` | Cancel booking | ✅ |
| GET | `/bookings/all` | Get all bookings | ✅ Admin |
| GET | `/bookings/stats` | Booking statistics | ✅ Admin |

### Flight Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/flights` | Search flights | ❌ |
| GET | `/flights/popular-routes` | Popular routes | ❌ |
| POST | `/flights` | Create flight | ✅ Admin |
| PUT | `/flights/:id` | Update flight | ✅ Admin |
| DELETE | `/flights/:id` | Remove flight | ✅ Admin |

### Package Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/packages` | Browse packages | ❌ |
| GET | `/packages/featured` | Featured packages | ❌ |
| GET | `/packages/:id` | Package details | ❌ |
| POST | `/packages` | Create package | ✅ Admin |
| PUT | `/packages/:id` | Update package | ✅ Admin |
| DELETE | `/packages/:id` | Remove package | ✅ Admin |

### Review Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/reviews/hotel/:hotelId` | Get hotel reviews | ❌ |
| POST | `/reviews/hotel/:hotelId` | Submit review | ✅ |
| POST | `/reviews/:id/helpful` | Vote review helpful | ✅ |
| DELETE | `/reviews/:id` | Delete review | ✅ |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/dashboard` | Dashboard analytics | ✅ Admin |
| GET | `/admin/users` | All users | ✅ Admin |
| PATCH | `/admin/users/:id` | Update user status | ✅ Admin |

### Recommendation Endpoint

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/recommendations` | AI-based recommendations | ❌ (personalized if logged in) |

---

## 🗃️ Database Models

### User Schema
```
name, email, password (hashed), role (user/admin),
avatar, phone, dateOfBirth, nationality, address,
wishlist[], preferences{budget, travelStyle[]},
searchHistory[], notifications{}, isActive,
resetPasswordToken, lastLogin, loginCount
```

### Hotel Schema
```
name, slug, description, propertyType, starRating,
location{address, city, country, coordinates(GeoJSON)},
images[], coverImage, amenities{general, dining, services},
rooms[{roomType, pricePerNight, maxGuests, bedType}],
ratings{overall, cleanliness, location, service},
policies{checkIn, checkOut, cancellation},
isFeatured, isVerified, totalBookings, totalRevenue
```

### Booking Schema
```
bookingRef (auto), bookingType (hotel/flight/package),
user, hotel, flight, package, room{},
checkIn, checkOut, nights, guests{adults, children},
primaryGuest{name, email, phone},
pricing{basePrice, taxes, fees, totalAmount},
payment{method, status, transactionId},
status (pending/confirmed/cancelled/completed),
cancellation{isCancelled, reason, refundAmount}
```

### Flight Schema
```
flightNumber, airline{name, code, logo},
origin{city, airport, airportCode, terminal},
destination{city, airport, airportCode},
departureTime, arrivalTime, duration{hours, minutes},
seats{economy, business, firstClass}{total, available, price},
baggage{carryOn, checkedBaggage}, meals, wifi, status
```

### TravelPackage Schema
```
title, slug, description, destination{city, country},
duration{days, nights}, packageType, pricing{perPerson, originalPrice},
includes{flights, accommodation, meals, transfers, guide},
itinerary[{day, title, activities[], meals{}}],
highlights[], images[], ratings, isFeatured, isBestSeller
```

### Review Schema
```
user, hotel, booking, title, review,
ratings{overall, cleanliness, location, service, valueForMoney},
tripType, photos[], helpfulVotes[],
managementResponse{}, isVerified
```

---

## 🔒 Authentication Flow
```
1. User registers → Password hashed with bcrypt (12 rounds)
2. User logs in   → JWT token generated (30 day expiry)
3. Token stored   → localStorage (client side)
4. API requests   → Token sent in Authorization: Bearer header
5. Middleware     → Verifies token on protected routes
6. Role check     → Admin routes require role === 'admin'
7. Token expired  → Auto redirect to /login
```

---

## 🎨 UI Design System

### Color Palette
```css
--color-primary:     #0ea5e9   /* Ocean Blue */
--color-accent:      #f59e0b   /* Sand Gold */
--color-coral:       #ec4899   /* Coral Pink */
--bg-dark:           #0f172a   /* Deep Navy */
--bg-card:           #1e293b   /* Card Dark */
--border-dark:       #334155   /* Subtle Border */
```

### Design Patterns Used
- **Glassmorphism** — Frosted glass cards with backdrop blur
- **Dark Theme** — Deep navy backgrounds throughout
- **Gradient Text** — Ocean to purple to coral gradients
- **Skeleton Loading** — Shimmer animations during data fetch
- **Hover Animations** — Card lift, image zoom, glow effects
- **Page Transitions** — Framer Motion fade and slide animations

---

## 📱 Pages & Routes

| Route | Page | Auth |
|-------|------|------|
| `/` | Home — Hero, Search, Featured | Public |
| `/hotels` | Hotel listing with filters | Public |
| `/hotels/:id` | Hotel detail, rooms, reviews | Public |
| `/flights` | Flight search | Public |
| `/packages` | Package explorer | Public |
| `/packages/:id` | Package detail + itinerary | Public |
| `/booking/:type/:id` | Multi-step checkout | 🔐 Login |
| `/booking/confirm/:id` | Booking confirmation | 🔐 Login |
| `/dashboard/bookings` | My bookings | 🔐 Login |
| `/dashboard/wishlist` | Saved hotels | 🔐 Login |
| `/dashboard/profile` | Profile settings | 🔐 Login |
| `/admin` | Admin overview + charts | 👑 Admin |
| `/admin/hotels` | Hotel management | 👑 Admin |
| `/admin/bookings` | All bookings | 👑 Admin |
| `/admin/users` | User management | 👑 Admin |
| `/login` | Login page | Public |
| `/register` | Register page | Public |
| `/contact` | Contact form | Public |

---

## 🚢 Deployment

### Deploy Backend to Railway / Render
```bash
# 1. Push to GitHub
git add . && git commit -m "Initial commit" && git push

# 2. Connect repo to Railway or Render
# 3. Set environment variables in dashboard
# 4. Deploy — auto builds on push
```

### Deploy Frontend to Vercel / Netlify
```bash
# Install Vercel CLI
npm i -g vercel

cd client
vercel

# Set environment variable
# VITE_API_URL = https://your-backend-url.railway.app/api
```

### Deploy MongoDB to Atlas (Cloud)
```
1. Create free account at mongodb.com/atlas
2. Create a cluster (M0 Free Tier)
3. Create database user
4. Whitelist IP address (0.0.0.0/0 for all)
5. Get connection string
6. Replace MONGO_URI in .env
```

### Docker Deployment (Optional)
```dockerfile
# server/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "index.js"]
```
```yaml
# docker-compose.yml
version: '3.8'
services:
  server:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=mongodb://mongo:27017/travel-platform
      - JWT_SECRET=your_secret
    depends_on:
      - mongo

  client:
    build: ./client
    ports:
      - "3000:80"

  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"

volumes:
  mongo_data:
```

---

## 🧪 Testing the API

You can test all API endpoints using the Postman collection or curl:
```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Password@123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"Password@123"}'

# Get all hotels
curl http://localhost:5000/api/hotels

# Search hotels in Bali
curl "http://localhost:5000/api/hotels?city=Bali&limit=5"

# Get featured hotels
curl http://localhost:5000/api/hotels/featured

# Search flights
curl "http://localhost:5000/api/flights?from=New York&to=London"

# Get travel packages
curl http://localhost:5000/api/packages

# Health check
curl http://localhost:5000/api/health
```

---

## 🐛 Common Issues & Fixes

### MongoDB Connection Failed
```bash
# Make sure MongoDB is running
sudo systemctl start mongod      # Linux
brew services start mongodb-community  # macOS
net start MongoDB                # Windows
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9   # macOS/Linux
netstat -ano | findstr :5000    # Windows
```

### CORS Error
```bash
# Make sure CLIENT_URL in server .env matches your frontend URL exactly
CLIENT_URL=http://localhost:5173
```

### Module Not Found
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### JWT Token Expired
```bash
# Clear localStorage in browser console
localStorage.clear()
# Then log in again
```

---

## 📊 Project Stats

| Metric | Count |
|--------|-------|
| Total Files | 40+ |
| React Components | 25+ |
| API Endpoints | 35+ |
| Database Models | 6 |
| Redux Slices | 6 |
| Pages | 14 |
| Lines of Code | 5000+ |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feature/AmazingFeature

# 3. Commit your changes
git commit -m 'Add some AmazingFeature'

# 4. Push to the branch
git push origin feature/AmazingFeature

# 5. Open a Pull Request
```

---

## 📄 License

This project is licensed under the **MIT License**.
```
MIT License

Copyright (c) 2024 TravelPlatform

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [yourprofile](https://linkedin.com/in/yourprofile)
- Email: your@email.com

---

## 🙏 Acknowledgements

- [Unsplash](https://unsplash.com) — Beautiful travel photography
- [Lucide Icons](https://lucide.dev) — Clean icon library
- [Tailwind CSS](https://tailwindcss.com) — Utility-first CSS
- [Framer Motion](https://framer.com/motion) — Fluid animations
- [Recharts](https://recharts.org) — React chart library
- [MongoDB Atlas](https://mongodb.com/atlas) — Cloud database

---

<div align="center">

**⭐ Star this repo if you found it helpful!**

Made with ❤️ for travelers everywhere

</div>
