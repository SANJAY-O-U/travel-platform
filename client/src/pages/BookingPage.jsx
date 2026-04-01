import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  ChevronLeft, User, Mail, Phone, CreditCard,
  Shield, Check, Calendar, Users, MapPin, Clock,
  AlertCircle,
} from 'lucide-react';
import { createBooking } from '../store/slices/bookingSlice';
import { selectUser } from '../store/slices/authSlice';
import { formatPrice, formatDate, calcNights, calcTotalPrice } from '../utils/helpers';
import api from '../utils/api';
import toast from 'react-hot-toast';

// ── Step Indicator ────────────────────────────────────────────
function StepIndicator({ step }) {
  const steps = ['Guest Details', 'Review & Pay'];
  return (
    <div className="flex items-center gap-3 mb-10">
      {steps.map((label, i) => {
        const num      = i + 1;
        const done     = step > num;
        const active   = step === num;
        return (
          <div key={label} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  done   ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' :
                  active ? 'bg-ocean/20 border-ocean text-ocean' :
                           'bg-dark-card border-dark-border text-slate-600'
                }`}
              >
                {done ? <Check size={14} /> : num}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${
                active ? 'text-white' : done ? 'text-emerald-400' : 'text-slate-600'
              }`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px w-8 transition-colors ${done ? 'bg-emerald-500' : 'bg-dark-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Add-on options ────────────────────────────────────────────
const ADDON_OPTIONS = [
  { name: 'Airport Transfer', price: 35 },
  { name: 'Travel Insurance', price: 45 },
  { name: 'Early Check-in',   price: 20 },
  { name: 'Late Check-out',   price: 20 },
  { name: 'Breakfast Pack',   price: 25 },
];

// ── Main Component ────────────────────────────────────────────
export default function BookingPage() {
  // FIXED: Define bookingType and resourceId from useParams
  const { type: bookingType, id: resourceId } = useParams();
  const location     = useLocation();
  const navigate     = useNavigate();
  const dispatch     = useDispatch();
  const user         = useSelector(selectUser);

  // Get data passed from previous page
  const state = location.state || {};
  const {
    hotel,
    room,
    flight,
    pkg,
    checkIn,
    checkOut,
    nights: stateNights,
    guests: stateGuests,
  } = state;

  const nights = stateNights || calcNights(checkIn, checkOut) || 1;
  const guests = stateGuests || 1;

  const [resource,  setResource]  = useState(hotel || flight || pkg || null);
  const [step,      setStep]      = useState(1);
  const [submitting,setSubmitting]= useState(false);
  const [formError, setFormError] = useState('');

  const [guestForm, setGuestForm] = useState({
    name:        user?.name        || '',
    email:       user?.email       || '',
    phone:       user?.phone       || '',
    nationality: user?.nationality || '',
  });

  const [guestCount, setGuestCount] = useState({
    adults:   typeof guests === 'object' ? (guests.adults   || 1) : (guests || 1),
    children: typeof guests === 'object' ? (guests.children || 0) : 0,
    infants:  typeof guests === 'object' ? (guests.infants  || 0) : 0,
  });

  const [specialRequests, setSpecialRequests] = useState('');
  const [selectedAddOns,  setSelectedAddOns]  = useState([]);

  // Fetch resource if not passed via state
  useEffect(() => {
    if (!resource && resourceId) {
      const endpoint =
        bookingType === 'hotel'   ? `/hotels/${resourceId}`   :
        bookingType === 'flight'  ? `/flights/${resourceId}`  :
        `/packages/${resourceId}`;

      api.get(endpoint)
        .then(({ data }) => {
          setResource(data.hotel || data.flight || data.package || null);
        })
        .catch((err) => {
          console.error('Failed to load resource:', err.message);
          toast.error('Could not load booking details');
        });
    }
  }, [resourceId, bookingType, resource]);

  // ── Price Calculation ─────────────────────────────────────
  const basePrice = (() => {
    if (bookingType === 'hotel') {
      const ppn = room?.pricePerNight || resource?.priceRange?.min || 0;
      return ppn * nights;
    }
    if (bookingType === 'flight') {
      return (resource?.basePrice || 0) * (guestCount.adults || 1);
    }
    if (bookingType === 'package') {
      return (resource?.pricing?.perPerson || 0) * (guestCount.adults || 1);
    }
    return 0;
  })();

  const addOnTotal  = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const taxes       = Math.round(basePrice * 0.12);
  const fees        = 25;
  const totalAmount = basePrice + taxes + fees + addOnTotal;

  // Toggle add-on
  const toggleAddon = (addon) => {
    setSelectedAddOns((prev) => {
      const exists = prev.find((a) => a.name === addon.name);
      return exists
        ? prev.filter((a) => a.name !== addon.name)
        : [...prev, { ...addon, quantity: 1 }];
    });
  };

  // Validate step 1
  const validateStep1 = () => {
    if (!guestForm.name.trim()) {
      setFormError('Please enter the guest name');
      return false;
    }
    if (!guestForm.email.trim()) {
      setFormError('Please enter an email address');
      return false;
    }
    if (!guestForm.phone.trim()) {
      setFormError('Please enter a phone number');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestForm.email)) {
      setFormError('Please enter a valid email address');
      return false;
    }
    setFormError('');
    return true;
  };

  // Go to step 2
  const handleContinue = () => {
    if (!validateStep1()) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);

    // FIXED: Define the variables used in the dispatch payload
    const guestInfo = { ...guestForm };
    const pricing = {
      basePrice,
      taxes,
      fees,
      addOnTotal,
      totalAmount
    };
    const addOns = selectedAddOns;

    try {
      const result = await dispatch(createBooking({
        bookingType,
        hotelId:        bookingType === 'hotel'   ? resourceId : undefined,
        flightId:       bookingType === 'flight'  ? resourceId : undefined,
        packageId:      bookingType === 'package' ? resourceId : undefined,
        room,
        checkIn,
        checkOut,
        guests:         guestCount,
        primaryGuest:   guestInfo,
        pricing,
        specialRequests,
        addOns,
      }));

      // ✅ Check thunk result BEFORE navigating
      if (createBooking.fulfilled.match(result)) {
        const bookingId = result.payload?.booking?._id || result.payload?._id;
        if (bookingId) {
          navigate(`/booking/confirm/${bookingId}`);
        } else {
          toast.error('Booking created but ID missing — check your bookings page.');
          navigate('/dashboard/bookings');
        }
      } else {
        // rejected
        toast.error(result.payload || 'Booking failed');
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
      console.error('Booking error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (!resource) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-dark-bg">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-slate-400">Loading booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-dark-bg">
      <div className="container-custom py-8">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <h1 className="text-2xl font-bold text-white mb-6">Complete Your Booking</h1>

        {/* Step Indicator */}
        <StepIndicator step={step} />

        {/* Global Form Error */}
        {formError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{formError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: Form ────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            <AnimatePresence mode="wait">
              {/* Step 1: Guest Details */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Guest Info */}
                  <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                      <User size={18} className="text-ocean" />
                      Primary Guest Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="input-label">
                          Full Name <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            type="text"
                            value={guestForm.name}
                            onChange={(e) => {
                              setGuestForm({ ...guestForm, name: e.target.value });
                              setFormError('');
                            }}
                            placeholder="John Doe"
                            className="input pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="input-label">
                          Email <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            type="email"
                            value={guestForm.email}
                            onChange={(e) => {
                              setGuestForm({ ...guestForm, email: e.target.value });
                              setFormError('');
                            }}
                            placeholder="john@example.com"
                            className="input pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="input-label">
                          Phone <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            type="tel"
                            value={guestForm.phone}
                            onChange={(e) => {
                              setGuestForm({ ...guestForm, phone: e.target.value });
                              setFormError('');
                            }}
                            placeholder="+1 234 567 8900"
                            className="input pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="input-label">Nationality</label>
                        <input
                          type="text"
                          value={guestForm.nationality}
                          onChange={(e) => setGuestForm({ ...guestForm, nationality: e.target.value })}
                          placeholder="e.g. American"
                          className="input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Guest Count */}
                  <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                      <Users size={18} className="text-ocean" />
                      Number of Guests
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { key: 'adults',   label: 'Adults',   sub: '12+ years', min: 1 },
                        { key: 'children', label: 'Children', sub: '2-11 years', min: 0 },
                        { key: 'infants',  label: 'Infants',  sub: 'Under 2',   min: 0 },
                      ].map(({ key, label, sub, min }) => (
                        <div key={key}>
                          <p className="text-white text-sm font-medium">{label}</p>
                          <p className="text-slate-500 text-xs mb-2">{sub}</p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setGuestCount(g => ({ ...g, [key]: Math.max(min, g[key] - 1) }))}
                              className="w-8 h-8 rounded-lg bg-dark-bg border border-dark-border flex items-center justify-center text-slate-300 hover:border-ocean/40 hover:text-ocean transition-all"
                            >
                              −
                            </button>
                            <span className="text-white font-semibold w-6 text-center">
                              {guestCount[key]}
                            </span>
                            <button
                              type="button"
                              onClick={() => setGuestCount(g => ({ ...g, [key]: g[key] + 1 }))}
                              className="w-8 h-8 rounded-lg bg-dark-bg border border-dark-border flex items-center justify-center text-slate-300 hover:border-ocean/40 hover:text-ocean transition-all"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add-ons */}
                  <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">
                      Enhance Your Stay <span className="text-slate-500 text-sm font-normal">(Optional)</span>
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      {ADDON_OPTIONS.map((addon) => {
                        const selected = selectedAddOns.find((a) => a.name === addon.name);
                        return (
                          <button
                            key={addon.name}
                            type="button"
                            onClick={() => toggleAddon(addon)}
                            className={`p-4 rounded-xl border text-left transition-all ${
                              selected
                                ? 'border-ocean/40 bg-ocean/10'
                                : 'border-dark-border hover:border-ocean/30 bg-dark-bg'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-white text-sm font-medium">{addon.name}</span>
                              {selected && <Check size={14} className="text-ocean" />}
                            </div>
                            <span className="text-ocean text-sm font-semibold">
                              +{formatPrice(addon.price)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-3">Special Requests</h2>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={3}
                      maxLength={500}
                      placeholder="High floor, connecting rooms, dietary needs, anniversary setup..."
                      className="input resize-none"
                    />
                    <p className="text-xs text-slate-600 mt-1 text-right">
                      {specialRequests.length}/500
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleContinue}
                    className="w-full btn-primary py-3 text-base"
                  >
                    Continue to Review →
                  </button>
                </motion.div>
              )}

              {/* Step 2: Review & Pay */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Booking Summary */}
                  <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Booking Summary</h2>
                    <div className="space-y-3 text-sm">
                      {[
                        { label: 'Guest Name',   val: guestForm.name },
                        { label: 'Email',       val: guestForm.email },
                        { label: 'Phone',       val: guestForm.phone },
                        ...(guestForm.nationality ? [{ label: 'Nationality', val: guestForm.nationality }] : []),
                        ...(checkIn  ? [{ label: 'Check-in',  val: formatDate(checkIn) }]  : []),
                        ...(checkOut ? [{ label: 'Check-out', val: formatDate(checkOut) }] : []),
                        {
                          label: 'Guests',
                          val: [
                            `${guestCount.adults} adult${guestCount.adults > 1 ? 's' : ''}`,
                            guestCount.children > 0 ? `${guestCount.children} children` : '',
                            guestCount.infants  > 0 ? `${guestCount.infants} infants`   : '',
                          ].filter(Boolean).join(', '),
                        },
                      ].map(({ label, val }) => (
                        <div key={label} className="flex justify-between">
                          <span className="text-slate-400">{label}</span>
                          <span className="text-white font-medium text-right max-w-[200px] truncate">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <CreditCard size={18} className="text-ocean" />
                      Payment Method
                    </h2>
                    <div className="p-4 rounded-xl border border-ocean/30 bg-ocean/5 flex items-center gap-3">
                      <CreditCard size={20} className="text-ocean" />
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">Demo Mode — No charge</p>
                        <p className="text-slate-500 text-xs">Booking confirmed instantly for testing</p>
                      </div>
                      <Check size={16} className="text-emerald-400" />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setStep(1); setFormError(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={submitting}
                      className="btn-ghost flex-1 py-3 disabled:opacity-50"
                    >
                      ← Back
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={submitting}
                      className="btn-primary flex-1 py-3 text-base flex items-center justify-center gap-2
                                 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <div className="spinner w-5 h-5 border-2" />
                          <span>Confirming...</span>
                        </>
                      ) : (
                        <>
                          <span>Confirm Booking</span>
                          <Check size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Right: Price Summary ───────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-dark-card border border-dark-border rounded-2xl p-6">
              {/* Property Info */}
              <div className="flex gap-3 pb-5 border-b border-dark-border mb-5">
                <img
                  src={
                    resource?.coverImage?.url ||
                    resource?.images?.[0]?.url ||
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'
                  }
                  alt=""
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm leading-tight line-clamp-2">
                    {resource?.name || resource?.title || resource?.flightNumber || 'Your Booking'}
                  </p>
                  {resource?.location && (
                    <p className="text-slate-500 text-xs flex items-center gap-1 mt-1">
                      <MapPin size={10} />
                      {resource.location.city}, {resource.location.country}
                    </p>
                  )}
                  {room && (
                    <span className="badge-ocean text-xs mt-1.5 inline-flex">
                      {room.roomType} Room
                    </span>
                  )}
                </div>
              </div>

              {/* Date Summary */}
              {(checkIn || checkOut) && (
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {checkIn && (
                    <div className="bg-dark-bg rounded-xl p-3 text-center">
                      <p className="text-slate-500 text-xs">Check-in</p>
                      <p className="text-white text-sm font-semibold">
                        {formatDate(checkIn, 'dd MMM')}
                      </p>
                    </div>
                  )}
                  {checkOut && (
                    <div className="bg-dark-bg rounded-xl p-3 text-center">
                      <p className="text-slate-500 text-xs">Check-out</p>
                      <p className="text-white text-sm font-semibold">
                        {formatDate(checkOut, 'dd MMM')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-sm mb-5">
                <div className="flex justify-between text-slate-400">
                  <span>
                    {bookingType === 'hotel'
                      ? `${formatPrice(room?.pricePerNight || 0)} × ${nights} night${nights > 1 ? 's' : ''}`
                      : `Base price × ${guestCount.adults} guest${guestCount.adults > 1 ? 's' : ''}`
                    }
                  </span>
                  <span>{formatPrice(basePrice)}</span>
                </div>

                {selectedAddOns.map((a) => (
                  <div key={a.name} className="flex justify-between text-slate-400">
                    <span>{a.name}</span>
                    <span>+{formatPrice(a.price)}</span>
                  </div>
                ))}

                <div className="flex justify-between text-slate-400">
                  <span>Taxes & fees (12%)</span>
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

              {/* Trust Badges */}
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