const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');
const TravelPackage = require('../models/TravelPackage');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { destination, budget } = req.query;
    let hotelQuery = { isActive: true };
    let packageQuery = { isActive: true };

    if (destination) {
      hotelQuery['location.city'] = { $regex: destination, $options: 'i' };
      packageQuery['destination.city'] = { $regex: destination, $options: 'i' };
    }

    if (budget) {
      const budgetMap = {
        budget: { min: 0, max: 80 },
        'mid-range': { min: 80, max: 200 },
        luxury: { min: 200, max: 500 },
        'ultra-luxury': { min: 500, max: 99999 },
      };
      const range = budgetMap[budget];
      if (range) {
        hotelQuery['priceRange.min'] = { $gte: range.min, $lte: range.max };
      }
    }

    if (req.user?.preferences?.preferredDestinations?.length > 0 && !destination) {
      const prefDests = req.user.preferences.preferredDestinations;
      hotelQuery['location.city'] = { $in: prefDests.map(d => new RegExp(d, 'i')) };
    }

    const [hotels, packages, trending] = await Promise.all([
      Hotel.find(hotelQuery).sort({ 'ratings.overall': -1, isFeatured: -1 }).limit(6)
        .select('name slug location coverImage ratings priceRange starRating propertyType'),
      TravelPackage.find(packageQuery).sort({ bookingCount: -1, isFeatured: -1 }).limit(4)
        .select('title slug destination coverImage pricing duration packageType ratings'),
      Hotel.find({ isActive: true, isFeatured: true }).sort({ totalBookings: -1 }).limit(4)
        .select('name slug location coverImage ratings priceRange'),
    ]);

    res.json({
      success: true,
      recommendations: {
        hotels,
        packages,
        trending,
        basedOn: req.user ? 'personalized' : 'popular',
        destination: destination || null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;