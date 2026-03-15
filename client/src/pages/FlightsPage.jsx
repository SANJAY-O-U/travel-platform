import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  Plane, ArrowLeftRight, Calendar, Users, Clock,
  Wifi, Utensils, ChevronDown, Search, TrendingUp,
} from 'lucide-react';
import { searchFlights, fetchPopularRoutes } from '../store/slices/flightSlice';
import { FlightCardSkeleton } from '../components/common/SkeletonCard';
import { formatPrice } from '../utils/helpers';

function FlightCard({ flight, onBook }) {
  const dep = new Date(flight.departureTime);
  const arr = new Date(flight.arrivalTime);
  const depTime = dep.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const arrTime = arr.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const durationStr = `${flight.duration?.hours}h ${flight.duration?.minutes || 0}m`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-card border border-dark-border rounded-2xl p-5 hover:border-ocean/30 transition-all duration-300"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-5">
        <div className="flex items-center gap-3 md:w-44 shrink-0">
          <div className="w-11 h-11 rounded-xl bg-dark-bg border border-dark-border flex items-center justify-center">
            <Plane size={18} className="text-ocean" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold">{flight.airline?.name}</p>
            <p className="text-slate-500 text-xs">{flight.flightNumber}</p>
            <p className="text-slate-600 text-xs capitalize">{flight.flightClass}</p>
          </div>
        </div>

        <div className="flex-1 flex items-center gap-4">
          <div className="text-center min-w-[70px]">
            <p className="text-white text-2xl font-bold tabular-nums">{depTime}</p>
            <p className="text-slate-500 text-xs font-medium">{flight.origin?.airportCode}</p>
            <p className="text-slate-400 text-xs truncate max-w-[80px]">{flight.origin?.city}</p>
          </div>

          <div className="flex-1 flex flex-col items-center gap-1 px-2">
            <p className="text-slate-500 text-xs flex items-center gap-1">
              <Clock size={10} />{durationStr}
            </p>
            <div className="w-full flex items-center gap-1">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-ocean/60" />
              <div className="w-2 h-2 rounded-full bg-ocean" />
              <Plane size={16} className="text-ocean" />
              <div className="h-px flex-1 bg-gradient-to-r from-ocean/60 to-transparent" />
            </div>
            <p className="text-slate-500 text-xs">{flight.stops === 0 ? 'Direct' : `${flight.stops} stop`}</p>
          </div>

          <div className="text-center min-w-[70px]">
            <p className="text-white text-2xl font-bold tabular-nums">{arrTime}</p>
            <p className="text-slate-500 text-xs font-medium">{flight.destination?.airportCode}</p>
            <p className="text-slate-400 text-xs truncate max-w-[80px]">{flight.destination?.city}</p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4 text-slate-500 text-xs">
          <div className="text-center">
            <p className="font-medium text-slate-300 mb-1">Baggage</p>
            <p>{flight.baggage?.carryOn} cabin</p>
            <p>{flight.baggage?.checkedBaggage} check</p>
          </div>
          <div className="flex flex-col gap-1.5">
            {flight.wifi && (
              <span className="flex items-center gap-1 text-emerald-400"><Wifi size={12} />WiFi</span>
            )}
            {flight.meals !== 'Not Included' && (
              <span className="flex items-center gap-1 text-emerald-400"><Utensils size={12} />{flight.meals}</span>
            )}
          </div>
        </div>

        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-3 md:min-w-[130px] shrink-0">
          <div className="md:text-right">
            <p className="text-2xl font-bold text-white">{formatPrice(flight.basePrice)}</p>
            <p className="text-slate-500 text-xs">per person</p>
            {flight.seats?.economy?.available < 10 && flight.seats?.economy?.available > 0 && (
              <p className="text-coral text-xs mt-0.5">Only {flight.seats.economy.available} left!</p>
            )}
          </div>
          <button onClick={() => onBook(flight)} className="btn-primary text-sm py-2 px-5 whitespace-nowrap">
            Book →
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function FlightsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: flights, loading, popularRoutes } = useSelector(s => s.flights);

  const [params, setParams] = useState({
    from: '', to: '', date: '', returnDate: '',
    passengers: 1, flightClass: 'Economy', sortBy: 'price',
  });
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => { dispatch(fetchPopularRoutes()); }, [dispatch]);

  const handleSearch = () => {
    setHasSearched(true);
    dispatch(searchFlights(params));
  };

  const handleBook = (flight) => {
    navigate(`/booking/flight/${flight._id}`, { state: { flight, passengers: params.passengers } });
  };

  const handleRouteClick = (route) => {
    const updated = { ...params, from: route._id.from, to: route._id.to };
    setParams(updated);
    setHasSearched(true);
    dispatch(searchFlights(updated));
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="bg-gradient-to-b from-dark-card/40 to-transparent border-b border-dark-border">
        <div className="container-custom py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Find <span className="gradient-text">Flights</span>
            </h1>
            <p className="text-slate-400">Search hundreds of airlines for the best deals</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-dark-card border border-dark-border rounded-2xl p-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
              <div className="relative lg:col-span-2">
                <label className="input-label">From</label>
                <div className="relative">
                  <Plane size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ocean" />
                  <input
                    type="text"
                    placeholder="City or airport"
                    value={params.from}
                    onChange={(e) => setParams({ ...params, from: e.target.value })}
                    className="input pl-9 py-2.5"
                  />
                </div>
              </div>

              <div className="relative lg:col-span-2">
                <label className="input-label">To</label>
                <div className="relative">
                  <Plane size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ocean rotate-90" />
                  <input
                    type="text"
                    placeholder="City or airport"
                    value={params.to}
                    onChange={(e) => setParams({ ...params, to: e.target.value })}
                    className="input pl-9 py-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Departure</label>
                <input
                  type="date"
                  value={params.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setParams({ ...params, date: e.target.value })}
                  className="input py-2.5 [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="input-label">Passengers</label>
                <input
                  type="number"
                  min={1} max={9}
                  value={params.passengers}
                  onChange={(e) => setParams({ ...params, passengers: Number(e.target.value) })}
                  className="input py-2.5"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <div className="relative">
                <select
                  value={params.flightClass}
                  onChange={(e) => setParams({ ...params, flightClass: e.target.value })}
                  className="input py-2.5 pr-8 appearance-none text-sm"
                >
                  {['Economy', 'Premium Economy', 'Business', 'First Class'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={params.sortBy}
                  onChange={(e) => setParams({ ...params, sortBy: e.target.value })}
                  className="input py-2.5 pr-8 appearance-none text-sm"
                >
                  <option value="price">Sort: Price</option>
                  <option value="duration">Sort: Duration</option>
                  <option value="departure">Sort: Departure</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <button onClick={handleSearch} className="btn-primary ml-auto flex items-center gap-2 px-6 py-2.5">
                <Search size={16} /> Search Flights
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-8">
        {!hasSearched && popularRoutes.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-ocean" /> Popular Routes
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularRoutes.slice(0, 8).map((route, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleRouteClick(route)}
                  className="bg-dark-card border border-dark-border rounded-xl p-4 text-left hover:border-ocean/30 hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-white mb-1">
                    <span>{route._id?.from}</span>
                    <ArrowLeftRight size={12} className="text-ocean" />
                    <span>{route._id?.to}</span>
                  </div>
                  <p className="text-ocean text-sm font-semibold">{formatPrice(route.minPrice)}</p>
                  <p className="text-slate-600 text-xs mt-0.5">{route.airline}</p>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {hasSearched && (
          <div>
            <p className="text-slate-400 text-sm mb-6">
              {loading ? 'Searching flights...' : (
                <><span className="text-white font-semibold">{flights.length}</span> flights found</>
              )}
            </p>
            <div className="space-y-4">
              {loading
                ? Array.from({ length: 4 }, (_, i) => <FlightCardSkeleton key={i} />)
                : flights.length > 0
                  ? flights.map((f, i) => <FlightCard key={f._id} flight={f} onBook={handleBook} />)
                  : (
                    <div className="py-20 text-center">
                      <div className="text-6xl mb-4">✈️</div>
                      <h3 className="text-xl font-semibold text-white mb-2">No flights found</h3>
                      <p className="text-slate-400">Try different dates or destinations</p>
                    </div>
                  )
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}