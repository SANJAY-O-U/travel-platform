// client/src/pages/ResetPasswordPage.jsx
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '../utils/api';

export default function ResetPasswordPage() {
  const { token }   = useParams();
  const navigate    = useNavigate();

  const [form,      setForm]      = useState({ password: '', confirm: '' });
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setError('');
    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password: form.password });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset link is invalid or expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold">
              <span className="text-white">Bharat</span>
              <span className="text-ocean">Yatra</span>
            </span>
          </Link>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
          {!done ? (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-ocean/15 border border-ocean/20 flex items-center justify-center mx-auto mb-4">
                  <Lock size={24} className="text-ocean" />
                </div>
                <h1 className="text-2xl font-bold text-white">Set New Password</h1>
                <p className="text-slate-400 text-sm mt-2">Must be at least 8 characters</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="input-label">New Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      placeholder="••••••••"
                      className="input pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="input-label">Confirm New Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={form.confirm}
                      onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                      placeholder="••••••••"
                      className="input pl-10"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                >
                  {loading ? <><div className="spinner-sm" /> Resetting...</> : 'Reset Password →'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
              <p className="text-slate-400 text-sm mb-6">
                Your password has been updated successfully. Redirecting you to login...
              </p>
              <Link to="/login" className="btn-primary py-2.5 px-6 inline-flex">Sign In Now →</Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}