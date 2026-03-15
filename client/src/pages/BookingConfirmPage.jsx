import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  CheckCircle, Download, Share2, Calendar, MapPin,
  User, Mail, Phone, ArrowRight, Home,
} from 'lucide-react';
import { fetchBookingDetail } from '../store/slices/bookingSlice';
import { formatPrice, formatDate, getBookingStatusColor } from '../utils/helpers';

export default function BookingConfirmPage() {
  const { bookingId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentBooking: booking, loading } = useSelector(s => s.bookings);

  useEffect(() => {
    if (bookingId) dispatch(fetchBookingDetail(bookingId));
  }, [bookingId, dispatch]);

  if (loading || !booking) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="spinner" />
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-16 bg-dark-bg">
      <div className="container-custom py-12 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
          <p className="text-slate-400">Your reservation has been successfully processed</p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm font-medium">
            Booking Ref: <span className="font-bold">{booking.bookingRef}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden mb-6"
        >
          {/* Property header */}
          <div className="flex gap-4 p-6 border-b border-dark-border">
            <img
              src={booking.hotel?.coverImage?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'}
              alt=""
              className="w-24 h-24 rounded-xl object-cover shrink-0"
            />
            <div>
              <p className="text-slate-500 text-xs mb-1 capitalize">{booking.bookingType} booking</p>
              <h2 className="text-xl font-bold text-white">
                {booking.hotel?.name || booking.flight?.flightNumber || booking.package?.title}
              </h2>
              {booking.hotel?.location && (
                <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                  <MapPin size={12} />{booking.hotel.location.city}, {booking.hotel.location.country}
                </p>
              )}
              {booking.room && (
                <span className="badge-ocean text-xs mt-2 inline-flex">{booking.room.roomType} Room</span>
              )}
            </div>
          </div>

          {/* Booking details */}
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {booking.checkIn && (
                <div className="bg-dark-bg rounded-xl p-3 text-center">
                  <Calendar size={16} className="text-ocean mx-auto mb-1" />
                  <p className="text-slate-500 text-xs">Check-in</p>
                  <p className="text-white font-semibold text-sm">{formatDate(booking.checkIn, 'dd MMM yyyy')}</p>
                </div>
              )}
              {booking.checkOut && (
                <div className="bg-dark-bg rounded-xl p-3 text-center">
                  <Calendar size={16} className="text-ocean mx-auto mb-1" />
                  <p className="text-slate-500 text-xs">Check-out</p>
                  <p className="text-white font-semibold text-sm">{formatDate(booking.checkOut, 'dd MMM yyyy')}</p>
                </div>
              )}
              {booking.nights && (
                <div className="bg-dark-bg rounded-xl p-3 text-center">
                  <p className="text-slate-500 text-xs">Duration</p>
                  <p className="text-white font-semibold text-sm">{booking.nights} nights</p>
                </div>
              )}
              <div className="bg-dark-bg rounded-xl p-3 text-center">
                <p className="text-slate-500 text-xs">Guests</p>
                <p className="text-white font-semibold text-sm">
                  {booking.guests?.adults} adult{booking.guests?.adults > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Guest info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              {[
                { icon: User,  label: 'Guest Name', val: booking.primaryGuest?.name },
                { icon: Mail,  label: 'Email',      val: booking.primaryGuest?.email },
                { icon: Phone, label: 'Phone',      val: booking.primaryGuest?.phone },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="flex items-center gap-3 p-3 bg-dark-bg rounded-xl">
                  <Icon size={15} className="text-ocean shrink-0" />
                  <div>
                    <p className="text-slate-500 text-xs">{label}</p>
                    <p className="text-white text-sm font-medium">{val}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price summary */}
            <div className="bg-dark-bg rounded-xl p-4">
              <h3 className="text-white font-semibold mb-3 text-sm">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Base price</span><span>{formatPrice(booking.pricing?.basePrice)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Taxes</span><span>{formatPrice(booking.pricing?.taxes)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Service fee</span><span>{formatPrice(booking.pricing?.fees)}</span>
                </div>
                <div className="flex justify-between text-white font-bold pt-2 border-t border-dark-border text-base">
                  <span>Total Paid</span>
                  <span className="text-emerald-400">{formatPrice(booking.pricing?.totalAmount)}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="badge-success text-xs">✓ Payment Confirmed</span>
                <span className="text-slate-500 text-xs">· {formatDate(booking.createdAt, 'dd MMM yyyy HH:mm')}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Special requests */}
        {booking.specialRequests && (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-5 mb-6">
            <h3 className="text-white font-semibold mb-2 text-sm">Special Requests</h3>
            <p className="text-slate-400 text-sm">{booking.specialRequests}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/dashboard/bookings" className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
            <ArrowRight size={16} /> View My Bookings
          </Link>
          <Link to="/" className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3">
            <Home size={16} /> Back to Home
          </Link>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          A confirmation email has been sent to {booking.primaryGuest?.email}
        </p>
      </div>
    </div>
  );
}