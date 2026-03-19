// client/src/pages/GoogleAuthSuccess.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

export default function GoogleAuthSuccess() {
  const navigate     = useNavigate();
  const dispatch     = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      toast.error('Authentication failed. Please try again.');
      navigate('/login');
      return;
    }

    try {
      // Decode JWT payload
      const payload = JSON.parse(
        atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
      );

      // Save token
      localStorage.setItem('token', token);

      // Fetch full user profile
      fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
            dispatch(setUser(data.user));
            toast.success(`Welcome, ${data.user.name}! 🎉`);
            navigate('/', { replace: true });
          } else {
            throw new Error('Failed to get user data');
          }
        })
        .catch(() => {
          toast.error('Authentication error. Please log in again.');
          navigate('/login');
        });
    } catch {
      toast.error('Authentication failed. Please try again.');
      navigate('/login');
    }
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="text-center">
        <div className="spinner mx-auto mb-4" />
        <p className="text-slate-400">Completing Google sign-in...</p>
      </div>
    </div>
  );
}