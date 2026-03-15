import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  BookOpen, Heart, User, Settings, LogOut,
  Calendar, MapPin, Clock, X, ChevronRight,
  Hotel, Plane, Package, Bell, Shield,
} from 'lucide-react';
import { fetchMyBookings, cancelBooking } from '../store/slices/bookingSlice';
import { updateProfile, logout, selectUser } from '../store/slices/authSlice';
import {
  formatPrice, formatDate, getBookingStatusColor,
  getBookingStatusLabel, getHotelImage,
} from '../utils/helpers';
import api from '../utils/api';

// ── Sidebar ────────────────────────────────────────────────────
function Sidebar({ active }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const NAV = [
    { id: 'bookings',  label: 'My Bookings', icon: BookOpen, to: '/dashboard/bookings' },
    { id: 'wishlist',  label: 'Wishlist',     icon: Heart,    to: '/dashboard/wishlist' },
    { id: 'profile',   label: 'Profile',      icon: User,     to: '/dashboard/profile' },
    { id: 'settings',  label: 'Settings',     icon: Settings, to: '/dashboard/settings' },
  ];

  return (
    <aside className="w-64 shrink-0">
      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden sticky top-24">
        <div className="p-5 border-b border-dark-border">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=0ea5e9&color=fff&size=80`}
              alt={user?.name}
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div>
              <p className="text-white font-semibold text-sm line-clamp-1">{user?.name}</p>
              <p className="text-slate-500 text-xs line-clamp-1">{user?.email}</p>
            </div>
          </div>
        </div>
        <nav className="p-2">
          {NAV.map(({ id, label, icon: Icon, to }) => (
            <Link
              key={id}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                active === id
                  ? 'bg-ocean/15 text-ocean'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          <button
            onClick={() => { dispatch(logout()); navigate('/'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all mt-2 border-t border-dark-border pt-4"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </nav>
      </div>
    </aside>
  );
}

// ── Bookings Tab ───────────────────────────────────────────────
function BookingsTab() {
  const dispatch = useDispatch();
  const { myBookings, loading } = useSelector(s => s.bookings);
  const [cancelId, setCancelId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { dispatch(fetchMyBookings()); }, [dispatch]);

  const handleCancel = async () => {
    if (!cancelId) return;
    await dispatch(cancelBooking({ id: cancelId, reason: cancelReason }));
    setCancelId(null);
    setCancelReason('');
    dispatch(fetchMyBookings());
  };

  const filtered = filter === 'all' ? myBookings : myBookings.filter(b => b.status === filter);

  const FILTER_TABS = [
    { val: 'all',       label: 'All' },
    { val: 'confirmed', label: 'Confirmed' },
    { val: 'cancelled', label: 'Cancelled' },
    { val: 'completed', label: 'Completed' },
  ];

  const BookingTypeIcon = ({ type }) => {
    if (type === 'hotel')   return <Hotel size={16} className="text-ocean" />;
    if (type === 'flight')  return <Plane size={16} className="text-ocean" />;
    return <Package size={16} className="text-ocean" />;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">My Bookings</h2>
        <Link to="/hotels" className="btn-primary text-sm py-2 px-4">+ New Booking</Link>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {FILTER_TABS.map(({ val, label }) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap border transition-all ${
              filter === val ? 'bg-ocean/15 text-ocean border-ocean/30' : 'bg-dark-card border-dark-border text-slate-400 hover:border-ocean/30'
            }`}
          >
            {label}
            {val === 'all' && myBookings.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-ocean/20 text-ocean text-xs rounded-full">{myBookings.length}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-dark-card border border-dark-border rounded-2xl">
          <BookOpen size={40} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No bookings yet</h3>
          <p className="text-slate-400 mb-6 text-sm">Your travel adventures start here</p>
          <Link to="/hotels" className="btn-primary inline-flex">Browse Hotels</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <motion.div
              key={booking._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-card border border-dark-border rounded-2xl p-5 hover:border-ocean/20 transition-all"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <img
                  src={
                    booking.hotel?.coverImage?.url ||
                    booking.package?.coverImage?.url ||
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'
                  }
                  alt=""
                  className="w-full md:w-32 h-32 md:h-24 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <BookingTypeIcon type={booking.bookingType} />
                        <p className="text-white font-semibold text-base line-clamp-1">
                          {booking.hotel?.name || booking.flight?.flightNumber || booking.package?.title}
                        </p>
                      </div>
                      <p className="text-slate-500 text-xs flex items-center gap-1">
                        <MapPin size={11} />
                        {booking.hotel?.location?.city || booking.package?.destination?.city || 'N/A'}
                      </p>
                    </div>
                    <span className={`badge text-xs shrink-0 ${getBookingStatusColor(booking.status)}`}>
                      {getBookingStatusLabel(booking.status)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-slate-400 mb-3">
                    {booking.checkIn && (
                      <span className="flex items-center gap-1">
                        <Calendar size={11} className="text-ocean" />
                        {formatDate(booking.checkIn)} — {formatDate(booking.checkOut)}
                      </span>
                    )}
                    {booking.nights && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} className="text-ocean" />
                        {booking.nights} nights
                      </span>
                    )}
                    <span className="text-slate-600">Ref: {booking.bookingRef}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold text-lg">{formatPrice(booking.pricing?.totalAmount)}</p>
                      <p className="text-slate-500 text-xs">Total paid</p>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/booking/confirm/${booking._id}`} className="btn-secondary text-xs py-1.5 px-3">
                        View Details
                      </Link>
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => setCancelId(booking._id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-medium border border-red-500/25 text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Cancel modal */}
      <AnimatePresence>
        {cancelId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark-card border border-dark-border rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-white font-bold text-lg mb-2">Cancel Booking</h3>
              <p className="text-slate-400 text-sm mb-4">
                Are you sure? Cancellation may be subject to fees based on our policy.
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation (optional)"
                rows={3}
                className="input resize-none mb-4 text-sm"
              />
              <div className="flex gap-3">
                <button onClick={() => setCancelId(null)} className="btn-ghost flex-1 py-2.5">Keep Booking</button>
                <button onClick={handleCancel} className="flex-1 py-2.5 px-4 bg-red-500/15 text-red-400 border border-red-500/25 rounded-xl font-medium text-sm hover:bg-red-500/25 transition-all">
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Wishlist Tab ────────────────────────────────────────────────
function WishlistTab() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    api.get('/users/wishlist').then(({ data }) => {
      setWishlist(data.wishlist || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleRemove = async (hotelId) => {
    const { toggleWishlist } = await import('../store/slices/authSlice');
    dispatch(toggleWishlist(hotelId));
    setWishlist(w => w.filter(h => h._id !== hotelId));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">My Wishlist</h2>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-20 bg-dark-card border border-dark-border rounded-2xl">
          <Heart size={40} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">Your wishlist is empty</h3>
          <p className="text-slate-400 mb-6 text-sm">Save hotels you love and book them later</p>
          <Link to="/hotels" className="btn-primary inline-flex">Explore Hotels</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wishlist.map((hotel) => (
            <div key={hotel._id} className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden flex hover:border-ocean/20 transition-all">
              <img
                src={hotel.coverImage?.url || getHotelImage(hotel)}
                alt={hotel.name}
                className="w-32 h-full object-cover shrink-0"
              />
              <div className="p-4 flex-1">
                <h3 className="text-white font-semibold text-sm line-clamp-1 mb-1">{hotel.name}</h3>
                <p className="text-slate-500 text-xs flex items-center gap-1 mb-2">
                  <MapPin size={10} />{hotel.location?.city}
                </p>
                <p className="text-white font-bold">{formatPrice(hotel.priceRange?.min)}<span className="text-slate-500 text-xs font-normal">/night</span></p>
                <div className="flex gap-2 mt-3">
                  <Link to={`/hotels/${hotel.slug || hotel._id}`} className="btn-primary text-xs py-1.5 px-3 flex-1 text-center">
                    View
                  </Link>
                  <button
                    onClick={() => handleRemove(hotel._id)}
                    className="p-1.5 rounded-lg border border-dark-border text-slate-400 hover:text-red-400 hover:border-red-400/30 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Profile Tab ────────────────────────────────────────────────
function ProfileTab() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [form, setForm] = useState({
    name:        user?.name || '',
    phone:       user?.phone || '',
    nationality: user?.nationality || '',
    dateOfBirth: user?.dateOfBirth?.split('T')[0] || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await dispatch(updateProfile(form));
    setSaving(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Profile Settings</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 text-center">
          <img
            src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=0ea5e9&color=fff&size=200`}
            alt={user?.name}
            className="w-24 h-24 rounded-2xl mx-auto mb-4 object-cover"
          />
          <p className="text-white font-semibold">{user?.name}</p>
          <p className="text-slate-500 text-sm">{user?.email}</p>
          <span className={`badge text-xs mt-2 inline-flex ${user?.role === 'admin' ? 'badge-gold' : 'badge-ocean'}`}>
            {user?.role === 'admin' ? '⚡ Admin' : '✓ Member'}
          </span>
        </div>

        <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              { key: 'name',        label: 'Full Name',    type: 'text' },
              { key: 'phone',       label: 'Phone Number', type: 'tel' },
              { key: 'nationality', label: 'Nationality',  type: 'text' },
              { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className="input-label">{label}</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className={`input ${type === 'date' ? '[color-scheme:dark]' : ''}`}
                />
              </div>
            ))}
          </div>

          <div className="mb-4">
            <label className="input-label">Email Address</label>
            <input value={user?.email} disabled className="input opacity-50 cursor-not-allowed" />
            <p className="text-xs text-slate-600 mt-1">Email cannot be changed</p>
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <div className="spinner w-4 h-4 border-2" /> : null}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────
export default function DashboardPage() {
  const location = useLocation();
  const active = location.pathname.split('/')[2] || 'bookings';

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container-custom py-8">
        <div className="flex gap-6">
          <div className="hidden lg:block">
            <Sidebar active={active} />
          </div>
          <div className="flex-1 min-w-0">
            <Routes>
              <Route path="bookings" element={<BookingsTab />} />
              <Route path="wishlist" element={<WishlistTab />} />
              <Route path="profile"  element={<ProfileTab />} />
              <Route path="settings" element={<ProfileTab />} />
              <Route path="*"        element={<BookingsTab />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}