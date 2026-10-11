import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved, faLock, faEnvelope, faEye, faEyeSlash, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useApp } from '../../context/AppContext';
import '../../styles/admin.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login, isAuthenticated } = useAdminAuth();
  const { showNotification } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both administrator email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      showNotification('Administrator authenticated successfully', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg(err.error || err.message || 'Invalid administrator credentials');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        position: 'relative'
      }}
    >
      {/* Return to Public Hub Button */}
      <button
        onClick={() => navigate('/')}
        className="btn btn-ghost"
        style={{
          position: 'absolute',
          top: '1.5rem',
          left: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem'
        }}
      >
        <FontAwesomeIcon icon={faArrowLeft} /> Back to KathaVani
      </button>

      <div
        className="clay-card fade-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.5rem 2.2rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-clay)',
          background: 'var(--bg-elevated)',
          border: '1.5px solid var(--border)'
        }}
      >
        {/* Security Shield Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'var(--stat-card-3-bg)',
              color: 'var(--stat-card-3-icon-color)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              boxShadow: 'var(--shadow-clay-sm)',
              border: '1.5px solid var(--stat-card-3-border)',
              marginBottom: '1rem'
            }}
          >
            <FontAwesomeIcon icon={faShieldHalved} />
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.65rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: '0 0 0.35rem'
            }}
          >
            KathaVani Administration
          </h2>

          <div
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--stat-card-2-pill-color)',
              background: 'var(--stat-card-2-pill-bg)',
              border: '1px solid var(--stat-card-2-pill-border)',
              padding: '0.2rem 0.75rem',
              borderRadius: 'var(--radius-pill)',
              marginTop: '0.35rem'
            }}
          >
            Restricted Access Control
          </div>
        </div>

        {/* Security Warning Notice */}
        <div
          style={{
            background: 'rgba(184, 93, 52, 0.08)',
            border: '1px solid rgba(184, 93, 52, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            fontSize: '0.8rem',
            lineHeight: 1.45,
            color: 'var(--text-secondary)',
            marginBottom: '1.5rem'
          }}
        >
          <strong style={{ color: 'var(--terracotta)' }}>Notice:</strong> This console is strictly reserved for authorized platform administrators. Public registration is disabled and all activities are recorded in audit logs.
        </div>

        {errorMsg && (
          <div
            style={{
              background: 'rgba(220, 38, 38, 0.1)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              color: '#DC2626',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1.25rem'
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div>
            <label
              htmlFor="admin-email"
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 700,
                marginBottom: '0.45rem',
                color: 'var(--text-primary)'
              }}
            >
              Administrator Email
            </label>
            <div style={{ position: 'relative' }}>
              <FontAwesomeIcon
                icon={faEnvelope}
                style={{
                  position: 'absolute',
                  left: '1.1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem'
                }}
              />
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kathavani.org"
                style={{
                  width: '100%',
                  padding: '0.85rem 1.1rem 0.85rem 2.6rem',
                  fontSize: '0.92rem'
                }}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 700,
                marginBottom: '0.45rem',
                color: 'var(--text-primary)'
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <FontAwesomeIcon
                icon={faLock}
                style={{
                  position: 'absolute',
                  left: '1.1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem'
                }}
              />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '0.85rem 3rem 0.85rem 2.6rem',
                  fontSize: '0.92rem'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.2rem'
                }}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-lg"
            style={{
              marginTop: '0.75rem',
              padding: '0.95rem',
              fontWeight: 700,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.65rem'
            }}
          >
            {submitting ? (
              <>Authenticating...</>
            ) : (
              <>
                <FontAwesomeIcon icon={faShieldHalved} /> Enter Admin Console
              </>
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
            fontSize: '0.78rem',
            color: 'var(--text-muted)'
          }}
        >
          Protected by KathaVani Role-Based Server Authorization
        </div>
      </div>
    </div>
  );
}
