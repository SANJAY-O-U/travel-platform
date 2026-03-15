// ============================================================
// BookingPage — Checkout Form with Price Summary
// ============================================================
import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  ChevronLeft, User, Mail, Phone, CreditCard,
  Shield, Check, Calendar, Users, MapPin, Clock,
} from 'lucide-react';
import { createBooking, selectBookingLoading } from '../store/slices/bookingSlice';
import { selectUser } from '../store/slices/authSlice';
import { formatPrice, formatDate, calcNights, calcTotalPrice } from '../utils/helpers';
import api from '../utils/api';

export default function BookingPage() {
  const { type, id } = useParams();
  const location     = useLocation();
  const navigate     = useNavigate();
  const dispatch     = useDispatch();
  const user         = useSelector(selectUser);
  const loading      = useSelector(selectBookingLoading);

  const state = location.state || {};
  const { hotel, room, flight, pkg, checkIn, checkOut, nights: stateNights, guests: stateGuests } = state;

  const nights  = stateNights || calcNights(checkIn, checkOut) || 1;
  const guests  = stateGuests || 1;

  // Resource to book (loaded from state or fetch)
  const [resource, setResource] = useState(hotel || flight || pkg || null);

  // Guest form
  const [guestForm, setGuestForm] = useState({
    name:        user?.name || '',
    email:       user?.email || '',
    phone:       user?.phone || '',
    nationality: '',
    idType:      'Passport',
    idNumber:    '',
  });

  const [guestCount, setGuestCount] = useState({ adults: guests, children: 0, infants: 0 });
  const [specialRequests, setSpecialRequests] = useState('');
  const [addOns, setAddOns] = useState([]);
  const [step, setStep] = useState(1); // 1: guest info, 2: review & pay

  useEffect(() => {
    if (!resource && id) {
      const endpoint = type === 'hotel' ? `/hotels/${id}` : type === 'flight' ? `/flights/${id}` : `/packages/${id}`;
      api.get(endpoint).then(({ data }) => {
        setResource(data.hotel || data.flight || data.package);
      });
    }
  }, [id, type, resource]);

  // Price calculation
  const basePrice = type === 'hotel'
    ? (room?.pricePerNight || resource?.priceRange?.min || 0) * nights
    : type === 'flight'
    ? (resource?.basePrice || 0) * guestCount.adults
    : (resource?.pricing?.perPerson || 0) * guestCount.adults;

  const taxes = Math.round(basePrice * 0.12);
  const fees  = 25;
  const addOnTotal = addOns.reduce((sum, a) => sum + a.price * a.quantity, 0);
  const totalAmount = basePrice + taxes + fees + addOnTotal;

  const AVAILABLE_ADDONS = [
    { name: 'Airport Transfer', price: 35, quantity: 0 },
    { name: 'Travel Insurance', price: 45, quantity: 0 },
    { name: 'Early Check-in',   price: 20, quantity: 0 },
    { name: 'Late Check-out',   price: 20, quantity: 0 },
  ];

  const toggleAddon = (addon) => {
    const idx = addOns.findIndex(a => a.name === addon.name);
    if (idx > -1) {
      setAddOns(addOns.filter(a => a.name !== addon.name));
    } else {
      setAddOns([...addOns, { ...addon, quantity: 1 }]);
    }
  };

  const handleSubmit = async () => {
    const bookingData = {
      bookingType: type,
      hotelId:     type === 'hotel'   ? id : undefined,
      flightId:    type === 'flight'  ? id : undefined,
      packageId:   type === 'package' ? id : undefined,
      room:        type === 'hotel' ? room : undefined,
      checkIn:     checkIn   || undefined,
      checkOut:    checkOut  || undefined,
      guests:      guestCount,
      primaryGuest: guestForm,
      pricing: {
        basePrice,
        taxes,
        fees,
        totalAmount,
        currency: 'USD',
      },
      specialRequests,
      addOns: addOns.filter(a => a.quantity > 0),
    };

    const result = await dispatch(createBooking(bookingData));
    if (createBooking.fulfilled.match(result)) {
      navigate(`/booking/confirm/${result.payload.booking._id}`);
    }
  };

  if (!resource) return (
    <div className="min-h-screen pt-24 flex-center">
      <div className="spinner" />
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-16 bg-dark-bg">
      <div className="container-custom py-8">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm transition-colors">
          <ChevronLeft size={16} /> Back
        </button>

        <h1 className="text-2xl font-bold text-white mb-8">Complete Your Booking</h1>

        {/* Progress steps */}
        <div className="flex items-center gap-3 mb-10">
          {['Guest Details', 'Review & Pay'].map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 ${step > i + 1 ? 'text-emerald-400' : step === i + 1 ? 'text-ocean' : 'text-slate-600'}`}>
                <div className={`w-7 h-7 rounded-full flex-center text-xs font-bold border-2 transition-all ${
                  step > i + 1 ? 'bg-emerald-500/20 border-emerald-500' :
                  step === i + 1 ? 'bg-ocean/20 border-ocean' :
                  'bg-dark-card border-dark-border'
                }`}>
                  {step > i + 1 ? <Check size={12} /> : i + 1}
                </div>
                <span className="text-sm font-medium hidden sm:block">{s}</span>
              </div>
              {i < 1 && <div className={`h-px w-8 ${step > 1 ? 'bg-emerald-500' : 'bg-dark-border'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: Form ───────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                {/* Guest info */}
                <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                    <User size={18} className="text-ocean" /> Primary Guest
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'name',        label: 'Full Name',   type: 'text',  icon: User,     required: true },
                      { key: 'email',       label: 'Email',       type: 'email', icon: Mail,     required: true },
                      { key: 'phone',       label: 'Phone',       type: 'tel',   icon: Phone,    required: true },
                      { key: 'nationality', label: 'Nationality', type: 'text',  icon: null,     required: false },
                    ].map(({ key, label, type: inputType, icon: Icon, required }) => (
                      <div key={key}>
                        <label className="input-label">{label} {required && <span className="text-red-400">*</span>}</label>
                        <div className="relative">
                          {Icon && <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />}
                          <input
                            type={inputType}
                            value={guestForm[key]}
                            onChange={(e) => setGuestForm({ ...guestForm, [key]: e.target.value })}
                            className={`input ${Icon ? 'pl-10' : ''}`}
                            required={required}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Guest count */}
                <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                    <Users size={18} className="text-ocean" /> Number of Guests
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { key: 'adults',   label: 'Adults',   sub: '12+ years', min: 1 },
                      { key: 'children', label: 'Children', sub: '2-11 years', min: 0 },
                      { key: 'infants',  label: 'Infants',  sub: 'Under 2', min: 0 },
                    ].map(({ key, label, sub, min }) => (
                      <div key={key}>
                        <p className="text-white text-sm font-medium">{label}</p>
                        <p className="text-slate-500 text-xs mb-2">{sub}</p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setGuestCount(g => ({ ...g, [key]: Math.max(min, g[key] - 1) }))}
                            className="w-8 h-8 rounded-lg bg-dark-bg border border-dark-border flex-center text-slate-300 hover:border-ocean/40"
                          >-</button>
                          <span className="text-white font-semibold w-6 text-center">{guestCount[key]}</span>
                          <button
                            type="button"
                            onClick={() => setGuestCount(g => ({ ...g, [key]: g[key] + 1 }))}
                            className="w-8 h-8 rounded-lg bg-dark-bg border border-dark-border flex-center text-slate-300 hover:border-ocean/40"
                          >+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add-ons */}
                <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-5">Enhance Your Stay</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {AVAILABLE_ADDONS.map(addon => {
                      const selected = addOns.find(a => a.name === addon.name);
                      return (
                        <button
                          key={addon.name}
                          type="button"
                          onClick={() => toggleAddon(addon)}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            selected ? 'border-ocean/40 bg-ocean/10' : 'border-dark-border hover:border-ocean/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white text-sm font-medium">{addon.name}</span>
                            {selected && <Check size={14} className="text-ocean" />}
                          </div>
                          <span className="text-ocean text-sm font-semibold">{formatPrice(addon.price)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Special requests */}
                <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-3">Special Requests</h2>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    rows={3}
                    placeholder="Any specific requests? (e.g., high floor, connecting rooms, dietary needs...)"
                    className="input resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-slate-600 mt-1">{specialRequests.length}/500</p>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!guestForm.name || !guestForm.email || !guestForm.phone}
                  className="w-full btn-primary py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Continue to Review →
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                {/* Summary */}
                <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Booking Summary</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-slate-300">
                      <span>Guest Name</span><span className="text-white">{guestForm.name}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Email</span><span className="text-white">{guestForm.email}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Phone</span><span className="text-white">{guestForm.phone}</span>
                    </div>
                    {checkIn && <div className="flex justify-between text-slate-300">
                      <span>Check-in</span><span className="text-white">{formatDate(checkIn)}</span>
                    </div>}
                    {checkOut && <div className="flex justify-between text-slate-300">
                      <span>Check-out</span><span className="text-white">{formatDate(checkOut)}</span>
                    </div>}
                    <div className="flex justify-between text-slate-300">
                      <span>Guests</span>
                      <span className="text-white">
                        {guestCount.adults} adult{guestCount.adults > 1 ? 's' : ''}
                        {guestCount.children > 0 && `, ${guestCount.children} children`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment (demo) */}
                <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <CreditCard size={18} className="text-ocean" /> Payment Method
                  </h2>
                  <div className="p-4 rounded-xl border border-ocean/30 bg-ocean/5 flex items-center gap-3">
                    <CreditCard size={20} className="text-ocean" />
                    <div>
                      <p className="text-white text-sm font-medium">Demo Mode — No charge</p>
                      <p className="text-slate-500 text-xs">Booking will be confirmed instantly</p>
                    </div>
                    <Check size={16} className="text-emerald-400 ml-auto" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-ghost flex-1 py-3">← Back</button>
                  <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 py-3 text-base flex-center gap-2">
                    {loading ? <><div className="spinner w-5 h-5 border-2" /> Confirming...</> : 'Confirm Booking →'}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Right: Price Summary ──────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-dark-card border border-dark-border rounded-2xl p-6">
              {/* Property info */}
              <div className="flex gap-3 pb-5 border-b border-dark-border mb-5">
                <img
                  src={resource?.coverImage?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'}
                  alt=""
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                />
                <div>
                  <p className="text-white font-semibold text-sm leading-tight line-clamp-2">
                    {resource?.name || resource?.flightNumber || resource?.title}
                  </p>
                  {resource?.location && (
                    <p className="text-slate-500 text-xs flex items-center gap-1 mt-1">
                      <MapPin size={10} /> {resource.location.city}
                    </p>
                  )}
                  {room && (
                    <span className="badge-ocean text-xs mt-1.5 inline-flex">{room.roomType} Room</span>
                  )}
                </div>
              </div>

              {/* Dates */}
              {(checkIn || checkOut) && (
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {checkIn && (
                    <div className="bg-dark-bg rounded-xl p-3 text-center">
                      <p className="text-slate-500 text-xs">Check-in</p>
                      <p className="text-white text-sm font-medium">{formatDate(checkIn, 'dd MMM')}</p>
                    </div>
                  )}
                  {checkOut && (
                    <div className="bg-dark-bg rounded-xl p-3 text-center">
                      <p className="text-slate-500 text-xs">Check-out</p>
                      <p className="text-white text-sm font-medium">{formatDate(checkOut, 'dd MMM')}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Price breakdown */}
              <div className="space-y-2.5 text-sm mb-5">
                <div className="flex justify-between text-slate-400">
                  <span>
                    {type === 'hotel'
                      ? `${formatPrice(room?.pricePerNight || 0)} × ${nights} nights`
                      : `${formatPrice(resource?.basePrice || resource?.pricing?.perPerson || 0)} × ${guestCount.adults} guests`
                    }
                  </span>
                  <span>{formatPrice(basePrice)}</span>
                </div>
                {addOns.map(a => (
                  <div key={a.name} className="flex justify-between text-slate-400">
                    <span>{a.name}</span>
                    <span>{formatPrice(a.price)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-slate-400">
                  <span>Taxes (12%)</span>
                  <span>{formatPrice(taxes)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Service fee</span>
                  <span>{formatPrice(fees)}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-base pt-3 border-t border-dark-border">
                  <span>Total</span>
                  <span className="text-ocean">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="space-y-2">
                {[
                  { icon: Shield, text: 'Secure & encrypted payment' },
                  { icon: Check,  text: 'Free cancellation available' },
                  { icon: Clock,  text: 'Instant confirmation' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-xs text-slate-500">
                    <Icon size={13} className="text-emerald-400 shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}