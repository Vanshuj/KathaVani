import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import StorytellerPage from './pages/StorytellerPage';
import ListenerPage from './pages/ListenerPage';
import VaultPage from './pages/VaultPage';
import SettingsPage from './pages/SettingsPage';
import StoryDetail from './pages/StoryDetail';
import AuthPage from './pages/AuthPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import CookiesPolicyPage from './pages/CookiesPolicyPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import { useAuth } from './context/AuthContext';

// Admin Console Components
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStories from './pages/admin/AdminStories';
import AdminManagement from './pages/admin/AdminManagement';
import AdminLogs from './pages/admin/AdminLogs';

import './index.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex-center" style={{ height: '100vh' }}><div className="skeleton" style={{ width: 200, height: 40 }} /></div>;
  return user ? children : <Navigate to="/auth" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* ─────────────────────────────────────────────────────────────
          1. SECURE DEDICATED ADMIN PORTAL ROUTES
      ────────────────────────────────────────────────────────────── */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="stories" element={<AdminStories />} />
        <Route path="admins" element={<AdminManagement />} />
        <Route path="logs" element={<AdminLogs />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>

      {/* ─────────────────────────────────────────────────────────────
          2. PUBLIC & COMMUNITY STORYTELLING PORTAL ROUTES
      ────────────────────────────────────────────────────────────── */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="auth" element={<AuthPage />} />
        <Route path="storyteller" element={<ProtectedRoute><StorytellerPage /></ProtectedRoute>} />
        <Route path="listener" element={<ListenerPage />} />
        <Route path="vault" element={<VaultPage />} />
        <Route path="stories/:id" element={<StoryDetail />} />
        <Route path="gamification" element={<Navigate to="/" replace />} />
        <Route path="settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="privacy" element={<PrivacyPolicyPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="cookies" element={<CookiesPolicyPage />} />
        <Route path="refund" element={<RefundPolicyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return (
    <BrowserRouter>
      <AppProvider>
        <AuthProvider>
          <AdminAuthProvider>
            <AppRoutes />
          </AdminAuthProvider>
        </AuthProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
