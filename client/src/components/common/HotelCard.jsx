// ============================================================
// HotelCard — Glassmorphism Hotel Listing Card
// ============================================================
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MapPin, Star, Wifi, Car, UtensilsCrossed, Waves } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlist } from '../../store/slices/authSlice';
import { selectUser, selectIsAuthenticated } from '../../store/slices/authSlice';
import { getHotelImage, formatPrice, getRatingLabel } from '../../utils/helpers';
import StarRating from './StarRating';

const AMENITY_ICONS = {
  'Free WiFi':     Wifi,
  'WiFi':          Wifi,
  'Parking':       Car,
  'Restaurant':    UtensilsCrossed,
  'Pool':          Waves,
  'Infinity Pool': Waves,
};

export default function HotelCard({ hotel, index = 0, compact = false }) {
  const dispatch   = useDispatch();
  const user       = useSelector(selectUser);
  const isAuth     = useSelector(selectIsAuthenticated);

  const isWishlisted = user?.wishlist?.includes(hotel._id);
  const coverImg     = getHotelImage(hotel);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuth) {
      window.location.href = '/login';
      return;
    }
    dispatch(toggleWishlist(hotel._id));
  };

  const amenityList = [
    ...(hotel.amenities?.general || []),
    ...(hotel.amenities?.recreation || []),
  ].slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="hotel-card group"
    >
      <Link to={`/hotels/${hotel.slug || hotel._id}`} className="block">
        {/* ── Image ──────────────────────────────────────── */}
        <div className="relative img-zoom aspect-[4/3] bg-dark-card">
          <img
            src={coverImg}
            alt={hotel.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 w-9 h-9 rounded-xl flex-center backdrop-blur-sm transition-all duration-300 ${
              isWishlisted
                ? 'bg-coral/20 text-coral border border-coral/40'
                : 'bg-black/30 text-white/70 border border-white/10 hover:bg-coral/20 hover:text-coral hover:border-coral/40'
            }`}
          >
            <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>

          {/* Featured badge */}
          {hotel.isFeatured && (
            <div className="absolute top-3 left-3 badge-gold text-xs">
              ✦ Featured
            </div>
          )}

          {/* Price overlay */}
          <div className="absolute bottom-3 left-3">
            <div className="glass px-3 py-1.5 rounded-xl">
              <span className="text-white font-bold text-lg">
                {formatPrice(hotel.priceRange?.min || 0)}
              </span>
              <span className="text-white/60 text-xs"> /night</span>
            </div>
          </div>

          {/* Star rating overlay */}
          <div className="absolute bottom-3 right-3">
            <div className="glass px-2.5 py-1.5 rounded-xl flex items-center gap-1.5">
              <Star size={12} className="text-sand" fill="currentColor" />
              <span className="text-white text-xs font-semibold">{hotel.starRating}★</span>
            </div>
          </div>
        </div>

        {/* ── Content ────────────────────────────────────── */}
        <div className="p-4">
          {/* Location */}
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1.5">
            <MapPin size={11} />
            <span>{hotel.location?.city}, {hotel.location?.country}</span>
          </div>

          {/* Name */}
          <h3 className="text-white font-semibold text-base mb-2 leading-tight line-clamp-1 group-hover:text-ocean transition-colors">
            {hotel.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <StarRating rating={hotel.ratings?.overall || 0} size={12} />
            <span className="text-xs text-slate-400">
              {hotel.ratings?.overall?.toFixed(1)} · {getRatingLabel(hotel.ratings?.overall)} · {hotel.reviewCount?.toLocaleString()} reviews
            </span>
          </div>

          {/* Amenity chips */}
          {!compact && amenityList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {amenityList.map((amenity) => {
                const Icon = AMENITY_ICONS[amenity];
                return (
                  <span key={amenity} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs text-slate-400">
                    {Icon && <Icon size={10} />}
                    {amenity}
                  </span>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-dark-border">
            <span className="text-xs text-slate-500 capitalize">{hotel.propertyType}</span>
            <span className="text-ocean text-xs font-medium hover:text-ocean/80 transition-colors">
              View Details →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}