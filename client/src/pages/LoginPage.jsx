// ============================================================
// HotelDetailPage — Full Hotel Detail with Gallery & Booking
// ============================================================
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  MapPin, Star, Wifi, Car, Waves, UtensilsCrossed,
  ChevronLeft, ChevronRight, X, Heart, Share2,
  Check, Clock, AlertCircle, Users, Calendar, ArrowRight,
} from 'lucide-react';
import { fetchHotelDetail } from '../store/slices/hotelSlice';
import { toggleWishlist, selectUser, selectIsAuthenticated } from '../store/slices/authSlice';
import { formatPrice, formatDate, calcNights, calcTotalPrice, getRatingLabel, getHotelImage } from '../utils/helpers';
import StarRating from '../components/common/StarRating';
import { HotelCardSkeleton } from '../components/common/SkeletonCard';
import api from '../utils/api';

// ─── Image Gallery Modal ──────────────────────────────────────
function GalleryModal({ images, startIdx, onClose }) {
  const [current, setCurrent] = useState(startIdx);
  const prev = () => setCurrent(c => (c - 1 + images.length) % images.length);
  const next = () => setCurrent(c => (c + 1) % images.length);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex-center"
    >
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl glass text-white hover:bg-white/10">
        <X size={22} />
      </button>
      <button onClick={prev} className="absolute left-4 p-3 rounded-xl glass text-white hover:bg-white/10 z-10">
        <ChevronLeft size={24} />
      </button>
      <button onClick={next} className="absolute right-4 p-3 rounded-xl glass text-white hover:bg-white/10 z-10">
        <ChevronRight size={24} />
      </button>
      <div className="w-full max-w-5xl max-h-[85vh] px-16">
        <img
          src={images[current]?.url}
          alt={`Gallery ${current + 1}`}
          className="w-full h-full object-contain rounded-2xl"
        />
        <p className="text-center text-slate-400 text-sm mt-3">{current + 1} / {images.length}</p>
      </div>
    </motion.div>
  );
}

