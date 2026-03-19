// client/src/pages/LoginPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion }   from 'framer-motion';
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
} from '../store/slices/authSlice';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();

  const loading         = useSelector(selectAuthLoading);
  const error           = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);

  const from = location.state?.from?.pathname || '/';

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
  };

  // ✅ Fixed: proper async submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (!form.password) {
      toast.error('Please enter your password');
      return;
    }

    try {
      const result = await dispatch(
        loginUser({ email: form.email.trim(), password: form.password })
      );

      if (loginUser.fulfilled.match(result)) {
        // Success — useEffect will redirect
        navigate(from, { replace: true });
      }
      // If rejected, error is shown via toast in slice
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Something went wrong. Please try again.');
    }
  };

  // Fill demo credentials
  const fillDemo = (email, password) => {
    setForm({ email, password });
    dispatch(clearError());
    toast.success('Credentials loaded — click Sign In!', { icon: '✓' });
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left: Form ──────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ocean to-blue-600 flex items-center justify-center">
              <Globe size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-white">Travel</span>
              <span className="gradient-text">Platform</span>
            </span>
          </Link>

          <h1 className="text-3xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-slate-400 mb-8">Sign in to continue your journey</p>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-3"
            >
              <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-400 text-sm font-medium">{error}</p>
                {error.toLowerCase().includes('google') && (
                  <p className="text-red-400/70 text-xs mt-1">
                    This email was registered with Google. Use Google Sign In below.
                  </p>
                )}
                {(error.toLowerCase().includes('no account') || error.toLowerCase().includes('not found')) && (
                  <Link to="/register" className="text-ocean text-xs mt-1 hover:underline block">
                    → Create an account instead
                  </Link>
                )}
                {error.toLowerCase().includes('password') && (
                  <button
                    type="button"
                    className="text-ocean text-xs mt-1 hover:underline block"
                    onClick={() => toast('Password reset coming soon!')}
                  >
                    → Forgot your password?
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="input-label">
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="input pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="input-label mb-0">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-ocean hover:text-ocean/80 transition-colors"
                  onClick={() => toast('Password reset coming soon!')}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
                <input
                  id="password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="input pl-10 pr-11"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="spinner w-5 h-5 border-2" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <p className="mt-6 text-center text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="text-ocean hover:text-ocean/80 font-medium transition-colors"
            >
              Create one free
            </Link>
          </p>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 rounded-xl bg-dark-card border border-dark-border">
            <p className="text-slate-300 text-xs font-semibold mb-3 flex items-center gap-1.5">
              🔑 Demo Credentials — Click to autofill
            </p>
            <div className="space-y-2">
              {[
                {
                  role:     'User',
                  email:    'alice@example.com',
                  password: 'Password@123',
                  color:    'ocean',
                },
                {
                  role:     'Admin',
                  email:    'admin@travelplatform.com',
                  password: 'Admin@123456',
                  color:    'sand',
                },
              ].map(({ role, email, password, color }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillDemo(email, password)}
                  disabled={loading}
                  className="w-full text-left px-3 py-2.5 rounded-xl bg-dark-bg border border-dark-border
                             hover:border-ocean/40 transition-all group disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`text-xs font-bold ${color === 'sand' ? 'text-sand' : 'text-ocean'}`}>
                        {role === 'Admin' ? '⚡' : '👤'} {role}
                      </span>
                      <p className="text-slate-400 text-xs mt-0.5">{email}</p>
                      <p className="text-slate-600 text-xs">{password}</p>
                    </div>
                    <span className="text-slate-600 text-xs group-hover:text-ocean transition-colors shrink-0">
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
          src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80"
          alt="Login visual"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-dark-bg/50 to-transparent" />
        <div className="absolute bottom-10 left-10 max-w-xs">
          <p className="text-white/40 text-sm mb-1">✦ Featured Property</p>
          <h3 className="text-white text-2xl font-bold mb-1">The Grand Azure Resort</h3>
          <p className="text-white/60 text-sm">Maldives · Starting from $450/night</p>
        </div>
      </div>
    </div>
  );
}