import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faSignInAlt, faUserPlus, faShieldAlt, faCheckSquare } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import logo from '../assets/logo.png';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { showNotification } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && !consent) {
      setError('You must consent to the Terms and Privacy Policy to create an account under India DPDP Act 2023.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      showNotification(mode === 'login' ? 'Welcome back to KathaVani!' : 'Account created successfully! Welcome to KathaVani!', 'success');
      navigate('/');
    } catch (err) {
      setError(err.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center fade-in" style={{ minHeight: '60vh', padding: '1rem 0' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <img
              src={logo}
              alt="KathaVani cultural storytelling seal"
              style={{
                width: 80,
                height: 80,
                objectFit: 'contain',
                filter: 'drop-shadow(0 6px 18px rgba(180,95,43,0.25))'
              }}
            />
          </div>
          <h1 style={{ color: 'var(--terracotta)', marginBottom: '0.3rem', fontSize: '1.8rem' }}>
            {mode === 'login' ? 'Welcome Back' : 'Join KathaVani'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {mode === 'login' ? 'Access your community stories and bookmarks' : 'Help preserve India\'s living cultural heritage'}
          </p>
        </div>

        <div className="card">
          {/* Mode toggle */}
          <div className="tab-nav" style={{ marginBottom: '1.5rem' }}>
            <button
              type="button"
              className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setError(''); }}
              aria-label="Switch to sign in tab"
            >
              <FontAwesomeIcon icon={faSignInAlt} /> <span>Sign In</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { setMode('register'); setError(''); }}
              aria-label="Switch to registration tab"
            >
              <FontAwesomeIcon icon={faUserPlus} /> <span>Create Account</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {mode === 'register' && (
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="auth-name">
                  <FontAwesomeIcon icon={faUser} style={{ marginRight: 6 }} />Full Name
                </label>
                <input
                  id="auth-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="auth-email">
                <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: 6 }} />Email Address
              </label>
              <input
                id="auth-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@domain.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="auth-password">
                <FontAwesomeIcon icon={faLock} style={{ marginRight: 6 }} />Password
              </label>
              <input
                id="auth-password"
                name="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="At least 6 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={6}
              />
            </div>

            {/* DPDP Act Form Consent Notice for Registration */}
            {mode === 'register' && (
              <div style={{ marginBottom: '1.25rem', padding: '0.85rem', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <label htmlFor="auth-consent" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer', margin: 0, fontWeight: 400, fontSize: '0.84rem', lineHeight: 1.5 }}>
                  <input
                    id="auth-consent"
                    type="checkbox"
                    checked={consent}
                    onChange={e => setConsent(e.target.checked)}
                    style={{ width: 'auto', marginTop: 3, cursor: 'pointer' }}
                    required
                  />
                  <span>
                    I consent to KathaVani processing my name and email strictly for account authentication and archival submissions as detailed in the{' '}
                    <Link to="/privacy" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', fontWeight: 600 }}>Privacy Policy (DPDP Act 2023)</Link> and{' '}
                    <Link to="/terms" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', fontWeight: 600 }}>Terms of Service</Link>.
                  </span>
                </label>
              </div>
            )}

            {/* Data Minimization Notice */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <FontAwesomeIcon icon={faShieldAlt} style={{ color: 'var(--jade)' }} />
              <span>Data Minimization: We never sell your personal data or track you across sites.</span>
            </div>

            {error && (
              <div role="alert" style={{ background: 'rgba(192,57,43,0.1)', border: '1px solid var(--vermillion)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', marginBottom: '1rem', color: 'var(--vermillion)', fontSize: '0.88rem' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={loading}
            >
              {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In to Account' : 'Create Free Account')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
