// ============================================================
// Utility Helper Functions
// ============================================================
import { format, differenceInDays, parseISO, isValid } from 'date-fns';

// ─── Date Helpers ─────────────────────────────────────────────
export const formatDate = (date, fmt = 'MMM dd, yyyy') => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? format(d, fmt) : '';
};

export const formatDateShort = (date) => formatDate(date, 'dd MMM');

export const formatDateTime = (date) => formatDate(date, 'MMM dd, yyyy HH:mm');

export const calcNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  return Math.max(0, differenceInDays(new Date(checkOut), new Date(checkIn)));
};

export const formatDuration = (hours, minutes) => {
  if (!hours && !minutes) return '';
  const h = hours ? `${hours}h` : '';
  const m = minutes ? ` ${minutes}m` : '';
  return `${h}${m}`.trim();
};

// ─── Price Helpers ────────────────────────────────────────────
export const formatPrice = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calcTotalPrice = (pricePerNight, nights, taxRate = 0.12) => {
  const base = pricePerNight * nights;
  const taxes = base * taxRate;
  const fees = 25; // Fixed service fee
  return {
    base,
    taxes: Math.round(taxes),
    fees,
    total: Math.round(base + taxes + fees),
  };
};

export const calcDiscount = (original, current) => {
  if (!original || !current || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
};

// ─── String Helpers ───────────────────────────────────────────
export const truncate = (str, len = 100) => {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const slugify = (str) =>
  str.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-');

// ─── Rating Helpers ───────────────────────────────────────────
export const getRatingLabel = (rating) => {
  if (rating >= 4.8) return 'Exceptional';
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 4.0) return 'Very Good';
  if (rating >= 3.5) return 'Good';
  if (rating >= 3.0) return 'Fair';
  return 'Poor';
};

export const getRatingColor = (rating) => {
  if (rating >= 4.5) return 'text-emerald-400';
  if (rating >= 4.0) return 'text-ocean';
  if (rating >= 3.5) return 'text-sand';
  return 'text-slate-400';
};

export const getStars = (count) => {
  return Array.from({ length: 5 }, (_, i) => i < count ? 'filled' : 'empty');
};

// ─── Booking Helpers ──────────────────────────────────────────
export const getBookingStatusColor = (status) => {
  const colors = {
    confirmed: 'badge-success',
    pending: 'badge-gold',
    cancelled: 'badge-error',
    checked_in: 'badge-ocean',
    completed: 'text-slate-400 bg-slate-500/10 border border-slate-500/25',
    no_show: 'badge-error',
  };
  return colors[status] || 'badge-ocean';
};

export const getBookingStatusLabel = (status) => {
  const labels = {
    confirmed: 'Confirmed',
    pending: 'Pending',
    cancelled: 'Cancelled',
    checked_in: 'Checked In',
    checked_out: 'Checked Out',
    completed: 'Completed',
    no_show: 'No Show',
  };
  return labels[status] || status;
};

// ─── Image Helpers ────────────────────────────────────────────
export const getHotelImage = (hotel) => {
  return hotel?.coverImage?.url
    || hotel?.images?.[0]?.url
    || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600';
};

export const getPackageImage = (pkg) => {
  return pkg?.coverImage?.url
    || pkg?.images?.[0]?.url
    || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600';
};

// ─── Validation Helpers ───────────────────────────────────────
export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPhone = (phone) =>
  /^[\+]?[0-9]{10,15}$/.test(phone.replace(/\s/g, ''));

export const isStrongPassword = (password) =>
  password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);

// ─── Array Helpers ────────────────────────────────────────────
export const uniqueBy = (arr, key) =>
  arr.filter((item, idx, self) => idx === self.findIndex(t => t[key] === item[key]));

export const groupBy = (arr, key) =>
  arr.reduce((acc, item) => {
    const group = item[key];
    acc[group] = acc[group] ? [...acc[group], item] : [item];
    return acc;
  }, {});

// ─── Local Storage ────────────────────────────────────────────
export const getFromStorage = (key, fallback = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
};

// ─── URL Helpers ──────────────────────────────────────────────
export const buildQueryString = (params) =>
  Object.entries(params)
    .filter(([, v]) => v !== '' && v !== null && v !== undefined)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

export const parseQueryString = (search) => {
  const params = new URLSearchParams(search);
  return Object.fromEntries(params.entries());
};