import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCookieBite, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('kv_cookie_consent');
    if (!consent) {
      // Delay slightly for smooth page rendering without jarring flash
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('kv_cookie_consent', 'all');
    setVisible(false);
  };

  const handleAcceptNecessary = () => {
    localStorage.setItem('kv_cookie_consent', 'necessary');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      role="region"
      aria-label="Cookie consent banner"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9990,
        background: 'var(--bg-elevated)',
        borderTop: '2px solid var(--terracotta)',
        boxShadow: '0 -4px 20px rgba(46, 36, 31, 0.15)',
        padding: '1.25rem 1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div style={{ flex: '1 1 500px', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
          <FontAwesomeIcon icon={faShieldAlt} style={{ color: 'var(--terracotta)', fontSize: '1.4rem', marginTop: 3, flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 2 }}>
              Your Privacy Matters at KathaVani
            </div>
            <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              We use strictly necessary browser storage to maintain secure logins and accessibility preferences. We do not use third-party tracking or advertising cookies. Learn more in our{' '}
              <Link to="/cookies" style={{ textDecoration: 'underline', fontWeight: 600 }}>Cookie Policy</Link> and{' '}
              <Link to="/privacy" style={{ textDecoration: 'underline', fontWeight: 600 }}>Privacy Policy</Link> (DPDP Act 2023 Compliant).
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleAcceptNecessary}
            className="btn btn-ghost btn-sm"
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            Strictly Necessary Only
          </button>
          <button
            onClick={handleAcceptAll}
            className="btn btn-primary btn-sm"
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            Accept All Storage
          </button>
        </div>
      </div>
    </aside>
  );
}
