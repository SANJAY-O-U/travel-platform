// client/src/pages/HomePage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search, MapPin, Calendar, Users, Plane,
  Package, Hotel, ArrowRight, Star,
  TrendingUp, Shield, Headphones, Zap,
} from 'lucide-react';
import api from '../utils/api';
import HotelCard from '../components/common/HotelCard';
import { HotelCardSkeleton, PackageCardSkeleton } from '../components/common/SkeletonCard';
import { formatPrice } from '../utils/helpers';

// ── Hero images — iconic Indian destinations ──────────────────
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&q=80', // Taj Mahal
  'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1600&q=80', // Kerala backwaters
  'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1600&q=80', // Jaipur palace
];

const SEARCH_TABS = [
  { id: 'hotels',   label: 'Hotels',   icon: Hotel },
  { id: 'flights',  label: 'Flights',  icon: Plane },
  { id: 'packages', label: 'Packages', icon: Package },
];

const FEATURES = [
  { icon: Shield,     title: 'Secure Booking',  desc: 'End-to-end encrypted payments with full fraud protection.' },
  { icon: Zap,        title: 'Instant Confirm', desc: 'Get your booking confirmation in seconds, every time.' },
  { icon: Headphones, title: '24/7 Support',    desc: 'Our travel experts are available around the clock.' },
  { icon: TrendingUp, title: 'Best Price',      desc: "Find a lower price? We'll match it — guaranteed." },
];

