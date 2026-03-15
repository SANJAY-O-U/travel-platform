// ============================================================
// RegisterPage
// ============================================================
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, Eye, EyeOff, User, Phone, Globe, ArrowRight, Check } from 'lucide-react';
import { registerUser, selectAuth } from '../store/slices/authSlice';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(selectAuth);

  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [agree, setAgree] = useState(false);

  const passwordStrength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthColors = ['', 'bg-red-500', 'bg-sand', 'bg-ocean', 'bg-emerald-500'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agree) return;
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) navigate('/');
  };

  const BENEFITS = ['Free cancellation on most bookings', 'Access to exclusive member deals', 'AI-powered travel recommendations', '24/7 customer support'];

  return (
    <div className="min-h-screen flex">
      {/* Left: Visual */}
      <div className="hidden lg:flex flex-col flex-1 relative bg-gradient-to-br from-dark-bg via-blue-950 to-dark-bg p-12">
        <Link to="/" className="flex items-center gap-2.5 mb-auto">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ocean to-blue-600 flex-center">
            <Globe size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">TravelPlatform</span>
        </Link>

        <div>
          <h2 className="text-4xl font-bold text-white mb-4">Join 2 million <br /><span className="gradient-text">happy travelers</span></h2>
          <p className="text-slate-400 mb-8">Start your journey with exclusive access to the world's finest destinations.</p>
          <div className="space-y-3">
            {BENEFITS.map(b => (
              <div key={b} className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="w-5 h-5 rounded-full bg-ocean/20 border border-ocean/40 flex-center shrink-0">
                  <Check size={11} className="text-ocean" />
                </div>
                {b}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-8">
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80"
            alt=""
            className="w-full h-48 object-cover rounded-2xl opacity-40"
          />
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ocean to-blue-600 flex-center">
              <Globe size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-white">Travel</span>
              <span className="gradient-text">Platform</span>
            </span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-slate-400 mb-8">Start exploring the world today — it's free</p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Full name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" required className="input pl-10" />
              </div>
            </div>

            <div>
              <label className="input-label">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required className="input pl-10" />
              </div>
            </div>

            <div>
              <label className="input-label">Phone (optional)</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 8900" className="input pl-10" />
              </div>
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 8 characters" required minLength={8} className="input pl-10 pr-10" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength ? strengthColors[passwordStrength] : 'bg-dark-border'}`} />
                    ))}
                  </div>
                  <p className={`text-xs ${passwordStrength >= 3 ? 'text-emerald-400' : passwordStrength >= 2 ? 'text-ocean' : 'text-slate-500'}`}>
                    {strengthLabels[passwordStrength]} password
                  </p>
                </div>
              )}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-dark-border text-ocean" />
              <span className="text-sm text-slate-400">
                I agree to the{' '}
                <a href="#" className="text-ocean hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-ocean hover:underline">Privacy Policy</a>
              </span>
            </label>

            <button type="submit" disabled={loading || !agree} className="w-full btn-primary py-3 text-base flex-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? <div className="spinner w-5 h-5 border-2" /> : <>Create Account <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-ocean hover:text-ocean/80 font-medium transition-colors">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}