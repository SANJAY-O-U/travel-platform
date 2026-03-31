import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useDispatch } from 'react-redux'; // ADDED
import { fetchCurrentUser } from '../store/slices/authSlice'; // ADDED
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch(); // ADDED
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pw !== pw2) return toast.error('Passwords do not match');
    if (pw.length < 8) return toast.error('Password must be at least 8 characters');
    
    setLoading(true);
    try {
      const { data } = await api.put(`/auth/reset-password/${token}`, { newPassword: pw });
      
      // Store token
      localStorage.setItem('token', data.token);
      
      // ✅ Update Redux state immediately so the app knows we are logged in
      await dispatch(fetchCurrentUser()); 
      
      toast.success('Password reset! You are now logged in.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg pt-20">
      <div className="w-full max-w-md px-6">
        <div className="glass-card rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-2">Set new password</h1>
          <p className="text-slate-400 mb-6 text-sm">Must be at least 8 characters.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">New password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={show ? 'text' : 'password'}
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-10 pr-11"
                  required
                />
              </div>
            </div>
            <div>
              <label className="input-label">Confirm password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={show ? 'text' : 'password'}
                  value={pw2}
                  onChange={e => setPw2(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-10 pr-11"
                  required
                />
              </div>
            </div>
            <button type="button" onClick={() => setShow(!show)}
              className="text-xs text-ocean hover:underline">
              {show ? 'Hide' : 'Show'} passwords
            </button>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}