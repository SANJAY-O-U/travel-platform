// ============================================================
// App.jsx — Root Component with Router & Auth Guard
// ============================================================
import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence } from 'framer-motion';

import { fetchCurrentUser } from './store/slices/authSlice';
import { selectIsAuthenticated, selectIsAdmin } from './store/slices/authSlice';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import PageLoader from './components/common/PageLoader';
import ScrollToTop from './components/common/ScrollToTop';

// ─── Lazy-loaded Pages ────────────────────────────────────────
const HomePage        = lazy(() => import('./pages/HomePage'));
const HotelsPage      = lazy(() => import('./pages/HotelsPage'));
const HotelDetailPage = lazy(() => import('./pages/HotelDetailPage'));
const FlightsPage     = lazy(() => import('./pages/FlightsPage'));
const PackagesPage    = lazy(() => import('./pages/PackagesPage'));
const PackageDetailPage = lazy(() => import('./pages/PackageDetailPage'));
const BookingPage     = lazy(() => import('./pages/BookingPage'));
const BookingConfirmPage = lazy(() => import('./pages/BookingConfirmPage'));
const DashboardPage   = lazy(() => import('./pages/DashboardPage'));
const AdminDashboard  = lazy(() => import('./pages/AdminDashboard'));
const LoginPage       = lazy(() => import('./pages/LoginPage'));
const RegisterPage    = lazy(() => import('./pages/RegisterPage'));
const ContactPage     = lazy(() => import('./pages/ContactPage'));
const NotFoundPage    = lazy(() => import('./pages/NotFoundPage'));

// ─── Route Guards ─────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

// ─── Layout Wrapper ───────────────────────────────────────────
const Layout = ({ children, noFooter = false }) => (
  <div className="min-h-screen flex flex-col bg-dark-bg">
    <Navbar />
    <main className="flex-1">{children}</main>
    {!noFooter && <Footer />}
  </div>
);

const AdminLayout = ({ children }) => (
  <div className="min-h-screen bg-dark-bg">
    {children}
  </div>
);

// ─── Suspense Fallback ────────────────────────────────────────
const SuspenseFallback = () => (
  <div className="min-h-screen flex-center bg-dark-bg">
    <div className="flex flex-col items-center gap-4">
      <div className="spinner" />
      <p className="text-slate-400 text-sm">Loading...</p>
    </div>
  </div>
);

// ─── Main App ─────────────────────────────────────────────────
export default function App() {
  const dispatch = useDispatch();
  const token = localStorage.getItem('token');

  // Rehydrate user on app load
  useEffect(() => {
    if (token) dispatch(fetchCurrentUser());
  }, [dispatch, token]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#e2e8f0',
            border: '1px solid #334155',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#0ea5e9', secondary: '#1e293b' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#1e293b' },
          },
        }}
      />

      <Suspense fallback={<SuspenseFallback />}>
        <AnimatePresence mode="wait">
          <Routes>
            {/* ── Public Routes ─────────────────────────── */}
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/hotels" element={<Layout><HotelsPage /></Layout>} />
            <Route path="/hotels/:id" element={<Layout><HotelDetailPage /></Layout>} />
            <Route path="/flights" element={<Layout><FlightsPage /></Layout>} />
            <Route path="/packages" element={<Layout><PackagesPage /></Layout>} />
            <Route path="/packages/:id" element={<Layout><PackageDetailPage /></Layout>} />
            <Route path="/contact" element={<Layout><ContactPage /></Layout>} />

            {/* ── Auth Routes ───────────────────────────── */}
            <Route path="/login" element={
              <GuestRoute><Layout noFooter><LoginPage /></Layout></GuestRoute>
            } />
            <Route path="/register" element={
              <GuestRoute><Layout noFooter><RegisterPage /></Layout></GuestRoute>
            } />

            {/* ── Protected Routes ──────────────────────── */}
            <Route path="/booking/:type/:id" element={
              <ProtectedRoute><Layout><BookingPage /></Layout></ProtectedRoute>
            } />
            <Route path="/booking/confirm/:bookingId" element={
              <ProtectedRoute><Layout><BookingConfirmPage /></Layout></ProtectedRoute>
            } />
            <Route path="/dashboard/*" element={
              <ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>
            } />

            {/* ── Admin Routes ──────────────────────────── */}
            <Route path="/admin/*" element={
              <AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>
            } />

            {/* ── 404 ───────────────────────────────────── */}
            <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </BrowserRouter>
  );
}