// ============================================================
// Hotel Model - MongoDB Schema
// ============================================================
const mongoose = require('mongoose');

// Room sub-schema
const roomSchema = new mongoose.Schema({
  roomType: {
    type: String,
    required: true,
    enum: ['Standard', 'Deluxe', 'Suite', 'Executive', 'Presidential', 'Family', 'Studio'],
  },
  roomNumber: String,
  description: String,
  pricePerNight: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  },
  maxGuests: {
    type: Number,
    required: true,
    min: 1,
  },
  bedType: {
    type: String,
    enum: ['Single', 'Double', 'Queen', 'King', 'Twin', 'Bunk'],
  },
  size: Number, // sq ft
  amenities: [String],
  images: [
    {
      public_id: String,
      url: String,
    },
  ],
  isAvailable: {
    type: Boolean,
    default: true,
  },
  totalRooms: {
    type: Number,
    default: 1,
  },
});

// Hotel Schema
const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hotel name is required'],
      trim: true,
      maxlength: [100, 'Hotel name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Hotel description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    shortDescription: {
      type: String,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
    },
    propertyType: {
      type: String,
      required: true,
      enum: ['Hotel', 'Resort', 'Villa', 'Apartment', 'Hostel', 'Boutique Hotel', 'Lodge', 'Guesthouse'],
    },
    starRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    // Location details
    location: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
        index: true,
      },
      state: String,
      country: {
        type: String,
        required: true,
      },
      zipCode: String,
      // GeoJSON for map integration
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: [0, 0],
        },
      },
      nearbyAttractions: [
        {
          name: String,
          distance: String, // e.g., "2.5 km"
          type: String, // museum, beach, airport, etc.
        },
      ],
    },
    // Main hotel images
    images: [
      {
        public_id: String,
        url: {
          type: String,
          required: true,
        },
        caption: String,
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    // Thumbnail/cover image
    coverImage: {
      public_id: String,
      url: String,
    },
    // Hotel amenities
    amenities: {
      general: [String],  // WiFi, Parking, Pool, Gym, etc.
      dining: [String],   // Restaurant, Bar, Room Service
      services: [String], // Concierge, Laundry, 24hr Reception
      recreation: [String], // Pool, Spa, Tennis Court
      business: [String], // Conference Room, Business Center
    },
    // Rooms
    rooms: [roomSchema],
    // Pricing
    priceRange: {
      min: Number,
      max: Number,
    },
    // Ratings
    ratings: {
      overall: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      cleanliness: { type: Number, default: 0 },
      location: { type: Number, default: 0 },
      service: { type: Number, default: 0 },
      valueForMoney: { type: Number, default: 0 },
      facilities: { type: Number, default: 0 },
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    // Policies
    policies: {
      checkIn: {
        type: String,
        default: '3:00 PM',
      },
      checkOut: {
        type: String,
        default: '11:00 AM',
      },
      cancellation: {
        type: String,
        enum: ['Free', 'Flexible', 'Moderate', 'Strict', 'Non-Refundable'],
        default: 'Flexible',
      },
      cancellationDetails: String,
      petPolicy: {
        type: String,
        enum: ['Allowed', 'Not Allowed', 'On Request'],
        default: 'Not Allowed',
      },
      smokingPolicy: {
        type: String,
        enum: ['Allowed', 'Not Allowed', 'Designated Areas'],
        default: 'Not Allowed',
      },
      ageRestriction: {
        type: Number,
        default: 18,
      },
    },
    // Contact information
    contact: {
      phone: String,
      email: String,
      website: String,
    },
    // Featured flags
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Tags for search
    tags: [String],
    // Managed by
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Booking stats
    totalBookings: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────────
hotelSchema.index({ 'location.coordinates': '2dsphere' });
hotelSchema.index({ 'location.city': 1, 'ratings.overall': -1 });
hotelSchema.index({ slug: 1 });
hotelSchema.index({ isFeatured: 1, isActive: 1 });
hotelSchema.index({ name: 'text', 'location.city': 'text', tags: 'text' });

// ─── Virtual Fields ──────────────────────────────────────────
hotelSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'hotel',
});

// ─── Pre-save Middleware ─────────────────────────────────────
// Auto-generate slug from name
hotelSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      + '-' + Date.now();
  }

  // Auto-calculate price range from rooms
  if (this.rooms && this.rooms.length > 0) {
    const prices = this.rooms.map((r) => r.pricePerNight);
    this.priceRange = {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }

  next();
});

// ─── Static Methods ──────────────────────────────────────────
// Search hotels with filters
hotelSchema.statics.searchHotels = async function (filters) {
  const {
    city,
    checkIn,
    checkOut,
    guests,
    minPrice,
    maxPrice,
    starRating,
    propertyType,
    amenities,
    sortBy,
    page = 1,
    limit = 12,
  } = filters;

  const query = { isActive: true };

  if (city) {
    query.$or = [
      { 'location.city': { $regex: city, $options: 'i' } },
      { 'location.country': { $regex: city, $options: 'i' } },
      { name: { $regex: city, $options: 'i' } },
    ];
  }

  if (minPrice || maxPrice) {
    query['priceRange.min'] = {};
    if (minPrice) query['priceRange.min'].$gte = Number(minPrice);
    if (maxPrice) query['priceRange.min'].$lte = Number(maxPrice);
  }

  if (starRating) {
    query.starRating = { $gte: Number(starRating) };
  }

  if (propertyType) {
    query.propertyType = propertyType;
  }

  if (amenities && amenities.length > 0) {
    query['amenities.general'] = { $all: amenities };
  }

  // Sorting options
  let sort = {};
  switch (sortBy) {
    case 'price_asc':
      sort = { 'priceRange.min': 1 };
      break;
    case 'price_desc':
      sort = { 'priceRange.min': -1 };
      break;
    case 'rating':
      sort = { 'ratings.overall': -1 };
      break;
    case 'popularity':
      sort = { totalBookings: -1 };
      break;
    default:
      sort = { isFeatured: -1, 'ratings.overall': -1 };
  }

  const skip = (page - 1) * limit;

  const [hotels, total] = await Promise.all([
    this.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .select('-rooms -__v'),
    this.countDocuments(query),
  ]);

  return {
    hotels,
    total,
    pages: Math.ceil(total / limit),
    currentPage: Number(page),
  };
};

module.exports = mongoose.model('Hotel', hotelSchema);