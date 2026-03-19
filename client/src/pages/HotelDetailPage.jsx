// client/src/pages/HotelDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  MapPin, Star, Wifi, Car, Waves, UtensilsCrossed,
  ChevronLeft, ChevronRight, X, Heart, Share2,
  Check, Clock, AlertCircle, Users, Calendar,
  Coffee, Dumbbell, ShieldCheck, Phone,
} from 'lucide-react';
import {
  toggleWishlist,
  selectIsAuthenticated,
  selectWishlist,
} from '../store/slices/authSlice';
import {
  formatPrice, formatDate, calcNights,
  calcTotalPrice, getRatingLabel,
} from '../utils/helpers';
import StarRating from '../components/common/StarRating';
import api        from '../utils/api';
import toast      from 'react-hot-toast';

// ── Image Gallery Modal ───────────────────────────────────────
function GalleryModal({ images, startIdx, onClose }) {
  const [current, setCurrent] = useState(startIdx);

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape')     onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-xl glass text-white hover:bg-white/10 z-10"
      >
        <X size={22} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); prev(); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-xl glass text-white hover:bg-white/10 z-10"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); next(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-xl glass text-white hover:bg-white/10 z-10"
      >
        <ChevronRight size={24} />
      </button>
      <div
        className="w-full max-w-5xl max-h-[85vh] px-16"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[current]?.url}
          alt={`Gallery ${current + 1}`}
          className="w-full h-full object-contain rounded-2xl"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
          }}
        />
        <p className="text-center text-slate-400 text-sm mt-3">
          {current + 1} / {images.length}
        </p>
      </div>
    </motion.div>
  );
}

