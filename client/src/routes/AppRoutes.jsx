import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { VehiclesPage } from '../pages/VehiclesPage';
import { DispatchesPage } from '../pages/DispatchesPage';
import { RoutesPage } from '../pages/RoutesPage';
import { AttendancePage } from '../pages/AttendancePage';
import { PayrollPage } from '../pages/PayrollPage';
import { ClientRegister } from '../pages/client/ClientRegister';
import { ClientDashboard } from '../pages/client/ClientDashboard';
import { DriverConsent } from '../pages/driver/DriverConsent';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected App Shell */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/dispatches" element={<DispatchesPage />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route
          path="/payroll"
          element={
            <ProtectedRoute allowedRoles={['Fleet_Manager', 'Accountant']}>
              <PayrollPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* B2B Client Portal — standalone full-page routes */}
      <Route path="/client/register" element={<ClientRegister />} />
      <Route path="/client/dashboard" element={<ClientDashboard />} />

      {/* Driver Opt-In Consent Terminal */}
      <Route path="/driver/consent" element={<DriverConsent />} />

      {/* Wildcard redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
