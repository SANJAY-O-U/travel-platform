// ============================================================
// Navbar — Glassmorphism Nav with Auth State
// ============================================================
import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  Plane, Hotel, Package, Menu, X, ChevronDown,
  User, Heart, BookOpen, LogOut, Settings,
  Bell, Search, Globe,
} from 'lucide-react';
import { logout, selectUser, selectIsAuthenticated, selectIsAdmin } from '../../store/slices/authSlice';

const NAV_LINKS = [
  { label: 'Hotels',   to: '/hotels',   icon: Hotel },
  { label: 'Flights',  to: '/flights',  icon: Plane },
  { label: 'Packages', to: '/packages', icon: Package },
];

export default function Navbar() {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const location    = useLocation();
  const user        = useSelector(selectUser);
  const isAuth      = useSelector(selectIsAuthenticated);
  const isAdmin     = useSelector(selectIsAdmin);

  const [scrolled,       setScrolled]       = useState(false);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [profileOpen,    setProfileOpen]    = useState(false);
  const profileRef = useRef(null);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setProfileOpen(false);
  };

  const isHome = location.pathname === '/';

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || !isHome
          ? 'bg-dark-bg/90 backdrop-blur-xl border-b border-dark-border shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <nav className="flex items-center justify-between h-16 lg:h-18">

          {/* ── Logo ──────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ocean to-blue-600 flex-center shadow-glow-sm group-hover:shadow-glow transition-all duration-300">
              <Globe size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-white">Travel</span>
              <span className="gradient-text">Platform</span>
            </span>
          </Link>

          {/* ── Desktop Nav Links ─────────────────────────── */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-ocean bg-ocean/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon size={15} />
                {label}
              </NavLink>
            ))}
          </div>

          {/* ── Right Section ─────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuth ? (
              <>
                {/* Wishlist */}
                <Link
                  to="/dashboard/wishlist"
                  className="p-2 rounded-lg text-slate-400 hover:text-coral hover:bg-coral/10 transition-all"
                  title="Wishlist"
                >
                  <Heart size={18} />
                </Link>

                {/* Admin link */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-ocean/15 text-ocean border border-ocean/25 hover:bg-ocean/25 transition-all"
                  >
                    Admin
                  </Link>
                )}

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-dark-card border border-dark-border hover:border-ocean/40 transition-all duration-200 group"
                  >
                    <img
                      src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=0ea5e9&color=fff&size=64`}
                      alt={user?.name}
                      className="w-7 h-7 rounded-lg object-cover"
                    />
                    <span className="text-sm font-medium text-slate-200 max-w-[100px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-dark-card border border-dark-border rounded-2xl shadow-xl overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-dark-border">
                          <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                        <div className="py-1">
                          {[
                            { label: 'My Bookings',  to: '/dashboard/bookings',  icon: BookOpen },
                            { label: 'Wishlist',     to: '/dashboard/wishlist',  icon: Heart },
                            { label: 'Profile',      to: '/dashboard/profile',   icon: User },
                            ...(isAdmin ? [{ label: 'Admin Panel', to: '/admin', icon: Settings }] : []),
                          ].map(({ label, to, icon: Icon }) => (
                            <Link
                              key={to}
                              to={to}
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <Icon size={15} className="text-slate-500" />
                              {label}
                            </Link>
                          ))}
                        </div>
                        <div className="border-t border-dark-border py-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut size={15} />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm py-2 px-4" >Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
              </div>
            )}
          </div>

          {/* ── Mobile Menu Button ────────────────────────── */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      </div>

      {/* ── Mobile Menu ───────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden bg-dark-bg/95 backdrop-blur-xl border-b border-dark-border"
          >
            <div className="container-custom py-4 space-y-1">
              {NAV_LINKS.map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive ? 'text-ocean bg-ocean/10' : 'text-slate-300'
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}

              <div className="pt-2 border-t border-dark-border mt-2">
                {isAuth ? (
                  <div className="space-y-1">
                    <div className="px-4 py-2 flex items-center gap-3">
                      <img
                        src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=0ea5e9&color=fff&size=64`}
                        alt={user?.name}
                        className="w-9 h-9 rounded-xl"
                      />
                      <div>
                        <p className="text-sm font-semibold text-white">{user?.name}</p>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                      </div>
                    </div>
                    <Link to="/dashboard/bookings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 rounded-xl hover:bg-white/5">
                      <BookOpen size={16} /> My Bookings
                    </Link>
                    <Link to="/dashboard/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 rounded-xl hover:bg-white/5">
                      <User size={16} /> Profile
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-ocean rounded-xl hover:bg-ocean/10">
                        <Settings size={16} /> Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 rounded-xl hover:bg-red-500/10"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 px-1">
                    <Link to="/login" className="btn-secondary text-center text-sm">Sign In</Link>
                    <Link to="/register" className="btn-primary text-center text-sm">Get Started</Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}