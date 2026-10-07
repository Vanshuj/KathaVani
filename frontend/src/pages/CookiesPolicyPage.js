import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCookieBite, faCheckCircle, faTimesCircle, faSlidersH, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

export default function CookiesPolicyPage() {
  const handleClearCookies = () => {
    localStorage.removeItem('kv_cookie_consent');
    alert('Cookie consent preferences cleared. The consent prompt will appear on your next page load.');
    window.location.reload();
  };

  return (
    <div className="fade-in" style={{ maxWidth: 860, margin: '0 auto', paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <FontAwesomeIcon icon={faCookieBite} style={{ color: 'var(--terracotta)', fontSize: '1.6rem' }} />
          <h1 style={{ margin: 0, color: 'var(--terracotta)' }}>Cookie Policy</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
          Effective Date: October 7, 2026 | Last Updated: October 7, 2026 | Transparent Privacy Standard
        </p>
      </header>

      <section className="card" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--terracotta)' }}>1. What Are Cookies and Local Storage?</h2>
        <p>
          Cookies and local browser storage are small text files or key-value entries stored in your device's web browser when you visit a website. Unlike commercial platforms that place intrusive advertising trackers on your machine, KathaVani uses storage strictly to preserve your user session, accessibility choices, and offline story downloads.
        </p>
      </section>

      <section className="card" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--terracotta)' }}>2. Storage Taxonomy & What KathaVani Uses</h2>
        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', background: 'var(--bg)' }}>
                <th style={{ padding: '0.75rem' }}>Storage Key</th>
                <th style={{ padding: '0.75rem' }}>Type</th>
                <th style={{ padding: '0.75rem' }}>Category</th>
                <th style={{ padding: '0.75rem' }}>Purpose</th>
                <th style={{ padding: '0.75rem' }}>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)' }}>kv_token</td>
                <td style={{ padding: '0.75rem' }}>localStorage</td>
                <td style={{ padding: '0.75rem' }}><span style={{ color: 'var(--jade)', fontWeight: 600 }}>Strictly Necessary</span></td>
                <td style={{ padding: '0.75rem' }}>Secures your logged-in session via JWT authentication</td>
                <td style={{ padding: '0.75rem' }}>7 days / until sign out</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)' }}>kv_cookie_consent</td>
                <td style={{ padding: '0.75rem' }}>localStorage</td>
                <td style={{ padding: '0.75rem' }}><span style={{ color: 'var(--jade)', fontWeight: 600 }}>Strictly Necessary</span></td>
                <td style={{ padding: '0.75rem' }}>Remembers your cookie consent choice</td>
                <td style={{ padding: '0.75rem' }}>Persistent / 1 year</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)' }}>kv_theme</td>
                <td style={{ padding: '0.75rem' }}>localStorage</td>
                <td style={{ padding: '0.75rem' }}><span style={{ color: 'var(--terracotta)', fontWeight: 600 }}>Functional</span></td>
                <td style={{ padding: '0.75rem' }}>Stores your visual theme preference (Light or Dark)</td>
                <td style={{ padding: '0.75rem' }}>Persistent</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)' }}>kv_fontSize</td>
                <td style={{ padding: '0.75rem' }}>localStorage</td>
                <td style={{ padding: '0.75rem' }}><span style={{ color: 'var(--terracotta)', fontWeight: 600 }}>Accessibility</span></td>
                <td style={{ padding: '0.75rem' }}>Remembers custom font scaling for visual accessibility</td>
                <td style={{ padding: '0.75rem' }}>Persistent</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)' }}>kv_hc</td>
                <td style={{ padding: '0.75rem' }}>localStorage</td>
                <td style={{ padding: '0.75rem' }}><span style={{ color: 'var(--terracotta)', fontWeight: 600 }}>Accessibility</span></td>
                <td style={{ padding: '0.75rem' }}>High contrast mode for low-vision readers</td>
                <td style={{ padding: '0.75rem' }}>Persistent</td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)' }}>localforage</td>
                <td style={{ padding: '0.75rem' }}>IndexedDB</td>
                <td style={{ padding: '0.75rem' }}><span style={{ color: 'var(--gold)', fontWeight: 600 }}>Offline Pack</span></td>
                <td style={{ padding: '0.75rem' }}>Caches audio and text of downloaded community stories</td>
                <td style={{ padding: '0.75rem' }}>Until user removes pack</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--terracotta)' }}>3. Zero Third-Party Advertising & Telemetry Trackers</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem', background: 'rgba(58,122,92,0.08)', border: '1px solid var(--jade)', borderRadius: 'var(--radius-sm)' }}>
          <FontAwesomeIcon icon={faShieldAlt} style={{ color: 'var(--jade)', fontSize: '1.4rem', flexShrink: 0 }} />
          <div>
            <strong>100% Tracker Free Guarantee:</strong> KathaVani does not deploy third-party analytics trackers, advertising beacons, or social surveillance pixels. Your reading history and oral tradition exploration remain strictly between you and this platform.
          </div>
        </div>
      </section>

      <section className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--terracotta)' }}>4. Managing and Clearing Your Preferences</h2>
        <p>
          You have full control over your stored preferences. You can clear your stored cookies and local data directly through your web browser settings at any time, or reset your consent banner below:
        </p>
        <div style={{ marginTop: '1rem' }}>
          <button onClick={handleClearCookies} className="btn btn-secondary">
            <FontAwesomeIcon icon={faSlidersH} /> Reset Cookie & Storage Consent Preferences
          </button>
        </div>
        <p style={{ marginTop: '1.25rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          For queries concerning device storage or privacy, contact our privacy desk at <a href="mailto:privacy@kathavani.in">privacy@kathavani.in</a>.
        </p>
      </section>
    </div>
  );
}
