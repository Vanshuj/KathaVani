import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import StorytellerPage from './pages/StorytellerPage';
import ListenerPage from './pages/ListenerPage';
import VaultPage from './pages/VaultPage';
import GamificationPage from './pages/GamificationPage';
import SettingsPage from './pages/SettingsPage';
import StoryDetail from './pages/StoryDetail';
import AuthPage from './pages/AuthPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import CookiesPolicyPage from './pages/CookiesPolicyPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import { useAuth } from './context/AuthContext';
import './index.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex-center" style={{ height: '100vh' }}><div className="skeleton" style={{ width: 200, height: 40 }} /></div>;
  return user ? children : <Navigate to="/auth" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="auth" element={<AuthPage />} />
        <Route path="storyteller" element={<ProtectedRoute><StorytellerPage /></ProtectedRoute>} />
        <Route path="listener" element={<ListenerPage />} />
        <Route path="vault" element={<VaultPage />} />
        <Route path="stories/:id" element={<StoryDetail />} />
        <Route path="gamification" element={<ProtectedRoute><GamificationPage /></ProtectedRoute>} />
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
          <AppRoutes />
        </AuthProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
