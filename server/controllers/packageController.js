// ============================================================
// Travel Package Controller
// ============================================================
const TravelPackage = require('../models/TravelPackage');
const asyncHandler = require('express-async-handler');

const getPackages = asyncHandler(async (req, res) => {
  const { destination, packageType, minPrice, maxPrice, duration, page = 1, limit = 12, sortBy } = req.query;

  const query = { isActive: true };
  if (destination) query['destination.city'] = { $regex: destination, $options: 'i' };
  if (packageType) query.packageType = packageType;
  if (minPrice || maxPrice) {
    query['pricing.perPerson'] = {};
    if (minPrice) query['pricing.perPerson'].$gte = Number(minPrice);
    if (maxPrice) query['pricing.perPerson'].$lte = Number(maxPrice);
  }
  if (duration) query['duration.days'] = { $lte: Number(duration) };

  let sort = { isFeatured: -1, isBestSeller: -1, bookingCount: -1 };
  if (sortBy === 'price_asc') sort = { 'pricing.perPerson': 1 };
  if (sortBy === 'price_desc') sort = { 'pricing.perPerson': -1 };
  if (sortBy === 'rating') sort = { 'ratings.overall': -1 };

  const [packages, total] = await Promise.all([
    TravelPackage.find(query).sort(sort).skip((page - 1) * limit).limit(Number(limit)),
    TravelPackage.countDocuments(query),
  ]);

  res.status(200).json({ success: true, packages, total, pages: Math.ceil(total / limit) });
});

const getFeaturedPackages = asyncHandler(async (req, res) => {
  const packages = await TravelPackage.find({ isFeatured: true, isActive: true })
    .sort({ bookingCount: -1 }).limit(6);
  res.status(200).json({ success: true, packages });
});

// server/controllers/packageController.js — getPackage
// Support both slug and _id lookup:

const getPackage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Try ObjectId first, then slug
  let pkg;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    pkg = await TravelPackage.findById(id);
  }
  if (!pkg) {
    pkg = await TravelPackage.findOne({ slug: id });
  }

  if (!pkg || !pkg.isActive) {
    res.status(404);
    throw new Error('Package not found');
  }

  res.status(200).json({ success: true, package: pkg });
});

const createPackage = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user._id;
  const pkg = await TravelPackage.create(req.body);
  res.status(201).json({ success: true, message: 'Package created', package: pkg });
});

const updatePackage = asyncHandler(async (req, res) => {
  const pkg = await TravelPackage.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!pkg) { res.status(404); throw new Error('Package not found'); }
  res.status(200).json({ success: true, package: pkg });
});

const deletePackage = asyncHandler(async (req, res) => {
  await TravelPackage.findByIdAndUpdate(req.params.id, { isActive: false });
  res.status(200).json({ success: true, message: 'Package removed' });
});

module.exports = { getPackages, getFeaturedPackages, getPackage, createPackage, updatePackage, deletePackage };