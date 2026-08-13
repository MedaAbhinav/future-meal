import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Lazy-loaded pages
const LandingPage          = lazy(() => import('./pages/LandingPage'));
const LoginPage            = lazy(() => import('./pages/LoginPage'));
const RegisterPage         = lazy(() => import('./pages/RegisterPage'));
const RestaurantsPage      = lazy(() => import('./pages/RestaurantsPage'));
const RestaurantDetailPage = lazy(() => import('./pages/RestaurantDetailPage'));
const FutureMealPage       = lazy(() => import('./pages/FutureMealPage'));
const NewFutureMealPage    = lazy(() => import('./pages/NewFutureMealPage'));
const OrdersPage           = lazy(() => import('./pages/OrdersPage'));
const OrderTrackingPage    = lazy(() => import('./pages/OrderTrackingPage'));
const CheckoutPage         = lazy(() => import('./pages/CheckoutPage'));
const ProfilePage          = lazy(() => import('./pages/ProfilePage'));
const AdminDashboard       = lazy(() => import('./pages/admin/AdminDashboard'));
const RestaurantDashboard  = lazy(() => import('./pages/restaurant/RestaurantDashboard'));
const DeliveryDashboard    = lazy(() => import('./pages/delivery/DeliveryDashboard'));
const NotFoundPage         = lazy(() => import('./pages/NotFoundPage'));

function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#0e0c0a' }}>
      <div className="relative">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
          <circle
            cx="24" cy="24" r="20"
            stroke="#e8892a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="126"
            strokeDashoffset="94"
            className="animate-spin-slow"
          />
        </svg>
      </div>
      <p className="mt-4 text-label" style={{ color: '#4f4840', letterSpacing: '0.15em', fontSize: '0.65rem' }}>
        LOADING
      </p>
    </div>
  );
}

const NO_FOOTER_ROUTES = ['/login', '/register', '/checkout'];

function AppLayout() {
  const location = useLocation();
  const showFooter = !NO_FOOTER_ROUTES.some(r => location.pathname.startsWith(r));
  // Also hide footer for dashboards
  const isDashboard = location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/restaurant-dashboard') ||
    location.pathname.startsWith('/delivery');

  return (
    <>
      <Navbar />
      <CartDrawer />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/"                  element={<LandingPage />} />
          <Route path="/login"             element={<LoginPage />} />
          <Route path="/register"          element={<RegisterPage />} />
          <Route path="/restaurants"       element={<RestaurantsPage />} />
          <Route path="/restaurants/:id"   element={<RestaurantDetailPage />} />
          <Route path="/search"            element={<RestaurantsPage />} />

          {/* Customer */}
          <Route path="/future-meals"      element={<ProtectedRoute allowedRoles={['CUSTOMER','ADMIN']}><FutureMealPage /></ProtectedRoute>} />
          <Route path="/future-meals/new"  element={<ProtectedRoute allowedRoles={['CUSTOMER','ADMIN']}><NewFutureMealPage /></ProtectedRoute>} />
          <Route path="/future-meals/:id"  element={<ProtectedRoute><FutureMealPage /></ProtectedRoute>} />
          <Route path="/orders"            element={<ProtectedRoute allowedRoles={['CUSTOMER','ADMIN']}><OrdersPage /></ProtectedRoute>} />
          <Route path="/orders/:id"        element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
          <Route path="/checkout"          element={<ProtectedRoute allowedRoles={['CUSTOMER','ADMIN']}><CheckoutPage /></ProtectedRoute>} />
          <Route path="/profile"           element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/favorites"         element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Restaurant owner */}
          <Route path="/restaurant-dashboard"    element={<ProtectedRoute allowedRoles={['RESTAURANT_OWNER','ADMIN']}><RestaurantDashboard /></ProtectedRoute>} />
          <Route path="/restaurant-dashboard/*"  element={<ProtectedRoute allowedRoles={['RESTAURANT_OWNER','ADMIN']}><RestaurantDashboard /></ProtectedRoute>} />

          {/* Delivery */}
          <Route path="/delivery"  element={<ProtectedRoute allowedRoles={['DELIVERY_PARTNER','ADMIN']}><DeliveryDashboard /></ProtectedRoute>} />
          <Route path="/delivery/*" element={<ProtectedRoute allowedRoles={['DELIVERY_PARTNER','ADMIN']}><DeliveryDashboard /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin"    element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/*"  element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      {showFooter && !isDashboard && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '10px',
            background: '#1c1814',
            color: '#f3ede0',
            fontSize: '14px',
            fontWeight: '500',
            border: '1px solid rgba(255,255,255,0.08)',
            fontFamily: '"DM Sans",sans-serif',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
          },
          success: { iconTheme: { primary: '#4db87a', secondary: '#1c1814' } },
          error:   { iconTheme: { primary: '#e07070', secondary: '#1c1814' } },
        }}
      />
      <AppLayout />
    </>
  );
}
