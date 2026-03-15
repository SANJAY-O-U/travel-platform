// ============================================================
// HotelsPage — Listing with Live Filters & Sorting
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  SlidersHorizontal, X, ChevronDown, Search,
  MapPin, Star, DollarSign, Grid2X2, List,
} from 'lucide-react';
import { fetchHotels, setFilters, clearFilters } from '../store/slices/hotelSlice';
import HotelCard from '../components/common/HotelCard';
import { HotelCardSkeleton } from '../components/common/SkeletonCard';

const PROPERTY_TYPES = ['Hotel', 'Resort', 'Villa', 'Apartment', 'Hostel', 'Boutique Hotel', 'Lodge'];
const AMENITIES_LIST = ['Free WiFi', 'Parking', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Air Conditioning', 'Beach Access'];
const SORT_OPTIONS = [
  { value: 'rating',     label: 'Top Rated' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popularity', label: 'Most Popular' },
];

// ─── Filter Panel ─────────────────────────────────────────────
function FilterPanel({ filters, onChange, onClear, onClose }) {
  const handleAmenityToggle = (amenity) => {
    const current = filters.amenities || [];
    const updated = current.includes(amenity)
      ? current.filter(a => a !== amenity)
      : [...current, amenity];
    onChange({ amenities: updated });
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-6 sticky top-24">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-ocean" />
          Filters
        </h3>
        <div className="flex gap-2">
          <button onClick={onClear} className="text-xs text-slate-500 hover:text-ocean transition-colors">Clear all</button>
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-white/5">
              <X size={16} className="text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="input-label flex items-center gap-1.5"><DollarSign size={13} /> Price per night</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => onChange({ minPrice: e.target.value })}
            className="input text-sm py-2"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => onChange({ maxPrice: e.target.value })}
            className="input text-sm py-2"
          />
        </div>
      </div>

      {/* Star Rating */}
      <div>
        <label className="input-label flex items-center gap-1.5"><Star size={13} /> Minimum Stars</label>
        <div className="flex gap-2 mt-2">
          {[1, 2, 3, 4, 5].map(s => (
            <button
              key={s}
              onClick={() => onChange({ starRating: filters.starRating == s ? '' : s })}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                filters.starRating >= s
                  ? 'bg-sand/15 text-sand border-sand/30'
                  : 'bg-white/5 text-slate-400 border-dark-border hover:border-sand/30'
              }`}
            >
              {s}★
            </button>
          ))}
        </div>
      </div>

      {/* Property Type */}
      <div>
        <label className="input-label">Property Type</label>
        <div className="space-y-2 mt-2">
          {PROPERTY_TYPES.map(type => (
            <label key={type} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.propertyType === type}
                onChange={() => onChange({ propertyType: filters.propertyType === type ? '' : type })}
                className="w-4 h-4 rounded border-dark-border text-ocean focus:ring-ocean/30"
              />
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className="input-label">Amenities</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {AMENITIES_LIST.map(amenity => {
            const isSelected = (filters.amenities || []).includes(amenity);
            return (
              <button
                key={amenity}
                onClick={() => handleAmenityToggle(amenity)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-ocean/15 text-ocean border-ocean/30'
                    : 'bg-white/5 text-slate-400 border-dark-border hover:border-ocean/30 hover:text-ocean'
                }`}
              >
                {amenity}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function HotelsPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { list: hotels, loading, total, pages, currentPage } = useSelector(s => s.hotels);

  const [localFilters, setLocalFilters] = useState({
    city:         searchParams.get('city')     || '',
    checkIn:      searchParams.get('checkIn')  || '',
    checkOut:     searchParams.get('checkOut') || '',
    guests:       searchParams.get('guests')   || 1,
    minPrice:     '',
    maxPrice:     '',
    starRating:   '',
    propertyType: '',
    amenities:    [],
    sortBy:       'rating',
    page:         1,
    limit:        12,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [searchInput, setSearchInput] = useState(localFilters.city);

  const doFetch = useCallback((f) => {
    const params = { ...f };
    if (params.amenities?.length) params.amenities = params.amenities.join(',');
    dispatch(fetchHotels(params));
  }, [dispatch]);

  useEffect(() => { doFetch(localFilters); }, []);

  const applyFilters = (updates = {}) => {
    const updated = { ...localFilters, ...updates, page: 1 };
    setLocalFilters(updated);
    doFetch(updated);
  };

  const handleSearch = () => {
    applyFilters({ city: searchInput });
  };

  const handlePageChange = (p) => {
    const updated = { ...localFilters, page: p };
    setLocalFilters(updated);
    doFetch(updated);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    const reset = { city: '', checkIn: '', checkOut: '', guests: 1, minPrice: '', maxPrice: '', starRating: '', propertyType: '', amenities: [], sortBy: 'rating', page: 1, limit: 12 };
    setLocalFilters(reset);
    setSearchInput('');
    doFetch(reset);
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* ── Page Header ──────────────────────────────────── */}
      <div className="bg-dark-card/50 border-b border-dark-border">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search bar */}
            <div className="flex-1 flex items-center gap-3 bg-dark-bg border border-dark-border rounded-xl px-4 py-3 focus-within:border-ocean/60 transition-all">
              <MapPin size={18} className="text-ocean" />
              <input
                type="text"
                placeholder="Search by city, country or hotel name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-transparent text-white placeholder:text-slate-500 text-sm w-full focus:outline-none"
              />
              <button onClick={handleSearch} className="p-1 rounded-lg hover:bg-white/5">
                <Search size={16} className="text-slate-400" />
              </button>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={localFilters.sortBy}
                  onChange={(e) => applyFilters({ sortBy: e.target.value })}
                  className="input text-sm py-2.5 pr-8 appearance-none cursor-pointer min-w-[180px]"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* View mode */}
              <div className="flex border border-dark-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-ocean/15 text-ocean' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Grid2X2 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-ocean/15 text-ocean' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  <List size={16} />
                </button>
              </div>

              {/* Mobile filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dark-border text-sm text-slate-300 hover:border-ocean/40 transition-all"
              >
                <SlidersHorizontal size={15} />
                Filters
              </button>
            </div>
          </div>

          {/* Active filter tags */}
          {(localFilters.city || localFilters.starRating || localFilters.propertyType || localFilters.minPrice) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {localFilters.city && (
                <span className="badge-ocean flex items-center gap-1.5">
                  <MapPin size={11} /> {localFilters.city}
                  <button onClick={() => applyFilters({ city: '' })} className="ml-1"><X size={11} /></button>
                </span>
              )}
              {localFilters.starRating && (
                <span className="badge-gold flex items-center gap-1.5">
                  {localFilters.starRating}★ & above
                  <button onClick={() => applyFilters({ starRating: '' })}><X size={11} /></button>
                </span>
              )}
              {localFilters.propertyType && (
                <span className="badge-ocean flex items-center gap-1.5">
                  {localFilters.propertyType}
                  <button onClick={() => applyFilters({ propertyType: '' })}><X size={11} /></button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex gap-6">
          {/* ── Filter Sidebar (desktop) ──────────────────── */}
          <aside className="hidden lg:block w-64 shrink-0">
            <FilterPanel
              filters={localFilters}
              onChange={applyFilters}
              onClear={clearAllFilters}
            />
          </aside>

          {/* ── Mobile Filter Drawer ──────────────────────── */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 lg:hidden"
              >
                <div className="absolute inset-0 bg-black/60" onClick={() => setShowFilters(false)} />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  className="absolute left-0 top-0 bottom-0 w-80 bg-dark-bg overflow-y-auto p-4"
                >
                  <FilterPanel
                    filters={localFilters}
                    onChange={(updates) => { applyFilters(updates); }}
                    onClear={clearAllFilters}
                    onClose={() => setShowFilters(false)}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Results ───────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Results count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-400 text-sm">
                {loading ? 'Searching...' : (
                  <>
                    <span className="text-white font-semibold">{total.toLocaleString()}</span> properties found
                    {localFilters.city && <> in <span className="text-ocean">{localFilters.city}</span></>}
                  </>
                )}
              </p>
            </div>

            {/* Grid */}
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                : 'grid-cols-1'
            }`}>
              {loading
                ? Array.from({ length: 9 }, (_, i) => <HotelCardSkeleton key={i} />)
                : hotels.length > 0
                  ? hotels.map((hotel, i) => (
                      <HotelCard key={hotel._id} hotel={hotel} index={i} compact={viewMode === 'list'} />
                    ))
                  : (
                    <div className="col-span-full py-20 text-center">
                      <div className="text-6xl mb-4">🏨</div>
                      <h3 className="text-xl font-semibold text-white mb-2">No hotels found</h3>
                      <p className="text-slate-400 mb-6">Try adjusting your filters or search a different destination</p>
                      <button onClick={clearAllFilters} className="btn-primary">Clear Filters</button>
                    </div>
                  )
              }
            </div>

            {/* Pagination */}
            {pages > 1 && !loading && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-10 h-10 rounded-xl font-medium text-sm transition-all ${
                      currentPage === p
                        ? 'bg-ocean text-white shadow-glow-sm'
                        : 'bg-dark-card border border-dark-border text-slate-400 hover:border-ocean/40 hover:text-ocean'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                {pages > 7 && <span className="text-slate-500 self-center">...</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}