// ── Room Card ─────────────────────────────────────────────────
function RoomCard({ room, nights, onBook }) {
  const totalPrice = room.pricePerNight * (nights || 1);

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex flex-col md:flex-row gap-5">
        {/* Room Image */}
        <div className="md:w-48 shrink-0">
          <div className="aspect-video bg-dark-card rounded-xl overflow-hidden">
            <img
              src={
                room.images?.[0]?.url ||
                'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400'
              }
              alt={room.roomType}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400';
              }}
            />
          </div>
        </div>

        {/* Room Details */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h4 className="text-white font-semibold text-lg">{room.roomType} Room</h4>
              <div className="flex flex-wrap gap-2 text-slate-400 text-xs mt-1">
                {room.bedType  && <span>🛏 {room.bedType} bed</span>}
                {room.maxGuests && <span>👥 Up to {room.maxGuests} guests</span>}
                {room.size     && <span>📐 {room.size} sq ft</span>}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-bold text-white">
                {formatPrice(room.pricePerNight)}
              </div>
              <div className="text-xs text-slate-500">per night</div>
              {nights > 1 && (
                <div className="text-sm text-ocean mt-0.5">
                  {formatPrice(totalPrice)} total
                </div>
              )}
            </div>
          </div>

          {/* Room Amenities */}
          {room.amenities?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {room.amenities.map((a) => (
                <span
                  key={a}
                  className="flex items-center gap-1 text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10"
                >
                  <Check size={10} className="text-emerald-400" />
                  {a}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={() => onBook(room)}
            className="btn-primary text-sm py-2 px-5"
          >
            Reserve This Room →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function HotelDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const isAuth     = useSelector(selectIsAuthenticated);
  const wishlist   = useSelector(selectWishlist);

  const [hotel,      setHotel]      = useState(null);
  const [reviews,    setReviews]    = useState([]);
  const [available,  setAvailable]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [gallery,    setGallery]    = useState({ open: false, idx: 0 });
  const [checkIn,    setCheckIn]    = useState('');
  const [checkOut,   setCheckOut]   = useState('');
  const [guests,     setGuests]     = useState(1);
  const [availLoading, setAvailLoading] = useState(false);

  // Wishlist check
  const isWishlisted = Array.isArray(wishlist) && hotel && wishlist.some(
    (wid) => wid === hotel._id || wid?.toString() === hotel._id?.toString()
  );

  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))
    : 0;

  // ── Fetch Hotel ────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);
    setHotel(null);

    console.log('Fetching hotel with id:', id);

    api.get(`/hotels/${id}`)
      .then(({ data }) => {
        console.log('Hotel data received:', data.hotel?.name);
        setHotel(data.hotel);
        setLoading(false);

        // Fetch reviews
        if (data.hotel?._id) {
          api.get(`/reviews/hotel/${data.hotel._id}`)
            .then(({ data: rData }) => setReviews(rData.reviews || []))
            .catch(() => setReviews([]));
        }
      })
      .catch((err) => {
        console.error('Hotel fetch error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Hotel not found');
        setLoading(false);
      });
  }, [id]);

  // ── Check Availability ─────────────────────────────────────
  useEffect(() => {
    if (!hotel?._id || !checkIn || !checkOut) {
      setAvailable(null);
      return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) return;

    setAvailLoading(true);
    api.get(`/hotels/${hotel._id}/availability`, {
      params: { checkIn, checkOut, guests },
    })
      .then(({ data }) => {
        setAvailable(data.availableRooms || []);
        setAvailLoading(false);
      })
      .catch(() => {
        setAvailable(null);
        setAvailLoading(false);
      });
  }, [hotel?._id, checkIn, checkOut, guests]);

  // ── Handlers ───────────────────────────────────────────────
  const handleWishlist = () => {
    if (!isAuth) {
      toast.error('Please sign in to save hotels');
      navigate('/login');
      return;
    }
    dispatch(toggleWishlist(hotel._id));
  };

  const handleBook = (room) => {
    if (!isAuth) {
      toast.error('Please sign in to book');
      navigate('/login');
      return;
    }
    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }
    navigate(`/booking/hotel/${hotel._id}`, {
      state: { hotel, room, checkIn, checkOut, nights, guests },
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: hotel?.name,
        url:   window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  // ── Loading State ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-dark-bg">
        <div className="container-custom py-8">
          <div className="skeleton h-6 w-32 rounded-xl mb-6" />
          <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[420px] mb-8">
            <div className="skeleton col-span-2 row-span-2" />
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="skeleton h-10 w-3/4 rounded-xl" />
              <div className="skeleton h-4 w-1/2 rounded" />
              <div className="skeleton h-24 rounded-xl" />
            </div>
            <div className="skeleton h-80 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────
  if (error || !hotel) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-dark-bg">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">🏨</div>
          <h2 className="text-2xl font-bold text-white mb-2">Hotel Not Found</h2>
          <p className="text-slate-400 mb-2">{error || 'This hotel could not be loaded.'}</p>
          <p className="text-slate-600 text-sm mb-6">ID: {id}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setLoading(true); setError(null); }}
              className="btn-secondary px-5 py-2.5"
            >
              Try Again
            </button>
            <Link to="/hotels" className="btn-primary px-5 py-2.5">
              Browse Hotels
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── All Images ─────────────────────────────────────────────
  const allImages = [
    ...(hotel.coverImage?.url ? [hotel.coverImage] : []),
    ...(hotel.images || []),
  ].filter((img) => img?.url);

  if (allImages.length === 0) {
    allImages.push({
      url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    });
  }

  const displayRooms = (checkIn && checkOut && available)
    ? available
    : hotel.rooms || [];

  return (
    <div className="min-h-screen pt-20 pb-16 bg-dark-bg">
      {/* Gallery Modal */}
      <AnimatePresence>
        {gallery.open && (
          <GalleryModal
            images={allImages}
            startIdx={gallery.idx}
            onClose={() => setGallery({ open: false, idx: 0 })}
          />
        )}
      </AnimatePresence>

      <div className="container-custom py-8">
        {/* Back */}
        <Link
          to="/hotels"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm transition-colors group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Hotels
        </Link>

        {/* ── Image Gallery Grid ─────────────────────────── */}
        <div
          className="grid gap-2 rounded-2xl overflow-hidden mb-8 cursor-pointer"
          style={{
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows:    'repeat(2, 160px)',
            height:              '340px',
          }}
        >
          {allImages.slice(0, 5).map((img, i) => (
            <div
              key={i}
              onClick={() => setGallery({ open: true, idx: i })}
              className={`relative overflow-hidden bg-dark-card hover:brightness-90 transition-all ${
                i === 0 ? 'col-span-2 row-span-2' : ''
              }`}
            >
              <img
                src={img.url}
                alt={`${hotel.name} ${i + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
                }}
              />
              {i === 4 && allImages.length > 5 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-white font-bold text-lg">+{allImages.length - 5}</p>
                    <p className="text-white/70 text-xs">more photos</p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Fill empty slots if fewer than 5 images */}
          {allImages.length < 5 && Array.from({ length: 5 - allImages.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="bg-dark-card border border-dark-border flex items-center justify-center"
            >
              <span className="text-slate-700 text-2xl">🏨</span>
            </div>
          ))}
        </div>

        {/* ── Main Layout ────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left: Details ─────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="badge-ocean text-xs capitalize">{hotel.propertyType}</span>
                    {hotel.isVerified && (
                      <span className="badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-xs">
                        <ShieldCheck size={10} className="mr-1" />
                        Verified
                      </span>
                    )}
                    {hotel.isFeatured && (
                      <span className="badge-gold text-xs">✦ Featured</span>
                    )}
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                    {hotel.name}
                  </h1>

                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <MapPin size={15} className="text-ocean shrink-0" />
                    <span>
                      {hotel.location?.address && `${hotel.location.address}, `}
                      {hotel.location?.city}, {hotel.location?.country}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={handleWishlist}
                    className={`p-2.5 rounded-xl border transition-all duration-300 ${
                      isWishlisted
                        ? 'bg-coral/15 text-coral border-coral/30'
                        : 'bg-dark-card border-dark-border text-slate-400 hover:text-coral hover:border-coral/30'
                    }`}
                    title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2.5 rounded-xl border border-dark-border bg-dark-card text-slate-400 hover:text-ocean hover:border-ocean/30 transition-all"
                    title="Share"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              {/* Rating Row */}
              <div className="flex flex-wrap items-center gap-4 py-4 border-y border-dark-border">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-ocean/15 border border-ocean/30 rounded-lg">
                    <span className="text-ocean font-bold text-xl">
                      {hotel.ratings?.overall?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {getRatingLabel(hotel.ratings?.overall)}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {hotel.reviewCount?.toLocaleString() || 0} reviews
                    </p>
                  </div>
                </div>

                <StarRating rating={hotel.ratings?.overall || 0} size={16} />

                <div className="flex items-center gap-1 text-sand">
                  {Array.from({ length: hotel.starRating || 0 }, (_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                  <span className="text-slate-400 text-xs ml-1">{hotel.starRating}-star hotel</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">About This Property</h2>
              <p className="text-slate-300 leading-relaxed">{hotel.description}</p>
            </div>

            {/* Amenities */}
            {(
              hotel.amenities?.general?.length > 0 ||
              hotel.amenities?.dining?.length  > 0 ||
              hotel.amenities?.services?.length > 0
            ) && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    ...(hotel.amenities?.general    || []),
                    ...(hotel.amenities?.dining     || []),
                    ...(hotel.amenities?.services   || []),
                    ...(hotel.amenities?.recreation || []),
                  ].map((a, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-slate-300 py-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rooms Section */}
            <div id="rooms">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  {checkIn && checkOut ? `Available Rooms` : 'Room Types'}
                  {nights > 0 && (
                    <span className="text-ocean text-base font-normal ml-2">
                      · {nights} night{nights > 1 ? 's' : ''}
                    </span>
                  )}
                </h2>
                {availLoading && <div className="spinner w-5 h-5 border-2" />}
              </div>

              {displayRooms.length > 0 ? (
                <div className="space-y-4">
                  {displayRooms.map((room, i) => (
                    <RoomCard
                      key={room._id || i}
                      room={room}
                      nights={nights}
                      onBook={handleBook}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-dark-card border border-dark-border rounded-2xl">
                  <p className="text-slate-400">
                    {checkIn && checkOut
                      ? 'No rooms available for selected dates'
                      : 'No rooms listed for this property'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Policies */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Hotel Policies</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { icon: Clock,        label: 'Check-in',    val: hotel.policies?.checkIn      || '3:00 PM' },
                  { icon: Clock,        label: 'Check-out',   val: hotel.policies?.checkOut     || '11:00 AM' },
                  { icon: AlertCircle,  label: 'Cancellation',val: hotel.policies?.cancellation || 'Flexible' },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} className="bg-dark-card border border-dark-border rounded-xl p-4">
                    <Icon size={16} className="text-ocean mb-2" />
                    <p className="text-xs text-slate-500 mb-1">{label}</p>
                    <p className="text-white text-sm font-medium">{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Guest Reviews
                {reviews.length > 0 && (
                  <span className="text-slate-500 text-sm font-normal ml-2">
                    ({reviews.length} shown)
                  </span>
                )}
              </h2>

              {/* Rating Breakdown */}
              {hotel.ratings?.cleanliness > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {[
                    { key: 'cleanliness',   label: 'Cleanliness' },
                    { key: 'location',      label: 'Location' },
                    { key: 'service',       label: 'Service' },
                    { key: 'valueForMoney', label: 'Value' },
                    { key: 'facilities',    label: 'Facilities' },
                  ].map(({ key, label }) => (
                    <div key={key} className="bg-dark-card border border-dark-border rounded-xl p-3">
                      <p className="text-xs text-slate-500 mb-1">{label}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-dark-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-ocean rounded-full transition-all duration-700"
                            style={{ width: `${((hotel.ratings?.[key] || 0) / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-white text-sm font-semibold w-8 text-right">
                          {hotel.ratings?.[key]?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Review List */}
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.slice(0, 6).map((review) => (
                    <div
                      key={review._id}
                      className="bg-dark-card border border-dark-border rounded-2xl p-5"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={
                            review.user?.avatar?.url ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.name || 'U')}&background=0ea5e9&color=fff&size=40`
                          }
                          alt={review.user?.name}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=U&background=0ea5e9&color=fff&size=40`;
                          }}
                        />
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{review.user?.name}</p>
                          <p className="text-slate-500 text-xs">{formatDate(review.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <StarRating rating={review.ratings?.overall || 0} size={12} />
                          <span className="text-sand text-sm font-semibold">
                            {review.ratings?.overall?.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <h4 className="text-white font-medium text-sm mb-1">{review.title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                        {review.review}
                      </p>
                      {review.isVerified && (
                        <span className="badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-xs mt-2 inline-flex">
                          ✓ Verified Stay
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-dark-card border border-dark-border rounded-2xl">
                  <Star size={32} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400">No reviews yet</p>
                  <p className="text-slate-600 text-sm">Be the first to review!</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Booking Card ─────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                {/* Price */}
                <div className="mb-4">
                  <span className="text-3xl font-bold text-white">
                    {formatPrice(hotel.priceRange?.min || 0)}
                  </span>
                  <span className="text-slate-400 text-sm"> / night</span>
                </div>

                <StarRating
                  rating={hotel.ratings?.overall || 0}
                  size={14}
                  showValue
                  className="mb-5"
                />

                {/* Date Pickers */}
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="input-label flex items-center gap-1.5">
                      <Calendar size={13} /> Check-in
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => {
                        setCheckIn(e.target.value);
                        if (checkOut && new Date(e.target.value) >= new Date(checkOut)) {
                          setCheckOut('');
                        }
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className="input [color-scheme:dark]"
                    />
                  </div>

                  <div>
                    <label className="input-label flex items-center gap-1.5">
                      <Calendar size={13} /> Check-out
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      className="input [color-scheme:dark]"
                    />
                  </div>

                  <div>
                    <label className="input-label flex items-center gap-1.5">
                      <Users size={13} /> Guests
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={guests}
                      onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))}
                      className="input"
                    />
                  </div>
                </div>

                {/* Price Breakdown */}
                {nights > 0 && (
                  <div className="bg-dark-bg rounded-xl p-4 space-y-2 mb-4 text-sm">
                    <div className="flex justify-between text-slate-400">
                      <span>{formatPrice(hotel.priceRange?.min || 0)} × {nights} night{nights > 1 ? 's' : ''}</span>
                      <span>{formatPrice((hotel.priceRange?.min || 0) * nights)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Taxes & fees (12%)</span>
                      <span>{formatPrice(Math.round((hotel.priceRange?.min || 0) * nights * 0.12))}</span>
                    </div>
                    <div className="flex justify-between text-white font-semibold pt-2 border-t border-dark-border">
                      <span>Total</span>
                      <span className="text-ocean">
                        {formatPrice(calcTotalPrice(hotel.priceRange?.min || 0, nights).total)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Book Button */}
                <button
                  onClick={() => {
                    if (!checkIn || !checkOut) {
                      toast.error('Please select your check-in and check-out dates');
                      return;
                    }
                    const firstAvailable = displayRooms.find(
                      (r) => !r.availableCount || r.availableCount > 0
                    );
                    if (firstAvailable) {
                      handleBook(firstAvailable);
                    } else {
                      toast.error('No rooms available. Please select dates first.');
                    }
                  }}
                  className="w-full btn-primary text-base py-3"
                >
                  {!checkIn || !checkOut ? 'Select Dates to Book' : 'Reserve Now →'}
                </button>

                <p className="text-center text-slate-500 text-xs mt-3">
                  No charge yet · Free cancellation available
                </p>

                {/* Contact Info */}
                {hotel.contact?.phone && (
                  <div className="mt-5 pt-5 border-t border-dark-border">
                    <a
                      href={`tel:${hotel.contact.phone}`}
                      className="flex items-center gap-2 text-sm text-slate-400 hover:text-ocean transition-colors"
                    >
                      <Phone size={14} className="text-ocean" />
                      {hotel.contact.phone}
                    </a>
                  </div>
                )}

                {/* Nearby Attractions */}
                {hotel.location?.nearbyAttractions?.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-dark-border">
                    <h4 className="text-white text-sm font-semibold mb-3 flex items-center gap-1.5">
                      <MapPin size={14} className="text-ocean" />
                      Nearby Attractions
                    </h4>
                    {hotel.location.nearbyAttractions.map((attr, i) => (
                      <div key={i} className="flex justify-between text-sm py-1.5">
                        <span className="text-slate-300">{attr.name}</span>
                        <span className="text-slate-500">{attr.distance}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}