// client/src/pages/LoginPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  Mail, Lock, Eye, EyeOff, Globe,
  ArrowRight, AlertCircle,
} from 'lucide-react';
import {
  loginUser,
  clearError,
  selectAuthLoading,
  selectAuthError,
  selectIsAuthenticated,
  setUser,
} from '../store/slices/authSlice';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const dispatch        = useDispatch();
  const navigate        = useNavigate();
  const location        = useLocation();
  const loading         = useSelector(selectAuthLoading);
  const error           = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [form,          setForm]          = useState({ email: '', password: '' });
  const [showPwd,       setShowPwd]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated]);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  // ── Load Google Identity Services script ──────────────────
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    if (window.google) { initializeGoogle(clientId); return; }

    const script   = document.createElement('script');
    script.src     = 'https://accounts.google.com/gsi/client';
    script.async   = true;
    script.defer   = true;
    script.onload  = () => initializeGoogle(clientId);
    script.onerror = () => console.error('Failed to load Google Sign-In script');
    document.head.appendChild(script);

    return () => {
      if (window.google?.accounts?.id) window.google.accounts.id.cancel();
    };
  }, []);

  const initializeGoogle = (clientId) => {
    if (!window.google?.accounts?.id) return;
    window.google.accounts.id.initialize({
      client_id:             clientId,
      callback:              handleGoogleCredential,
      auto_select:           false,
      cancel_on_tap_outside: true,
    });
  };

  const handleGoogleCredential = async (response) => {
    if (!response.credential) {
      toast.error('Google sign-in failed. Please try again.');
      return;
    }
    setGoogleLoading(true);
    try {
      const { data } = await api.post('/auth/google/token', {
        idToken: response.credential,
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user',  JSON.stringify(data.user));
      dispatch(setUser(data.user));
      toast.success(`Welcome, ${data.user.name}! 🎉`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleClick = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.error('Google Sign-In is not configured. Please use email/password.');
      return;
    }
    if (!window.google?.accounts?.id) {
      toast.error('Google Sign-In is loading. Please try again in a moment.');
      return;
    }
    setGoogleLoading(true);
    window.google.accounts.id.prompt((notification) => {
      setGoogleLoading(false);
      if (notification.isNotDisplayed()) {
        window.location.href =
          (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/auth/google';
      }
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    const result = await dispatch(loginUser({
      email:    form.email.trim(),
      password: form.password,
    }));
    if (loginUser.fulfilled.match(result)) {
      navigate(from, { replace: true });
    }
  };

  const fillDemo = (email, password) => {
    setForm({ email, password });
    dispatch(clearError());
    toast.success('Credentials loaded!', { icon: '✓' });
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left: Form ──────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ocean to-blue-600 flex items-center justify-center">
              <Globe size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-white">Bharat</span>
              <span className="gradient-text">Yatra</span>
            </span>
          </Link>

          <h1 className="text-3xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-slate-400 mb-8">Sign in to continue your journey</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-3"
            >
              <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl
                       bg-white text-gray-700 font-medium text-sm border border-gray-200
                       hover:bg-gray-50 hover:shadow-md transition-all duration-200 mb-4
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-dark-border" />
            <span className="text-slate-600 text-xs">or continue with email</span>
            <div className="flex-1 h-px bg-dark-border" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="input-label">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  disabled={loading}
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="input-label mb-0">Password</label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-ocean hover:text-ocean/80 text-sm transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  className="input pl-10 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><div className="spinner w-5 h-5 border-2" /><span>Signing in...</span></>
              ) : (
                <><span>Sign In</span><ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-ocean font-medium hover:underline">
              Create one free
            </Link>
          </p>

          {/* ── Demo Credentials — Updated for new seeder ── */}
          <div className="mt-6 p-4 rounded-xl bg-dark-card border border-dark-border">
            <p className="text-slate-300 text-xs font-semibold mb-3">🔑 Demo Credentials — Click to autofill</p>
            <div className="space-y-2">
              {[
                {
                  role:     'User',
                  email:    'priya@example.com',      // ← updated from alice@example.com
                  password: 'Password@123',
                  color:    'text-ocean',
                },
                {
                  role:     'Admin',
                  email:    'admin@travelplatform.com',
                  password: 'Admin@123456',
                  color:    'text-sand',
                },
              ].map(({ role, email, password, color }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillDemo(email, password)}
                  disabled={loading}
                  className="w-full text-left px-3 py-2.5 rounded-xl bg-dark-bg border border-dark-border hover:border-ocean/40 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`text-xs font-bold ${color}`}>
                        {role === 'Admin' ? '⚡' : '👤'} {role}
                      </span>
                      <p className="text-slate-400 text-xs">{email}</p>
                      <p className="text-slate-600 text-xs">{password}</p>
                    </div>
                    <span className="text-slate-600 text-xs group-hover:text-ocean shrink-0">
                      Click to fill →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Right: Visual ─────────────────────────────────── */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-dark-bg/50 to-transparent" />
        <div className="absolute bottom-10 left-10 max-w-xs">
          <p className="text-white/40 text-sm mb-1">✦ Featured Property</p>
          <h3 className="text-white text-2xl font-bold mb-1">Taj Lake Palace Udaipur</h3>
          <p className="text-white/60 text-sm">Rajasthan · Starting from ₹35,000/night</p>
        </div>
      </div>
    </div>
  );
}