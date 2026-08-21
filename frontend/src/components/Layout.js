import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook, faMicrophone, faVault, faTrophy, faCog, faHome,
  faSun, faMoon, faWifi, faBars, faTimes, faSignInAlt, faSignOutAlt, faUser
} from '@fortawesome/free-solid-svg-icons';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

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
    <div className={`app-shell cultural-bg`} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        padding: '0 1.5rem',
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Logo */}
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <span className="diya-glow" style={{ fontSize: '1.5rem' }}>🪔</span>
          <div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--terracotta)' }}>KathaVani</span>
            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginTop: -4 }}>CULTURAL STORYTELLING HUB</span>
          </div>
        </NavLink>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }} className="desktop-nav">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              className="nav-link-animated"
              style={({ isActive }) => ({
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.88rem', fontWeight: 600,
                fontFamily: 'var(--font-body)',
                color: isActive ? 'var(--terracotta)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(180,95,43,0.1)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.2s',
              })}
            >
              <FontAwesomeIcon icon={link.icon} size="sm" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Online indicator */}
          <span title={isOnline ? 'Online' : 'Offline'} style={{ color: isOnline ? 'var(--jade)' : 'var(--dust)' }}>
            <FontAwesomeIcon icon={faWifi} size="sm" style={{ opacity: isOnline ? 1 : 0.5 }} />
          </span>

          {/* Theme toggle */}
          <button onClick={toggleTheme} className="btn btn-ghost btn-sm" title="Toggle theme">
            <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
          </button>

          {/* Auth */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                <FontAwesomeIcon icon={faUser} size="sm" style={{ marginRight: 4 }} />
                {user.name.split(' ')[0]}
              </span>
              <span className="karma-display">⭐ {user.karma || 0}</span>
              <button onClick={() => { logout(); navigate('/'); }} className="btn btn-ghost btn-sm">
                <FontAwesomeIcon icon={faSignOutAlt} />
              </button>
            </div>
          ) : (
            <button onClick={() => navigate('/auth')} className="btn btn-primary btn-sm">
              <FontAwesomeIcon icon={faSignInAlt} /> Sign In
            </button>
          )}

          {/* Mobile menu */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="btn btn-ghost btn-sm mobile-menu-btn">
            <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)',
          padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
          position: 'sticky', top: 64, zIndex: 99
        }}>
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to} end={link.exact}
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)',
                color: isActive ? 'var(--terracotta)' : 'var(--text-primary)',
                background: isActive ? 'rgba(180,95,43,0.1)' : 'transparent',
                textDecoration: 'none', fontWeight: 600, fontSize: '1rem'
              })}
            >
              <FontAwesomeIcon icon={link.icon} />
              {link.label}
            </NavLink>
          ))}
        </div>
      )}

      {/* Main content */}
      <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: 1280, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        padding: '3rem 1.5rem 1.5rem',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem'
      }}>
        <div style={{
          maxWidth: 1280,
          margin: '0 auto 2.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem'
        }}>
          {/* Column 1: Brand & Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="diya-glow" style={{ fontSize: '1.4rem' }}>🪔</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--terracotta)' }}>KathaVani</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>
              Preserving India's rich oral traditions — from ancient myths to living history — through voice, map, and community collaboration.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--terracotta)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
              <li><NavLink to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Home</NavLink></li>
              <li><NavLink to="/storyteller" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Storyteller Workshop</NavLink></li>
              <li><NavLink to="/listener" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Listener Lounge</NavLink></li>
              <li><NavLink to="/vault" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Community Vault</NavLink></li>
              <li><NavLink to="/gamification" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Quests & Ranks</NavLink></li>
            </ul>
          </div>

          {/* Column 3: Explore Themes */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--terracotta)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Explore Themes</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
              <li><NavLink to="/listener?tag=mythology" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Mythology & Legends</NavLink></li>
              <li><NavLink to="/listener?tag=resistance" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Freedom & Resistance</NavLink></li>
              <li><NavLink to="/listener?tag=migration" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Migration Diaries</NavLink></li>
              <li><NavLink to="/listener?tag=folklore" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Folklore & Songs</NavLink></li>
              <li><NavLink to="/listener?tag=tribal" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Tribal Wisdom</NavLink></li>
            </ul>
          </div>

          {/* Column 4: Contact & Preservation */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--terracotta)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>Preservation Hub</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.6, margin: '0 0 0.5rem' }}>
              Join hands in preserving India's cultural heritage. Submit audio recordings, transcribe folk tales, and become a cultural archivist.
            </p>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              📍 Made with ❤️ in India
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          paddingTop: '1.2rem',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            &copy; {new Date().getFullYear()} KathaVani. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#terms" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* Toast notification */}
      {notification && (
        <div className={`toast toast-${notification.type}`}>
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
