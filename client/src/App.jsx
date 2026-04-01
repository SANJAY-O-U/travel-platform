// client/src/App.jsx
import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster }        from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser, selectIsAuthenticated, selectIsAdmin } from './store/slices/authSlice';

import Navbar      from './components/common/Navbar';
import Footer      from './components/common/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import AboutPage from './pages/AboutPage';
const HomePage           = lazy(() => import('./pages/HomePage'));
const HotelsPage         = lazy(() => import('./pages/HotelsPage'));
const HotelDetailPage    = lazy(() => import('./pages/HotelDetailPage'));
const FlightsPage        = lazy(() => import('./pages/FlightsPage'));
const PackagesPage       = lazy(() => import('./pages/PackagesPage'));
const PackageDetailPage  = lazy(() => import('./pages/PackageDetailPage'));
const BookingPage        = lazy(() => import('./pages/BookingPage'));
const BookingConfirmPage = lazy(() => import('./pages/BookingConfirmPage'));
const DashboardPage      = lazy(() => import('./pages/DashboardPage'));
const AdminDashboard     = lazy(() => import('./pages/AdminDashboard'));
const LoginPage          = lazy(() => import('./pages/LoginPage'));
const RegisterPage       = lazy(() => import('./pages/RegisterPage'));
const ContactPage        = lazy(() => import('./pages/ContactPage'));
const NotFoundPage       = lazy(() => import('./pages/NotFoundPage'));
const GoogleAuthSuccess  = lazy(() => import('./pages/GoogleAuthSuccess'));
const AuthCallbackPage   = lazy(() => import('./pages/AuthCallbackPage'));
const CareersPage          = lazy(() => import('./pages/CareersPage'));
const PressPage            = lazy(() => import('./pages/PressPage'));
const HelpCenterPage       = lazy(() => import('./pages/HelpCenterPage'));
const CancellationPolicyPage = lazy(() => import('./pages/CancellationPolicyPage'));
const PrivacyPolicyPage    = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage   = lazy(() => import('./pages/TermsOfServicePage'));
const ForgotPasswordPage   = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage    = lazy(() => import('./pages/ResetPasswordPage'));
// ── Route Guards ──────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin         = useSelector(selectIsAdmin);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin)         return <Navigate to="/"     replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

// ── Layouts ───────────────────────────────────────────────────
const Layout = ({ children, noFooter = false }) => (
  <div className="min-h-screen flex flex-col bg-dark-bg">
    <Navbar />
    <main className="flex-1 pt-0">{children}</main>
    {!noFooter && <Footer />}
  </div>
);

const AdminLayout = ({ children }) => (
  <div className="min-h-screen bg-dark-bg">{children}</div>
);

// ── Loading Fallback ──────────────────────────────────────────
const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-dark-bg">
    <div className="flex flex-col items-center gap-4">
      <div className="spinner" />
      <p className="text-slate-400 text-sm">Loading...</p>
    </div>
  </div>
);

// ── App ───────────────────────────────────────────────────────
export default function App() {
  const dispatch = useDispatch();
  const token    = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <ScrollToTop />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background:   '#1e293b',
            color:        '#e2e8f0',
            border:       '1px solid #334155',
            borderRadius: '12px',
            fontSize:     '14px',
          },
          success: { iconTheme: { primary: '#0ea5e9', secondary: '#1e293b' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
        }}
      />

      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* ── Public ───────────────────────────────── */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/hotels" element={<Layout><HotelsPage /></Layout>} />
          <Route path="/hotels/:id" element={<Layout><HotelDetailPage /></Layout>} />
          <Route path="/flights" element={<Layout><FlightsPage /></Layout>} />
          <Route path="/packages" element={<Layout><PackagesPage /></Layout>} />
          <Route path="/packages/:id" element={<Layout><PackageDetailPage /></Layout>} />
          <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
          <Route path="/about"                element={<Layout><AboutPage /></Layout>} />
          <Route path="/careers"             element={<Layout><CareersPage /></Layout>} />
<Route path="/press"               element={<Layout><PressPage /></Layout>} />
<Route path="/help"                element={<Layout><HelpCenterPage /></Layout>} />
<Route path="/cancellation-policy" element={<Layout><CancellationPolicyPage /></Layout>} />
<Route path="/privacy"             element={<Layout><PrivacyPolicyPage /></Layout>} />
<Route path="/terms"               element={<Layout><TermsOfServicePage /></Layout>} />

          // ── Auth ───────────────────────────────────
<Route
  path="/login"
  element={
    <GuestRoute>
      <Layout noFooter>
        <LoginPage />
      </Layout>
    </GuestRoute>
  }
/>
<Route
  path="/register"
  element={
    <GuestRoute>
      <Layout noFooter>
        <RegisterPage />
      </Layout>
    </GuestRoute>
  }
/>
<Route path="/forgot-password"      element={<Layout noFooter><ForgotPasswordPage /></Layout>} />
<Route path="/reset-password/:token" element={<Layout noFooter><ResetPasswordPage /></Layout>} />
<Route path="/auth/callback"        element={<AuthCallbackPage />} />
<Route path="/auth/google/success" element={<GoogleAuthSuccess />} />

          {/* ── Protected ────────────────────────────── */}
          <Route
            path="/booking/:type/:id"
            element={
              <ProtectedRoute>
                <Layout><BookingPage /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/confirm/:bookingId"
            element={
              <ProtectedRoute>
                <Layout><BookingConfirmPage /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Layout><DashboardPage /></Layout>
              </ProtectedRoute>
            }
          />

          {/* ── Admin ────────────────────────────────── */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminLayout><AdminDashboard /></AdminLayout>
              </AdminRoute>
            }
          />

          {/* ── 404 ──────────────────────────────────── */}
          <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}