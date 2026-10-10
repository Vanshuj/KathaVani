import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook, faMicrophone, faVault, faTrophy, faCog, faHome,
  faSun, faMoon, faWifi, faBars, faTimes, faSignInAlt, faSignOutAlt, faUser, faStar
} from '@fortawesome/free-solid-svg-icons';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import CookieConsent from './CookieConsent';
import Background3D from './Background3D';
import logo from '../assets/logo.png';

export default function Layout() {
  const { theme, toggleTheme, isOnline, notification } = useApp();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { to: '/', label: 'Home', icon: faHome, exact: true },
    { to: '/storyteller', label: 'Storyteller', icon: faMicrophone },
    { to: '/listener', label: 'Listener', icon: faBook },
    { to: '/vault', label: 'Vault', icon: faVault },
    { to: '/gamification', label: 'Quests', icon: faTrophy },
    { to: '/settings', label: 'Settings', icon: faCog },
  ];

  return (
    <div className="app-shell cultural-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* 3D Wooden Table Global Background Effect */}
      <Background3D />

      {/* Skip to main content for accessibility */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Floating Translucent Editorial Navbar with Subtle 3D Elevation */}
      <header style={{ position: 'sticky', top: '0.75rem', zIndex: 100, padding: '0 1.25rem', width: '100%', maxWidth: 1280, margin: '0 auto' }}>
        <nav
          style={{
            background: 'var(--nav-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '0.6rem 1.4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-md)',
            transition: 'all var(--transition)'
          }}
        >
          {/* Logo & Brand Title */}
          <NavLink
            to="/"
            aria-label="KathaVani Cultural Hub home"
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}
          >
            <img
              src={logo}
              alt="KathaVani emblem"
              style={{
                width: 38,
                height: 38,
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 10px rgba(184,93,52,0.22))'
              }}
            />
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--forest-green)',
                  letterSpacing: '-0.01em',
                  display: 'block',
                  lineHeight: 1.15
                }}
              >
                KathaVani
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.62rem',
                  color: 'var(--charcoal-muted)',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.1em',
                  marginTop: 1
                }}
              >
                CULTURAL ARCHIVE
              </span>
            </div>
          </NavLink>

          {/* Desktop Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }} className="desktop-nav">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.exact}
                style={({ isActive }) => ({
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 0.95rem',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  color: isActive ? 'var(--terracotta)' : 'var(--charcoal-muted)',
                  background: isActive ? 'var(--terracotta-subtle)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                })}
              >
                <FontAwesomeIcon icon={link.icon} size="xs" />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {/* Online Indicator */}
            <span
              title={isOnline ? 'Online' : 'Offline'}
              aria-label={isOnline ? 'Network status: Online' : 'Network status: Offline'}
              style={{ color: isOnline ? 'var(--forest-green)' : 'var(--charcoal-faint)', padding: '0 4px' }}
            >
              <FontAwesomeIcon icon={faWifi} size="xs" style={{ opacity: isOnline ? 0.9 : 0.4 }} />
            </span>

            {/* Theme Toggle (Sun/Moon) */}
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-sm"
              aria-label="Toggle dark and light color theme"
              title="Toggle theme"
              style={{
                borderRadius: '50%',
                width: 34,
                height: 34,
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderColor: 'var(--border-delicate)'
              }}
            >
              <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} size="sm" />
            </button>

            {/* User Auth */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.84rem', color: 'var(--charcoal)', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
                  <FontAwesomeIcon icon={faUser} size="xs" style={{ marginRight: 5, color: 'var(--forest-green)' }} />
                  {user.name.split(' ')[0]}
                </span>
                <span
                  style={{
                    background: 'var(--gold-subtle)',
                    color: 'var(--gold-dark)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '12px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  <FontAwesomeIcon icon={faStar} size="xs" style={{ marginRight: 3 }} />
                  {user.karma || 0}
                </span>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="btn btn-ghost btn-sm"
                  aria-label="Sign out of account"
                  title="Sign Out"
                  style={{ borderRadius: '50%', width: 34, height: 34, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} size="sm" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="btn btn-primary btn-sm"
                style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
              >
                <FontAwesomeIcon icon={faSignInAlt} size="xs" /> Sign In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="btn btn-ghost btn-sm mobile-menu-btn"
              aria-label="Toggle navigation menu"
              style={{ borderRadius: '50%', width: 34, height: 34, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} size="sm" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Nav Menu Dropdown */}
      {menuOpen && (
        <div
          style={{
            background: 'var(--bg-elevated)',
            borderBottom: '1px solid var(--border)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            position: 'sticky',
            top: 72,
            zIndex: 99,
            margin: '0.5rem 1.25rem 0',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                color: isActive ? 'var(--terracotta)' : 'var(--text-primary)',
                background: isActive ? 'var(--terracotta-subtle)' : 'transparent',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.95rem'
              })}
            >
              <FontAwesomeIcon icon={link.icon} />
              {link.label}
            </NavLink>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      <main
        id="main-content"
        tabIndex="-1"
        style={{
          flex: 1,
          padding: '2.5rem 1.5rem',
          maxWidth: 1260,
          margin: '0 auto',
          width: '100%',
          outline: 'none',
          position: 'relative',
          zIndex: 1
        }}
      >
        <Outlet />
      </main>

      {/* ─────────────────────────────────────────────────────────────
          MINIMAL EDITORIAL FOOTER with Animated Paper/Book Motif
      ────────────────────────────────────────────────────────────── */}
      <footer
        style={{
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border-delicate)',
          padding: '3.5rem 1.5rem 2rem',
          color: 'var(--charcoal-muted)',
          fontSize: '0.9rem',
          marginTop: 'auto',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto 2.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem'
          }}
        >
          {/* Column 1: Brand & Quiet Mission */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <img
                src={logo}
                alt="KathaVani cultural seal"
                style={{
                  width: 32,
                  height: 32,
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 4px rgba(184,93,52,0.22))'
                }}
              />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--forest-green)' }}>
                KathaVani
              </span>
            </div>

            <p style={{ color: 'var(--charcoal-muted)', fontSize: '0.84rem', lineHeight: 1.65, margin: 0 }}>
              An open, peaceful digital library and living cultural archive dedicated to safeguarding India’s oral traditions, vernacular dialects, and community memories.
            </p>

            {/* Subtle Animated Paper/Book Motif */}
            <div className="animated-book-motif" style={{ marginTop: '0.35rem', fontSize: '0.78rem', color: 'var(--gold-dark)', fontFamily: 'var(--font-editorial)' }}>
              <span>❖</span>
              <span style={{ fontStyle: 'italic' }}>“Every voice holds a world waiting to be remembered.”</span>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--forest-green)', marginBottom: '0.85rem', fontSize: '0.95rem', letterSpacing: '0.02em' }}>
              Explore
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem' }}>
              <li><NavLink to="/" style={{ color: 'var(--charcoal-muted)', textDecoration: 'none' }}>Home</NavLink></li>
              <li><NavLink to="/listener" style={{ color: 'var(--charcoal-muted)', textDecoration: 'none' }}>Story Archive</NavLink></li>
              <li><NavLink to="/storyteller" style={{ color: 'var(--charcoal-muted)', textDecoration: 'none' }}>Storyteller Workshop</NavLink></li>
              <li><NavLink to="/vault" style={{ color: 'var(--charcoal-muted)', textDecoration: 'none' }}>Community Vault</NavLink></li>
              <li><NavLink to="/gamification" style={{ color: 'var(--charcoal-muted)', textDecoration: 'none' }}>Quests & Ranks</NavLink></li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--forest-green)', marginBottom: '0.85rem', fontSize: '0.95rem', letterSpacing: '0.02em' }}>
              Categories
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem' }}>
              <li><NavLink to="/listener?tag=mythology" style={{ color: 'var(--charcoal-muted)', textDecoration: 'none' }}>Mythology & Epics</NavLink></li>
              <li><NavLink to="/listener?tag=folklore" style={{ color: 'var(--charcoal-muted)', textDecoration: 'none' }}>Folk Tales & Ballads</NavLink></li>
              <li><NavLink to="/listener?tag=resistance" style={{ color: 'var(--charcoal-muted)', textDecoration: 'none' }}>Oral Resistance Histories</NavLink></li>
              <li><NavLink to="/listener?tag=migration" style={{ color: 'var(--charcoal-muted)', textDecoration: 'none' }}>Migration Chronicles</NavLink></li>
              <li><NavLink to="/listener?tag=tribal" style={{ color: 'var(--charcoal-muted)', textDecoration: 'none' }}>Tribal Lore</NavLink></li>
            </ul>
          </div>

          {/* Column 4: About & Contact */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--forest-green)', marginBottom: '0.85rem', fontSize: '0.95rem', letterSpacing: '0.02em' }}>
              About & Contact
            </h4>
            <p style={{ color: 'var(--charcoal-muted)', fontSize: '0.84rem', lineHeight: 1.6, margin: '0 0 0.5rem' }}>
              Dedicated to community storytellers, linguists, and folklore archivists worldwide.
            </p>
            <div style={{ fontSize: '0.8rem', color: 'var(--charcoal-muted)', lineHeight: 1.6 }}>
              Desk: <a href="mailto:contact@kathavani.in" style={{ color: 'var(--terracotta)' }}>contact@kathavani.in</a><br />
              Privacy: <a href="mailto:privacy@kathavani.in" style={{ color: 'var(--terracotta)' }}>privacy@kathavani.in</a>
            </div>
          </div>
        </div>

        {/* Minimal Bottom Bar */}
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            paddingTop: '1.4rem',
            borderTop: '1px solid var(--border-delicate)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.82rem',
            color: 'var(--charcoal-faint)'
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} KathaVani Cultural Heritage Foundation. Licensed under CC BY-NC 4.0.
          </div>
          <div style={{ display: 'flex', gap: '1.35rem', flexWrap: 'wrap' }}>
            <NavLink to="/privacy" style={{ color: 'var(--charcoal-muted)', textDecoration: 'none' }}>Privacy Policy</NavLink>
            <NavLink to="/terms" style={{ color: 'var(--charcoal-muted)', textDecoration: 'none' }}>Terms & Conditions</NavLink>
            <NavLink to="/cookies" style={{ color: 'var(--charcoal-muted)', textDecoration: 'none' }}>Cookie Policy</NavLink>
            <NavLink to="/refund" style={{ color: 'var(--charcoal-muted)', textDecoration: 'none' }}>Refund Policy</NavLink>
          </div>
        </div>
      </footer>

      {/* Cookie Consent banner */}
      <CookieConsent />

      {/* Toast notification */}
      {notification && (
        <div className={`toast toast-${notification.type}`} role="status" aria-live="polite">
          {notification.message}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) { .desktop-nav { display: none !important; } }
        @media (min-width: 901px) { .mobile-menu-btn { display: none !important; } }
      `}</style>
    </div>
  );
}
