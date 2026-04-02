import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, Clock, Users, Star, ChevronDown, Check } from 'lucide-react';
import { fetchPackages } from '../store/slices/packageSlice';
import { PackageCardSkeleton } from '../components/common/SkeletonCard';
import { formatPrice } from '../utils/helpers';

// ── Updated to match new seeder packageType enum ──────────────
const PACKAGE_TYPES = [
  'Adventure', 'Beach', 'Cultural', 'Family',
  'Honeymoon', 'Budget', 'Luxury', 'Wildlife',
  'Wellness',   // ← new seeder has Kerala Wellness package
  'Pilgrimage',
];

function PackageCard({ pkg, index }) {
  const navigate   = useNavigate();
  // ── FIX: use pkg.slug || pkg._id (identifier was undefined before) ──
  const identifier = pkg.slug || pkg._id;

  const discount = pkg.pricing?.originalPrice
    ? Math.round(((pkg.pricing.originalPrice - pkg.pricing.perPerson) / pkg.pricing.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden hover:border-ocean/30 hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
      onClick={() => navigate(`/packages/${identifier}`)}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={pkg.coverImage?.url || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600'}
          alt={pkg.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          {discount > 0 && (
            <span className="badge bg-coral/20 text-coral border border-coral/30 text-xs">-{discount}% OFF</span>
          )}
          {pkg.isBestSeller && (
            <span className="badge bg-sand/20 text-sand border border-sand/30 text-xs">🔥 Best Seller</span>
          )}
          {pkg.isFeatured && (
            <span className="badge bg-ocean/20 text-ocean border border-ocean/30 text-xs">✦ Featured</span>
          )}
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="badge bg-black/40 text-white border border-white/20 text-xs backdrop-blur-sm capitalize">
            {pkg.packageType}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-2">
          <MapPin size={11} />
          <span>{pkg.destination?.city}, {pkg.destination?.country}</span>
        </div>
        <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 leading-snug group-hover:text-ocean transition-colors">
          {pkg.title}
        </h3>
        <p className="text-slate-400 text-sm line-clamp-2 mb-4">
          {pkg.shortDescription || pkg.description?.slice(0, 100)}
        </p>

        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
          <span className="flex items-center gap-1">
            <Clock size={12} />{pkg.duration?.days}D/{pkg.duration?.nights}N
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} />{pkg.groupSize?.min}-{pkg.groupSize?.max} people
          </span>
          {pkg.ratings?.overall > 0 && (
            <span className="flex items-center gap-1">
              <Star size={12} className="text-sand" fill="currentColor" />
              {pkg.ratings.overall.toFixed(1)}
            </span>
          )}
        </div>

        {pkg.highlights?.slice(0, 3).map((h, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Check size={10} className="text-emerald-400 shrink-0" />{h}
          </div>
        ))}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-border">
          <div>
            {pkg.pricing?.originalPrice && (
              <p className="text-xs text-slate-600 line-through">
                {formatPrice(pkg.pricing.originalPrice)}
              </p>
            )}
            <p className="text-xl font-bold text-white">{formatPrice(pkg.pricing?.perPerson)}</p>
            <p className="text-xs text-slate-500">per person</p>
          </div>
          <button
            className="btn-primary text-sm py-2 px-4"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/packages/${identifier}`);
            }}
          >
            View Package
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function PackagesPage() {
  const dispatch = useDispatch();
  const { list: packages, loading, total, pages } = useSelector(s => s.packages);

  const [filters, setFilters] = useState({
    destination: '', packageType: '', minPrice: '', maxPrice: '',
    duration: '', sortBy: 'popular', page: 1, limit: 9,
  });

  useEffect(() => { dispatch(fetchPackages(filters)); }, []);

  const applyFilter = (updates) => {
    const updated = { ...filters, ...updates, page: 1 };
    setFilters(updated);
    dispatch(fetchPackages(updated));
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="bg-gradient-to-b from-dark-card/50 to-transparent border-b border-dark-border">
        <div className="container-custom py-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge-ocean text-xs mb-4 inline-flex">✦ Curated Experiences</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Travel <span className="gradient-text">Packages</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Expertly crafted journeys across India — flights, hotels, guides & more included
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8 items-center">
          <input
            type="text"
            placeholder="Search destination..."
            value={filters.destination}
            onChange={(e) => applyFilter({ destination: e.target.value })}
            className="input flex-1 min-w-[200px] max-w-xs py-2.5"
          />

          <div className="flex flex-wrap gap-2">
            {PACKAGE_TYPES.map(type => (
              <button
                key={type}
                onClick={() => applyFilter({ packageType: filters.packageType === type ? '' : type })}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  filters.packageType === type
                    ? 'bg-ocean/15 text-ocean border-ocean/30'
                    : 'bg-dark-card border-dark-border text-slate-400 hover:border-ocean/30'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="relative ml-auto">
            <select
              value={filters.sortBy}
              onChange={(e) => applyFilter({ sortBy: e.target.value })}
              className="input py-2.5 pr-8 appearance-none text-sm min-w-[160px]"
            >
              <option value="popular">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-400 text-sm">
            <span className="text-white font-semibold">{total}</span> packages found
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }, (_, i) => <PackageCardSkeleton key={i} />)
            : packages.length > 0
              ? packages.map((pkg, i) => <PackageCard key={pkg._id} pkg={pkg} index={i} />)
              : (
                <div className="col-span-full py-20 text-center">
                  <div className="text-6xl mb-4">🗺️</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No packages found</h3>
                  <p className="text-slate-400 mb-6">Try a different destination or category</p>
                  <button
                    onClick={() => applyFilter({ destination: '', packageType: '' })}
                    className="btn-primary"
                  >
                    Clear Filters
                  </button>
                </div>
              )
          }
        </div>

        {pages > 1 && !loading && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => {
                  const u = { ...filters, page: p };
                  setFilters(u);
                  dispatch(fetchPackages(u));
                }}
                className={`w-10 h-10 rounded-xl font-medium text-sm transition-all ${
                  filters.page === p
                    ? 'bg-ocean text-white'
                    : 'bg-dark-card border border-dark-border text-slate-400 hover:border-ocean/40'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}