import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { SocietiesPage } from './pages/SocietiesPage';
import { SocietyProfilePage } from './pages/SocietyProfilePage';
import { ResidentsPage } from './pages/ResidentsPage';
import { RedevelopmentPage } from './pages/RedevelopmentPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { NoticesPage } from './pages/NoticesPage';
import { MeetingsPage } from './pages/MeetingsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { RentVacatingPage } from './pages/RentVacatingPage';
import { BuildersPage } from './pages/BuildersPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';

// Protected Route Wrapper with Role-Based Authorization
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route (redirects authenticated users to dashboard)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Authenticated Dashboard & Feature Routes */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Super Admin Only */}
            <Route
              path="/societies"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SocietiesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/builders"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'secretary']}>
                  <BuildersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Society Management (Secretary & Committee) */}
            <Route
              path="/society-profile"
              element={
                <ProtectedRoute allowedRoles={['secretary', 'committee_member', 'super_admin']}>
                  <SocietyProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/residents"
              element={
                <ProtectedRoute allowedRoles={['secretary', 'committee_member', 'super_admin']}>
                  <ResidentsPage />
                </ProtectedRoute>
              }
            />

            {/* Common Modules for Roles */}
            <Route path="/redevelopment" element={<RedevelopmentPage />} />
            <Route path="/complaints" element={<ComplaintsPage />} />
            <Route path="/notices" element={<NoticesPage />} />
            <Route path="/meetings" element={<MeetingsPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/rent-vacating" element={<RentVacatingPage />} />
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'secretary', 'committee_member']}>
                  <AuditLogsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Fallbacks */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
