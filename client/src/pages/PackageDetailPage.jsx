import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  MapPin, Clock, Users, Star, Check, ChevronLeft,
  Calendar, Plane, Hotel, Utensils, ArrowRight,
} from 'lucide-react';
import { fetchPackageDetail } from '../store/slices/packageSlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { formatPrice } from '../utils/helpers';

export default function PackageDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuthenticated);
  const { currentPackage: pkg, loading } = useSelector(s => s.packages);

  useEffect(() => { dispatch(fetchPackageDetail(id)); }, [id, dispatch]);

  const handleBook = () => {
    if (!isAuth) { navigate('/login'); return; }
    navigate(`/booking/package/${pkg._id}`, { state: { pkg } });
  };

  if (loading || !pkg) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="spinner" />
    </div>
  );

  const discount = pkg.pricing?.originalPrice
    ? Math.round(((pkg.pricing.originalPrice - pkg.pricing.perPerson) / pkg.pricing.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container-custom py-8">
        <Link to="/packages" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm transition-colors">
          <ChevronLeft size={16} /> Back to Packages
        </Link>

        {/* Hero */}
        <div className="relative rounded-3xl overflow-hidden h-80 mb-8">
          <img
            src={pkg.coverImage?.url || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200'}
            alt={pkg.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              {discount > 0 && (
                <span className="badge bg-coral/20 text-coral border border-coral/30 text-xs mb-2 inline-flex">-{discount}% OFF</span>
              )}
              <h1 className="text-3xl font-bold text-white">{pkg.title}</h1>
              <p className="text-white/70 flex items-center gap-1.5 mt-1">
                <MapPin size={14} />{pkg.destination?.city}, {pkg.destination?.country}
              </p>
            </div>
            {pkg.ratings?.overall > 0 && (
              <div className="glass px-3 py-2 rounded-xl flex items-center gap-2">
                <Star size={14} className="text-sand" fill="currentColor" />
                <span className="text-white font-bold">{pkg.ratings.overall.toFixed(1)}</span>
                <span className="text-white/60 text-xs">({pkg.ratings.reviewCount})</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Clock,    label: 'Duration',    val: `${pkg.duration?.days}D/${pkg.duration?.nights}N` },
                { icon: Users,    label: 'Group Size',  val: `${pkg.groupSize?.min}-${pkg.groupSize?.max} people` },
                { icon: MapPin,   label: 'Destination', val: pkg.destination?.city },
                { icon: Calendar, label: 'Type',        val: pkg.packageType },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="bg-dark-card border border-dark-border rounded-xl p-4 text-center">
                  <Icon size={20} className="text-ocean mx-auto mb-2" />
                  <p className="text-slate-500 text-xs mb-1">{label}</p>
                  <p className="text-white font-semibold text-sm">{val}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">About This Package</h2>
              <p className="text-slate-300 leading-relaxed">{pkg.description}</p>
            </div>

            {/* Highlights */}
            {pkg.highlights?.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Highlights</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pkg.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-dark-card border border-dark-border rounded-xl">
                      <div className="w-7 h-7 rounded-lg bg-ocean/15 border border-ocean/25 flex-center shrink-0">
                        <Check size={13} className="text-ocean" />
                      </div>
                      <span className="text-slate-300 text-sm">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What's included */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">What's Included</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: 'flights',       label: 'Flights',      icon: Plane,    val: pkg.includes?.flights },
                  { key: 'accommodation', label: 'Hotels',       icon: Hotel,    val: pkg.includes?.accommodation },
                  { key: 'meals',         label: 'Meals',        icon: Utensils, val: pkg.includes?.meals },
                  { key: 'transfers',     label: 'Transfers',    icon: MapPin,   val: pkg.includes?.transfers },
                  { key: 'guide',         label: 'Tour Guide',   icon: Users,    val: pkg.includes?.guide },
                  { key: 'insurance',     label: 'Insurance',    icon: Check,    val: pkg.includes?.insurance },
                ].map(({ label, icon: Icon, val }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border ${
                      val
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                        : 'bg-dark-card border-dark-border text-slate-600 line-through'
                    }`}
                  >
                    <Icon size={15} />
                    <span className="text-sm font-medium">{label}</span>
                    {typeof val === 'string' && val !== 'true' && val !== 'false' && (
                      <span className="text-xs opacity-70">({val})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Itinerary */}
            {pkg.itinerary?.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Day-by-Day Itinerary</h2>
                <div className="space-y-3">
                  {pkg.itinerary.map((day, i) => (
                    <details key={i} className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden group">
                      <summary className="flex items-center gap-4 p-5 cursor-pointer list-none">
                        <div className="w-10 h-10 rounded-xl bg-ocean/15 border border-ocean/25 flex-center shrink-0 text-ocean font-bold text-sm">
                          {day.day}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold">{day.title}</p>
                          <p className="text-slate-500 text-xs">{day.activities?.length} activities</p>
                        </div>
                        <ArrowRight size={16} className="text-slate-500 group-open:rotate-90 transition-transform" />
                      </summary>
                      <div className="px-5 pb-5 space-y-2">
                        {day.activities?.map((activity, j) => (
                          <div key={j} className="flex items-center gap-2 text-slate-300 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-ocean shrink-0" />
                            {activity}
                          </div>
                        ))}
                        {day.meals && (
                          <div className="flex gap-3 mt-3 pt-3 border-t border-dark-border">
                            {day.meals.breakfast && <span className="badge-ocean text-xs">🍳 Breakfast</span>}
                            {day.meals.lunch     && <span className="badge-ocean text-xs">🥗 Lunch</span>}
                            {day.meals.dinner    && <span className="badge-ocean text-xs">🍽️ Dinner</span>}
                          </div>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Card */}
          <div>
            <div className="sticky top-24 bg-dark-card border border-dark-border rounded-2xl p-6">
              <div className="mb-2">
                {pkg.pricing?.originalPrice && (
                  <p className="text-slate-500 text-sm line-through">{formatPrice(pkg.pricing.originalPrice)}</p>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{formatPrice(pkg.pricing?.perPerson)}</span>
                  <span className="text-slate-400 text-sm">per person</span>
                </div>
                {discount > 0 && (
                  <span className="badge bg-coral/15 text-coral border border-coral/25 text-xs mt-1 inline-flex">
                    Save {discount}%
                  </span>
                )}
              </div>

              <div className="divider" />

              <div className="space-y-2.5 text-sm mb-5">
                {[
                  { label: 'Duration',     val: `${pkg.duration?.days} days / ${pkg.duration?.nights} nights` },
                  { label: 'Package Type', val: pkg.packageType },
                  { label: 'Group Size',   val: `${pkg.groupSize?.min} to ${pkg.groupSize?.max} people` },
                  { label: 'Difficulty',   val: pkg.difficulty },
                ].map(({ label, val }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-white font-medium capitalize">{val}</span>
                  </div>
                ))}
              </div>

              <button onClick={handleBook} className="w-full btn-primary py-3 text-base flex-center gap-2 mb-3">
                Book This Package →
              </button>

              <p className="text-center text-slate-500 text-xs">Free cancellation · Instant confirmation</p>

              {pkg.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-dark-border">
                  {pkg.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-md bg-white/5 text-slate-400 text-xs">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}