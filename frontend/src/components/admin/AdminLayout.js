import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartPie,
  faUsers,
  faBookOpen,
  faUserShield,
  faClockRotateLeft,
  faArrowLeft,
  faRightFromBracket,
  faBars,
  faXmark,
  faMoon,
  faSun,
  faShieldHalved
} from '@fortawesome/free-solid-svg-icons';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useApp } from '../../context/AppContext';
import NotificationBell from '../NotificationBell';
import '../../styles/admin.css';

export default function AdminLayout() {
  const { admin, loading, isAuthenticated, logout } = useAdminAuth();
  const { theme, toggleTheme } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      <div className="admin-app-container flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="skeleton" style={{ width: 64, height: 64, borderRadius: 20 }} />
        <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Verifying administrator session...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/admin/login', { replace: true, state: { from: location } });
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') return 'Executive Overview';
    if (path.includes('/admin/users')) return 'User Management & Controls';
    if (path.includes('/admin/stories')) return 'Story Moderation & Archive Registry';
    if (path.includes('/admin/admins')) return 'Administrator Accounts';
    if (path.includes('/admin/logs')) return 'Activity Audit & Security Logs';
    return 'Administration Console';
  };

  return (
    <div className="admin-app-container">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 95
          }}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. SIDEBAR NAVIGATION
      ────────────────────────────────────────────────────────────── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-brand">
            <div className="admin-brand-icon">
              <FontAwesomeIcon icon={faShieldHalved} />
            </div>
            <div>
              <div className="admin-brand-title">KathaVani</div>
              <span className="admin-brand-badge">Admin Console</span>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="btn btn-ghost btn-sm"
            style={{ display: sidebarOpen ? 'block' : 'none' }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <nav className="admin-nav">
          <NavLink
            to="/admin"
            end
            onClick={closeSidebar}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="admin-nav-icon"><FontAwesomeIcon icon={faChartPie} /></span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/users"
            onClick={closeSidebar}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="admin-nav-icon"><FontAwesomeIcon icon={faUsers} /></span>
            <span>User Management</span>
          </NavLink>

          <NavLink
            to="/admin/stories"
            onClick={closeSidebar}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="admin-nav-icon"><FontAwesomeIcon icon={faBookOpen} /></span>
            <span>Story Moderation</span>
          </NavLink>

          <NavLink
            to="/admin/admins"
            onClick={closeSidebar}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="admin-nav-icon"><FontAwesomeIcon icon={faUserShield} /></span>
            <span>Admin Accounts</span>
          </NavLink>

          <NavLink
            to="/admin/logs"
            onClick={closeSidebar}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="admin-nav-icon"><FontAwesomeIcon icon={faClockRotateLeft} /></span>
            <span>Activity Logs</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <NavLink
            to="/"
            className="btn btn-ghost btn-sm"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              color: 'var(--text-secondary)'
            }}
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Return to Public Portal
          </NavLink>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CONTENT AREA & HEADER
      ────────────────────────────────────────────────────────────── */}
      <div className="admin-main">
        <header className="admin-header">
          <div className="admin-header-left">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="admin-mobile-toggle"
              aria-label="Toggle navigation drawer"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
            <h1 className="admin-page-title">{getPageTitle()}</h1>
          </div>

          <div className="admin-header-right">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-sm"
              title="Toggle Theme"
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
            </button>

            {/* Admin Notification Bell */}
            <NotificationBell isAdmin={true} />

            {/* Admin Identity Chip */}
            <div className="admin-user-chip">
              <div className="admin-avatar">
                {admin.name ? admin.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="admin-user-info">
                <span className="admin-user-name">{admin.name}</span>
                <span className="admin-user-role">Administrator</span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="btn btn-ghost btn-sm"
              title="Sign Out of Admin Console"
              style={{
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}
            >
              <FontAwesomeIcon icon={faRightFromBracket} />
              <span className="desktop-only" style={{ fontSize: '0.82rem' }}>Logout</span>
            </button>
          </div>
        </header>

        <main className="admin-content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
