// ============================================================
// Flight Controller
// ============================================================
const Flight = require('../models/Flight');
const asyncHandler = require('express-async-handler');

const searchFlights = asyncHandler(async (req, res) => {
  const {
    from,
    to,
    date,
    returnDate,
    passengers = 1,
    flightClass = 'Economy',
    sortBy = 'price',
    page = 1,
    limit = 10,
  } = req.query;

  const query = { isActive: true, status: 'scheduled' };

  if (from) {
    query.$or = [
      { 'origin.airportCode': { $regex: from, $options: 'i' } },
      { 'origin.city': { $regex: from, $options: 'i' } },
    ];
  }

  if (to) {
    const toQuery = [
      { 'destination.airportCode': { $regex: to, $options: 'i' } },
      { 'destination.city': { $regex: to, $options: 'i' } },
    ];
    if (query.$or) {
      query.$and = [{ $or: query.$or }, { $or: toQuery }];
      delete query.$or;
    } else {
      query.$or = toQuery;
    }
  }

  if (date) {
    const searchDate = new Date(date);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    query.departureTime = { $gte: searchDate, $lt: nextDay };
  }

  let sort = {};
  switch (sortBy) {
    case 'price': sort = { basePrice: 1 }; break;
    case 'duration': sort = { 'duration.total': 1 }; break;
    case 'departure': sort = { departureTime: 1 }; break;
    default: sort = { basePrice: 1 };
  }

  const skip = (page - 1) * limit;

  const [flights, total] = await Promise.all([
    Flight.find(query).sort(sort).skip(skip).limit(Number(limit)),
    Flight.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    flights,
    total,
    pages: Math.ceil(total / limit),
  });
});

const getPopularRoutes = asyncHandler(async (req, res) => {
  const routes = await Flight.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: { from: '$origin.city', to: '$destination.city' },
        minPrice: { $min: '$basePrice' },
        count: { $sum: 1 },
        airline: { $first: '$airline.name' },
        fromCode: { $first: '$origin.airportCode' },
        toCode: { $first: '$destination.airportCode' },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ]);

  res.status(200).json({ success: true, routes });
});

const createFlight = asyncHandler(async (req, res) => {
  const flight = await Flight.create(req.body);
  res.status(201).json({ success: true, message: 'Flight created', flight });
});

const updateFlight = asyncHandler(async (req, res) => {
  const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!flight) { res.status(404); throw new Error('Flight not found'); }
  res.status(200).json({ success: true, flight });
});

const deleteFlight = asyncHandler(async (req, res) => {
  await Flight.findByIdAndUpdate(req.params.id, { isActive: false });
  res.status(200).json({ success: true, message: 'Flight removed' });
});

module.exports = { searchFlights, getPopularRoutes, createFlight, updateFlight, deleteFlight };