import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Auth
import { LoginPage }      from '../pages/LoginPage';
import { RegisterPage }   from '../pages/RegisterPage';

// B2B Client Portal
import { ClientRegister }  from '../pages/client/ClientRegister';
import { ClientDashboard } from '../pages/client/ClientDashboard';
import { PlaceOrder }      from '../pages/client/PlaceOrder';
import { FareReceipt }     from '../pages/client/FareReceipt';

// Driver / Rider Terminal
import { DriverConsent }   from '../pages/driver/DriverConsent';

// Admin dashboard (kept for admin role)
import { DashboardPage }   from '../pages/DashboardPage';

/* ─── Role-based root redirect ───────────────────────────────────────────── */
const ROLE_HOME = {
  Client: '/client/dashboard',
  Driver: '/driver/terminal',
  Admin:  '/dashboard',
};

const RoleRedirect = () => {
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[user?.role] || '/login'} replace />;
};

/* ─── Route guard — redirect unauthenticated users to /login ─────────────── */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={ROLE_HOME[user?.role] || '/login'} replace />;
  }
  return children;
};

/* ─── Route tree ─────────────────────────────────────────────────────────── */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* ── Public Auth ───────────────────────────────────────────────── */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ── B2B Client Portal ─────────────────────────────────────────── */}
      <Route path="/client/register"  element={<ClientRegister />} />
      <Route
        path="/client/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Client']}>
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/place-order"
        element={
          <ProtectedRoute allowedRoles={['Client']}>
            <PlaceOrder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/fare-receipt"
        element={
          <ProtectedRoute allowedRoles={['Client']}>
            <FareReceipt />
          </ProtectedRoute>
        }
      />

      {/* ── Rider / Driver Terminal ───────────────────────────────────── */}
      <Route
        path="/driver/terminal"
        element={
          <ProtectedRoute allowedRoles={['Driver']}>
            <DriverConsent />
          </ProtectedRoute>
        }
      />
      {/* Legacy alias kept so existing links still work */}
      <Route path="/driver/consent" element={<Navigate to="/driver/terminal" replace />} />

      {/* ── Admin Dashboard ───────────────────────────────────────────── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* ── Root redirect based on role ───────────────────────────────── */}
      <Route path="/"  element={<RoleRedirect />} />

      {/* ── Catch-all ─────────────────────────────────────────────────── */}
      <Route path="*"  element={<RoleRedirect />} />
    </Routes>
  );
};