// ── Smart Search Bar ──────────────────────────────────────────
function HeroSearch() {
  const navigate = useNavigate();
  const [activeTab,   setActiveTab]   = useState('hotels');
  const [destination, setDestination] = useState('');
  const [checkIn,     setCheckIn]     = useState('');
  const [checkOut,    setCheckOut]    = useState('');
  const [guests,      setGuests]      = useState(1);
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg,    setShowSugg]    = useState(false);
  const suggRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (suggRef.current && !suggRef.current.contains(e.target)) {
        setShowSugg(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = async (q) => {
    if (q.length < 2) { setSuggestions([]); return; }
    try {
      const { data } = await api.get('/hotels/suggestions', { params: { q } });
      setSuggestions(data.suggestions || []);
      setShowSugg(true);
    } catch { /* silent */ }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination) params.set('city',    destination);
    if (checkIn)     params.set('checkIn', checkIn);
    if (checkOut)    params.set('checkOut',checkOut);
    if (guests > 1)  params.set('guests',  guests);
    const path =
      activeTab === 'flights'  ? '/flights'  :
      activeTab === 'packages' ? '/packages' :
      '/hotels';
    navigate(`${path}?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-black/30 backdrop-blur-sm p-1 rounded-2xl w-fit mx-auto">
        {SEARCH_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === id
                ? 'bg-ocean text-white shadow-glow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Search Box */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="glass rounded-2xl p-4 md:p-5 shadow-glass"
      >
        <div className="flex flex-col md:flex-row gap-3">
          {/* Destination */}
          <div className="relative flex-1 min-w-0" ref={suggRef}>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-ocean/60 transition-all">
              <MapPin size={18} className="text-ocean shrink-0" />
              <input
                type="text"
                placeholder={
                  activeTab === 'flights'
                    ? 'From / To city or airport'
                    : 'City, country or hotel name'
                }
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  fetchSuggestions(e.target.value);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-transparent text-white placeholder:text-white/40 text-sm w-full focus:outline-none"
              />
            </div>

            {/* Suggestions dropdown */}
            {showSugg && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-dark-card border border-dark-border rounded-xl shadow-xl z-50 overflow-hidden">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setDestination(s.city); setShowSugg(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-left"
                  >
                    <MapPin size={13} className="text-ocean" />
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dates — hotel & packages only */}
          {activeTab !== 'flights' && (
            <>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-ocean/60 transition-all min-w-[155px]">
                <Calendar size={18} className="text-ocean shrink-0" />
                <input
                  type="date"
                  value={checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="bg-transparent text-white text-sm w-full focus:outline-none [color-scheme:dark]"
                />
              </div>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-ocean/60 transition-all min-w-[155px]">
                <Calendar size={18} className="text-ocean shrink-0" />
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="bg-transparent text-white text-sm w-full focus:outline-none [color-scheme:dark]"
                />
              </div>
            </>
          )}

          {/* Guests */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-ocean/60 transition-all w-28 shrink-0">
            <Users size={18} className="text-ocean shrink-0" />
            <input
              type="number"
              min={1}
              max={20}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="bg-transparent text-white text-sm w-full focus:outline-none"
            />
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 bg-ocean hover:bg-ocean-dark text-white font-semibold px-7 py-3 rounded-xl transition-all duration-300 shadow-glow-sm hover:shadow-glow whitespace-nowrap shrink-0"
          >
            <Search size={17} />
            Search
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Package Card ──────────────────────────────────────────────
function PackageCard({ pkg, index }) {
  const navigate = useNavigate();
  const discount = pkg.pricing?.originalPrice
    ? Math.round(((pkg.pricing.originalPrice - pkg.pricing.perPerson) / pkg.pricing.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden
                 hover:border-ocean/30 hover:-translate-y-1 transition-all duration-300
                 group cursor-pointer"
      onClick={() => navigate(`/packages/${pkg.slug || pkg._id}`)}
    >
      <div className="relative overflow-hidden aspect-video">
        <img
          src={pkg.coverImage?.url || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600'}
          alt={pkg.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {discount > 0 && (
          <div className="absolute top-3 left-3 badge bg-coral/20 text-coral border border-coral/30 text-xs">
            -{discount}% OFF
          </div>
        )}
        {pkg.isBestSeller && (
          <div className="absolute top-3 right-3 badge bg-sand/20 text-sand border border-sand/30 text-xs">
            🔥 Best Seller
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-lg line-clamp-2 leading-tight">
            {pkg.title}
          </h3>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-3">
          <MapPin size={11} />
          <span>{pkg.destination?.city}, {pkg.destination?.country}</span>
          <span className="text-slate-600">·</span>
          <span>{pkg.duration?.days}D/{pkg.duration?.nights}N</span>
        </div>

        {pkg.highlights?.slice(0, 3).map((h, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <div className="w-1 h-1 rounded-full bg-ocean shrink-0" />
            {h}
          </div>
        ))}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-border">
          <div>
            {pkg.pricing?.originalPrice && (
              <p className="text-xs text-slate-600 line-through">
                {formatPrice(pkg.pricing.originalPrice)}
              </p>
            )}
            <p className="text-white font-bold text-xl">
              {formatPrice(pkg.pricing?.perPerson)}
            </p>
            <p className="text-slate-500 text-xs">per person</p>
          </div>
          <button className="btn-primary text-sm py-2 px-4">Book Now</button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();

  // Local state — NO Redux dependency for homepage data
  const [featuredHotels, setFeaturedHotels]     = useState([]);
  const [featuredPackages, setFeaturedPackages] = useState([]);
  const [destinations, setDestinations]         = useState([]);
  const [hotelsLoading, setHotelsLoading]       = useState(true);
  const [pkgsLoading, setPkgsLoading]           = useState(true);
  const [heroImg, setHeroImg]                   = useState(0);
  const [error, setError]                       = useState(null);

  const { scrollY } = useScroll();
  const parallax    = useTransform(scrollY, [0, 600], [0, -100]);

  // Fetch all data directly with api
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Featured Hotels
        setHotelsLoading(true);
        const hotelsRes = await api.get('/hotels/featured');
        console.log('Hotels Response:', hotelsRes.data);
        setFeaturedHotels(hotelsRes.data.hotels || []);
      } catch (err) {
        console.error('Hotels fetch error:', err.message);
        setError('Failed to load hotels. Is the server running?');
      } finally {
        setHotelsLoading(false);
      }

      try {
        // Packages
        setPkgsLoading(true);
        const pkgsRes = await api.get('/packages/featured');
        console.log('Packages Response:', pkgsRes.data);
        setFeaturedPackages(pkgsRes.data.packages || []);
      } catch (err) {
        console.error('Packages fetch error:', err.message);
      } finally {
        setPkgsLoading(false);
      }

      try {
        // Destinations
        const destRes = await api.get('/hotels/destinations');
        setDestinations(destRes.data.destinations || []);
      } catch (err) {
        console.error('Destinations fetch error:', err.message);
      }
    };

    fetchData();

    // Hero image rotation
    const iv = setInterval(() => setHeroImg(p => (p + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="overflow-hidden">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background */}
        <motion.div style={{ y: parallax }} className="absolute inset-0 z-0">
          {HERO_IMAGES.map((src, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-1000 ${i === heroImg ? 'opacity-100' : 'opacity-0'}`}
            >
              <img src={src} alt="" className="w-full h-full object-cover scale-110" />
              <div className="absolute inset-0 bg-gradient-to-b from-dark-bg/60 via-dark-bg/40 to-dark-bg" />
            </div>
          ))}
        </motion.div>

        {/* Content */}
        <div className="relative z-10 container-custom pt-28 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="badge-ocean text-xs mb-5 inline-flex">
              ✦ AI-Powered Travel Recommendations
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-5 text-white leading-tight tracking-tight">
              Discover Your
              <br />
              <span className="gradient-text font-display italic">Perfect Escape</span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Hotels, flights & curated packages — everything for the journey of a lifetime.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <HeroSearch />
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-8 mt-12"
          >
            {[
              { value: '10K+', label: 'Hotels Across India' },
              { value: '5L+',  label: 'Happy Travellers' },
              { value: '500+', label: 'Destinations' },
              { value: '4.9★', label: 'Average Rating' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold gradient-text">{value}</div>
                <div className="text-slate-400 text-sm mt-0.5">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ── API Error Banner ──────────────────────────────── */}
      {error && (
        <div className="container-custom py-4">
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm flex items-center gap-3">
            <span>⚠️</span>
            <div>
              <p className="font-medium">{error}</p>
              <p className="text-xs mt-0.5 text-red-400/70">
                Make sure your server is running: <code className="bg-red-500/10 px-1 rounded">cd server && npm run dev</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Popular Destinations ──────────────────────────── */}
      {destinations.length > 0 && (
        <section className="py-20 container-custom">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title">
                Popular <span className="gradient-text">Destinations</span>
              </h2>
              <p className="section-subtitle">Explore the world's most-loved travel spots</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {destinations.slice(0, 10).map((dest, i) => (
              <motion.div
                key={dest._id || i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/hotels?city=${encodeURIComponent(dest._id)}`}
                  className="block relative rounded-2xl overflow-hidden group"
                >
                  <div className="aspect-[3/4] bg-dark-card">
                    <img
                      src={
                        dest.coverImage?.url ||
                        `https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400`
                      }
                      alt={dest._id}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-bold text-base leading-tight">{dest._id}</h3>
                      <p className="text-white/60 text-xs">
                        {dest.hotelCount} hotel{dest.hotelCount > 1 ? 's' : ''}
                        {dest.minPrice ? ` · from ${formatPrice(dest.minPrice)}` : ''}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured Hotels ───────────────────────────────── */}
      <section className="py-20 container-custom">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-title">
              Featured <span className="gradient-text">Hotels</span>
            </h2>
            <p className="section-subtitle">Handpicked luxury stays for discerning travelers</p>
          </div>
          <Link
            to="/hotels"
            className="hidden md:flex items-center gap-2 text-ocean text-sm font-medium hover:gap-3 transition-all"
          >
            View all hotels <ArrowRight size={16} />
          </Link>
        </div>

        {/* Debug info if no hotels */}
        {!hotelsLoading && featuredHotels.length === 0 && (
          <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 text-sm">
            <p className="font-medium">⚠️ No hotels found</p>
            <p className="text-xs mt-1 text-yellow-400/70">
              Run the seeder to add sample data:
              <code className="ml-1 bg-yellow-500/10 px-1 rounded">cd server && node utils/seeder.js</code>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {hotelsLoading
            ? Array.from({ length: 8 }, (_, i) => <HotelCardSkeleton key={i} />)
            : featuredHotels.map((hotel, i) => (
                <HotelCard key={hotel._id} hotel={hotel} index={i} />
              ))
          }
        </div>

        <div className="text-center mt-8 md:hidden">
          <Link to="/hotels" className="btn-secondary inline-flex items-center gap-2">
            View all hotels <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Featured Packages ─────────────────────────────── */}
      <section className="py-20 bg-dark-card/30">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title">
                Curated <span className="gradient-text">Packages</span>
              </h2>
              <p className="section-subtitle">Complete travel experiences, expertly crafted</p>
            </div>
            <Link
              to="/packages"
              className="hidden md:flex items-center gap-2 text-ocean text-sm font-medium hover:gap-3 transition-all"
            >
              See all packages <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pkgsLoading
              ? Array.from({ length: 3 }, (_, i) => <PackageCardSkeleton key={i} />)
              : featuredPackages.length > 0
                ? featuredPackages.slice(0, 6).map((pkg, i) => (
                    <PackageCard key={pkg._id} pkg={pkg} index={i} />
                  ))
                : (
                  <div className="col-span-3 text-center py-12 text-slate-400">
                    <Package size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No packages available yet</p>
                  </div>
                )
            }
          </div>
        </div>
      </section>

      {/* ── Why Us ────────────────────────────────────────── */}
      <section className="py-24 container-custom">
        <div className="text-center mb-14">
          <h2 className="section-title">
            Why <span className="gradient-text">BharatYatra</span>?
          </h2>
          <p className="section-subtitle">Built for the modern Indian traveller who demands more</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 text-center group"
            >
              <div className="w-14 h-14 rounded-2xl bg-ocean/15 border border-ocean/25 flex items-center justify-center mx-auto mb-4 group-hover:shadow-glow-sm transition-all">
                <Icon size={24} className="text-ocean" />
              </div>
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-20 container-custom">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden
                     bg-gradient-to-br from-ocean/20 via-blue-900/30 to-purple-900/20
                     border border-ocean/20 p-10 md:p-16 text-center"
        >
          <div className="absolute inset-0 bg-glow opacity-50" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Ready for Your Next{' '}
              <span className="gradient-text">Indian Adventure?</span>
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
              Join 5 lakh+ travellers who trust BharatYatra for unforgettable journeys across Incredible India.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn-primary inline-flex items-center gap-2 text-base"
              >
                Start Planning Free <ArrowRight size={18} />
              </Link>
              <Link
                to="/hotels"
                className="btn-secondary inline-flex items-center gap-2 text-base"
              >
                Browse Hotels
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}