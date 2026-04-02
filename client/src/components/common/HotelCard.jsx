// client/src/components/common/HotelCard.jsx
import { Link, useNavigate } from 'react-router-dom';
import { motion }            from 'framer-motion';
import { Heart, MapPin, Star, Wifi, Car, Waves, UtensilsCrossed } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlist, selectUser, selectIsAuthenticated, selectWishlist } from '../../store/slices/authSlice';
import { getHotelImage, formatPrice, getRatingLabel } from '../../utils/helpers';
import StarRating from './StarRating';
import toast from 'react-hot-toast';

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
  const navigate   = useNavigate();
  const isAuth     = useSelector(selectIsAuthenticated);
  const wishlist   = useSelector(selectWishlist);

  // ✅ Fixed: check wishlist array properly
  const isWishlisted = Array.isArray(wishlist) && wishlist.some(
    (id) => id === hotel._id || id?.toString() === hotel._id?.toString()
  );

  const coverImg = getHotelImage(hotel);

  const amenityList = [
    ...(hotel.amenities?.general   || []),
    ...(hotel.amenities?.recreation || []),
  ].slice(0, 3);

  // ✅ Fixed: wishlist handler
  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuth) {
      toast.error('Please sign in to save hotels to your wishlist');
      navigate('/login');
      return;
    }

    dispatch(toggleWishlist(hotel._id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="hotel-card"
    >
      <Link to={`/hotels/${hotel._id}`} className="block">
        {/* ── Image ─────────────────────────────────────── */}
        <div className="relative img-zoom aspect-[4/3] bg-dark-card overflow-hidden">
          <img
            src={coverImg}
            alt={hotel.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1586611292717-f828b167408c?w=600';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center
                        backdrop-blur-sm transition-all duration-300 z-10
                        ${isWishlisted
                          ? 'bg-coral/20 text-coral border border-coral/40'
                          : 'bg-black/30 text-white/70 border border-white/10 hover:bg-coral/20 hover:text-coral hover:border-coral/40'
                        }`}
          >
            <Heart
              size={16}
              fill={isWishlisted ? 'currentColor' : 'none'}
              strokeWidth={2}
            />
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

          {/* Star rating */}
          <div className="absolute bottom-3 right-3">
            <div className="glass px-2.5 py-1.5 rounded-xl flex items-center gap-1.5">
              <Star size={12} className="text-sand" fill="currentColor" />
              <span className="text-white text-xs font-semibold">{hotel.starRating}★</span>
            </div>
          </div>
        </div>

        {/* ── Content ───────────────────────────────────── */}
        <div className="p-4">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1.5">
            <MapPin size={11} />
            <span>{hotel.location?.city}, {hotel.location?.country}</span>
          </div>

          <h3 className="text-white font-semibold text-base mb-2 leading-tight line-clamp-1">
            {hotel.name}
          </h3>

          <div className="flex items-center gap-2 mb-3">
            <StarRating rating={hotel.ratings?.overall || 0} size={12} />
            <span className="text-xs text-slate-400">
              {hotel.ratings?.overall?.toFixed(1)} ·{' '}
              {getRatingLabel(hotel.ratings?.overall)} ·{' '}
              {hotel.reviewCount?.toLocaleString() || 0} reviews
            </span>
          </div>

          {!compact && amenityList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {amenityList.map((amenity) => {
                const Icon = AMENITY_ICONS[amenity];
                return (
                  <span
                    key={amenity}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs text-slate-400"
                  >
                    {Icon && <Icon size={10} />}
                    {amenity}
                  </span>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-dark-border">
            <span className="text-xs text-slate-500 capitalize">{hotel.propertyType}</span>
            <span className="text-ocean text-xs font-medium">View Details →</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}