// ─── Room Card ────────────────────────────────────────────────
function RoomCard({ room, nights, onBook }) {
  const pricing = calcTotalPrice(room.pricePerNight, nights || 1);
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col md:flex-row gap-5">
      <div className="md:w-48 shrink-0">
        <div className="aspect-video bg-dark-card rounded-xl overflow-hidden">
          <img
            src={room.images?.[0]?.url || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400'}
            alt={room.roomType}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="text-white font-semibold text-lg">{room.roomType} Room</h4>
            <p className="text-slate-400 text-sm">{room.bedType} bed · Up to {room.maxGuests} guests · {room.size} sq ft</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold text-white">{formatPrice(room.pricePerNight)}</div>
            <div className="text-xs text-slate-500">per night</div>
            {nights > 1 && (
              <div className="text-sm text-ocean mt-0.5">{formatPrice(pricing.total)} total</div>
            )}
          </div>
        </div>

        {room.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {room.amenities.map(a => (
              <span key={a} className="flex items-center gap-1 text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg">
                <Check size={10} className="text-emerald-400" /> {a}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={() => onBook(room)}
          className="mt-4 btn-primary text-sm py-2 px-5"
        >
          Reserve Room →
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function HotelDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user     = useSelector(selectUser);
  const isAuth   = useSelector(selectIsAuthenticated);
  const { currentHotel: hotel, detailLoading } = useSelector(s => s.hotels);

  const [gallery, setGallery]   = useState({ open: false, idx: 0 });
  const [checkIn,  setCheckIn]  = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests,   setGuests]   = useState(1);
  const [reviews,  setReviews]  = useState([]);
  const [available, setAvailable] = useState(null);

  const nights = calcNights(checkIn, checkOut);
  const isWishlisted = user?.wishlist?.includes(hotel?._id);

  useEffect(() => {
    dispatch(fetchHotelDetail(id));
  }, [id, dispatch]);

  // Fetch reviews
  useEffect(() => {
    if (hotel?._id) {
      api.get(`/reviews/hotel/${hotel._id}`).then(({ data }) => setReviews(data.reviews || []));
    }
  }, [hotel?._id]);

  // Check availability when dates change
  useEffect(() => {
    if (hotel?._id && checkIn && checkOut) {
      api.get(`/hotels/${hotel._id}/availability`, { params: { checkIn, checkOut, guests } })
        .then(({ data }) => setAvailable(data.availableRooms || []))
        .catch(() => setAvailable(null));
    }
  }, [hotel?._id, checkIn, checkOut, guests]);

  const handleBook = (room) => {
    if (!isAuth) { navigate('/login'); return; }
    navigate(`/booking/hotel/${hotel._id}`, {
      state: { hotel, room, checkIn, checkOut, nights, guests },
    });
  };

  if (detailLoading) return (
    <div className="min-h-screen pt-20 container-custom py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="skeleton aspect-video rounded-2xl" />
          <div className="skeleton h-8 w-2/3 rounded" />
          <div className="skeleton h-4 w-full rounded" />
        </div>
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    </div>
  );

  if (!hotel) return (
    <div className="min-h-screen pt-20 flex-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🏨</div>
        <h2 className="text-2xl font-bold text-white mb-2">Hotel not found</h2>
        <Link to="/hotels" className="btn-primary mt-4 inline-flex">Browse Hotels</Link>
      </div>
    </div>
  );

  const allImages = [hotel.coverImage, ...(hotel.images || [])].filter(Boolean).filter(img => img.url);

  return (
    <div className="min-h-screen pt-20 pb-16">
      <AnimatePresence>
        {gallery.open && (
          <GalleryModal images={allImages} startIdx={gallery.idx} onClose={() => setGallery({ open: false, idx: 0 })} />
        )}
      </AnimatePresence>

      <div className="container-custom py-8">
        {/* ── Back ────────────────────────────────────────── */}
        <Link to="/hotels" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm transition-colors">
          <ChevronLeft size={16} /> Back to Hotels
        </Link>

        {/* ── Gallery Grid ──────────────────────────────── */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[420px] mb-8 cursor-pointer">
          {allImages.slice(0, 5).map((img, i) => (
            <div
              key={i}
              onClick={() => setGallery({ open: true, idx: i })}
              className={`relative img-zoom bg-dark-card hover:brightness-90 transition-all ${
                i === 0 ? 'col-span-2 row-span-2' : ''
              }`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              {i === 4 && allImages.length > 5 && (
                <div className="absolute inset-0 bg-black/60 flex-center">
                  <span className="text-white font-semibold">+{allImages.length - 5} more</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: Details ──────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge-ocean text-xs capitalize">{hotel.propertyType}</span>
                    {hotel.isVerified && <span className="badge-success text-xs">✓ Verified</span>}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{hotel.name}</h1>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin size={15} className="text-ocean" />
                    <span>{hotel.location?.address}, {hotel.location?.city}, {hotel.location?.country}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => dispatch(toggleWishlist(hotel._id))}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isWishlisted ? 'bg-coral/15 text-coral border-coral/30' : 'bg-dark-card border-dark-border text-slate-400 hover:text-coral hover:border-coral/30'
                    }`}
                  >
                    <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                  </button>
                  <button className="p-2.5 rounded-xl border border-dark-border bg-dark-card text-slate-400 hover:text-ocean transition-all">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              {/* Rating row */}
              <div className="flex flex-wrap items-center gap-4 py-4 border-y border-dark-border">
                <div className="flex items-center gap-2">
                  <div className="px-2.5 py-1 bg-ocean/15 border border-ocean/30 rounded-lg">
                    <span className="text-ocean font-bold text-lg">{hotel.ratings?.overall?.toFixed(1)}</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{getRatingLabel(hotel.ratings?.overall)}</p>
                    <p className="text-slate-500 text-xs">{hotel.reviewCount?.toLocaleString()} reviews</p>
                  </div>
                </div>
                <StarRating rating={hotel.ratings?.overall || 0} size={16} />
                <div className="flex items-center gap-1 text-sand text-sm">
                  {Array.from({ length: hotel.starRating }, (_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">About This Property</h2>
              <p className="text-slate-300 leading-relaxed">{hotel.description}</p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  ...(hotel.amenities?.general || []),
                  ...(hotel.amenities?.dining || []),
                  ...(hotel.amenities?.services || []),
                  ...(hotel.amenities?.recreation || []),
                ].map((a, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-slate-300 py-2">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    {a}
                  </div>
                ))}
              </div>
            </div>

            {/* Rooms */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Available Rooms
                {nights > 0 && <span className="text-ocean text-base font-normal ml-2">· {nights} nights</span>}
              </h2>
              <div className="space-y-4">
                {(available || hotel.rooms || []).map((room, i) => (
                  <RoomCard key={i} room={room} nights={nights} onBook={handleBook} />
                ))}
              </div>
            </div>

            {/* Policies */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Hotel Policies</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { icon: Clock, label: 'Check-in',   val: hotel.policies?.checkIn },
                  { icon: Clock, label: 'Check-out',  val: hotel.policies?.checkOut },
                  { icon: AlertCircle, label: 'Cancellation', val: hotel.policies?.cancellation },
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
              <h2 className="text-xl font-semibold text-white mb-4">Guest Reviews</h2>
              {/* Rating breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {[
                  { key: 'cleanliness', label: 'Cleanliness' },
                  { key: 'location',    label: 'Location' },
                  { key: 'service',     label: 'Service' },
                  { key: 'valueForMoney', label: 'Value' },
                  { key: 'facilities',  label: 'Facilities' },
                ].map(({ key, label }) => (
                  <div key={key} className="bg-dark-card border border-dark-border rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">{label}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-dark-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-ocean rounded-full"
                          style={{ width: `${((hotel.ratings?.[key] || 0) / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-white text-sm font-semibold">{hotel.ratings?.[key]?.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Review list */}
              <div className="space-y-4">
                {reviews.slice(0, 5).map((review) => (
                  <div key={review._id} className="bg-dark-card border border-dark-border rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={review.user?.avatar?.url || `https://ui-avatars.com/api/?name=${review.user?.name}&background=0ea5e9&color=fff&size=40`}
                        alt={review.user?.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="text-white font-medium text-sm">{review.user?.name}</p>
                        <p className="text-slate-500 text-xs">{formatDate(review.createdAt)}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-1.5">
                        <StarRating rating={review.ratings?.overall} size={12} />
                        <span className="text-sand text-sm font-semibold">{review.ratings?.overall?.toFixed(1)}</span>
                      </div>
                    </div>
                    <h4 className="text-white font-medium text-sm mb-1">{review.title}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{review.review}</p>
                    {review.isVerified && (
                      <span className="badge-success text-xs mt-2 inline-flex">✓ Verified Stay</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Booking Card ────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                <div className="mb-4">
                  <span className="text-3xl font-bold text-white">{formatPrice(hotel.priceRange?.min)}</span>
                  <span className="text-slate-400 text-sm"> / night</span>
                </div>

                <StarRating rating={hotel.ratings?.overall} size={14} showValue className="mb-5" />

                {/* Date pickers */}
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="input-label flex items-center gap-1.5"><Calendar size={13} /> Check-in</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="input [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="input-label flex items-center gap-1.5"><Calendar size={13} /> Check-out</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      className="input [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="input-label flex items-center gap-1.5"><Users size={13} /> Guests</label>
                    <input
                      type="number"
                      min={1} max={10}
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="input"
                    />
                  </div>
                </div>

                {/* Price breakdown */}
                {nights > 0 && (
                  <div className="bg-dark-bg rounded-xl p-4 space-y-2 mb-4 text-sm">
                    <div className="flex justify-between text-slate-400">
                      <span>{formatPrice(hotel.priceRange?.min)} × {nights} nights</span>
                      <span>{formatPrice((hotel.priceRange?.min || 0) * nights)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Taxes & fees</span>
                      <span>{formatPrice(Math.round((hotel.priceRange?.min || 0) * nights * 0.12))}</span>
                    </div>
                    <div className="flex justify-between text-white font-semibold pt-2 border-t border-dark-border">
                      <span>Total</span>
                      <span className="text-ocean">{formatPrice(calcTotalPrice(hotel.priceRange?.min || 0, nights).total)}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (!checkIn || !checkOut) {
                      window.scrollTo({ top: document.getElementById('rooms')?.offsetTop - 100, behavior: 'smooth' });
                      return;
                    }
                    if (!isAuth) { navigate('/login'); return; }
                    const firstRoom = hotel.rooms?.[0];
                    if (firstRoom) handleBook(firstRoom);
                  }}
                  className="w-full btn-primary text-base py-3"
                >
                  {!checkIn || !checkOut ? 'Select Dates to Book' : 'Reserve Now →'}
                </button>

                <p className="text-center text-slate-500 text-xs mt-3">No charge yet · Free cancellation available</p>

                {/* Nearby attractions */}
                {hotel.location?.nearbyAttractions?.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-dark-border">
                    <h4 className="text-white text-sm font-semibold mb-3 flex items-center gap-1.5">
                      <MapPin size={14} className="text-ocean" /> Nearby Attractions
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