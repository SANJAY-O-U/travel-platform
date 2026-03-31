import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchCurrentUser } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      localStorage.setItem('token', token);
      // Sync the Redux state with the new token
      dispatch(fetchCurrentUser());
      toast.success('Welcome back!');
      navigate('/'); 
    } else {
      toast.error('Google authentication failed');
      navigate('/login');
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-bg">
      <div className="w-12 h-12 border-4 border-ocean border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400">Completing login...</p>
    </div>
  );
}