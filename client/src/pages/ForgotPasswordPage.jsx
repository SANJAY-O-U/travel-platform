// client/src/pages/ForgotPasswordPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import api from '../utils/api';

export default function ForgotPasswordPage() {
  const [email,     setEmail]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [sent,      setSent]      = useState(false);
  const [error,     setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email address'); return; }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
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
        {/* Logo */}
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
          {!sent ? (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-ocean/15 border border-ocean/20 flex items-center justify-center mx-auto mb-4">
                  <Mail size={24} className="text-ocean" />
                </div>
                <h1 className="text-2xl font-bold text-white">Forgot Password?</h1>
                <p className="text-slate-400 text-sm mt-2">
                  No worries! Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="input-label">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input pl-10"
                      autoFocus
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
                  {loading ? (
                    <><div className="spinner-sm" /> Sending...</>
                  ) : (
                    <><Send size={16} /> Send Reset Link</>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
                >
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
              <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
              <p className="text-slate-400 text-sm mb-1">
                We sent a password reset link to
              </p>
              <p className="text-white font-semibold mb-6">{email}</p>
              <p className="text-slate-500 text-xs mb-6">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setSent(false)}
                  className="text-ocean hover:underline"
                >
                  try again
                </button>
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
              >
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}