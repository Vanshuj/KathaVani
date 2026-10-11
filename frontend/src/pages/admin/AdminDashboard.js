import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faBookOpen,
  faUserShield,
  faArrowRight,
  faRotateRight,
  faTriangleExclamation,
  faCircleCheck,
  faBan,
  faFileLines
} from '@fortawesome/free-solid-svg-icons';
import { getDashboardStats } from '../../services/adminApi';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { admin } = useAdminAuth();
  const navigate = useNavigate();

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboardStats();
      setData(res);
    } catch (err) {
      setError(err.error || 'Failed to retrieve dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !data) {
    return (
      <div className="fade-in">
        <div className="admin-stats-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="admin-card" style={{ height: 130 }}>
              <div className="skeleton" style={{ width: '40%', height: 28, marginBottom: 12 }} />
              <div className="skeleton" style={{ width: '70%', height: 16 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    restrictedUsers: 0,
    totalAdmins: 0,
    totalStories: 0,
    approvedStories: 0,
    pendingStories: 0,
    flaggedStories: 0,
    storiesToBeApproved: 0
  };

  return (
    <div className="fade-in">
      {/* ─────────────────────────────────────────────────────────────
          1. WELCOME BANNER & QUICK CONTROLS
      ────────────────────────────────────────────────────────────── */}
      <div
        className="admin-card"
        style={{
          background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-primary) 100%)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          borderLeft: '4px solid var(--forest-green)'
        }}
      >
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 800, margin: '0 0 0.35rem' }}>
            Welcome back, {admin?.name || 'Administrator'}
          </h2>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            KathaVani cultural oral archive platform overview and operational moderation status.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <FontAwesomeIcon icon={faRotateRight} spin={loading} /> Refresh Metrics
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#DC2626', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. CORE PLATFORM SUMMARY CARDS (Green & Orange 3D Clay Aesthetic)
      ────────────────────────────────────────────────────────────── */}
      <div className="admin-stats-grid">
        {/* Card 1: Total Users */}
        <div
          className="admin-stat-card clay-stat-card-1"
          onClick={() => navigate('/admin/users')}
          style={{ cursor: 'pointer' }}
        >
          <div className="admin-stat-card-icon clay-stat-icon-1">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div className="admin-stat-value" style={{ color: 'var(--stat-card-1-text)' }}>
            {stats.totalUsers.toLocaleString()}
          </div>
          <div className="admin-stat-label">Registered Users</div>
          <div className="admin-stat-pill clay-stat-pill-1">
            {stats.activeUsers} Active
          </div>
        </div>

        {/* Card 2: Stories Archived */}
        <div
          className="admin-stat-card clay-stat-card-2"
          onClick={() => navigate('/admin/stories')}
          style={{ cursor: 'pointer' }}
        >
          <div className="admin-stat-card-icon clay-stat-icon-2">
            <FontAwesomeIcon icon={faBookOpen} />
          </div>
          <div className="admin-stat-value" style={{ color: 'var(--stat-card-2-text)' }}>
            {stats.totalStories.toLocaleString()}
          </div>
          <div className="admin-stat-label">Stories in Archive</div>
          <div className="admin-stat-pill clay-stat-pill-2">
            {stats.approvedStories} Verified
          </div>
        </div>

        {/* Card 3: System Administrators */}
        <div
          className="admin-stat-card clay-stat-card-4"
          onClick={() => navigate('/admin/admins')}
          style={{ cursor: 'pointer' }}
        >
          <div className="admin-stat-card-icon clay-stat-icon-4">
            <FontAwesomeIcon icon={faUserShield} />
          </div>
          <div className="admin-stat-value" style={{ color: 'var(--stat-card-4-text)' }}>
            {stats.totalAdmins}
          </div>
          <div className="admin-stat-label">Active Administrators</div>
          <div className="admin-stat-pill clay-stat-pill-4">
            Secured
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. SECONDARY HEALTH METRICS
      ────────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="admin-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', margin: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(220, 38, 38, 0.1)', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesomeIcon icon={faBan} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{stats.suspendedUsers}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Suspended Users</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', margin: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--stat-card-3-icon-bg)', color: 'var(--stat-card-3-icon-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesomeIcon icon={faTriangleExclamation} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{stats.restrictedUsers}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Restricted Users</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', margin: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--stat-card-1-icon-bg)', color: 'var(--stat-card-1-icon-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesomeIcon icon={faCircleCheck} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{stats.approvedStories}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Approved Public Lore</div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. TWO-COLUMN OPERATIONAL SUMMARY
      ────────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Left: Recent Story Submissions */}
        <div className="admin-card" style={{ margin: 0 }}>
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <FontAwesomeIcon icon={faBookOpen} style={{ color: 'var(--terracotta)' }} /> Recent Story Submissions
            </h3>
            <button onClick={() => navigate('/admin/stories')} className="btn btn-ghost btn-sm" style={{ fontSize: '0.8rem' }}>
              View All <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>

          {(!data?.recentStories || data.recentStories.length === 0) ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No recent stories recorded.</div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Language</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentStories.map((story) => (
                    <tr key={story._id}>
                      <td style={{ fontWeight: 600 }}>{story.title}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{story.authorName || 'Anonymous'}</td>
                      <td>
                        <span className="admin-badge admin-badge-user">{story.language}</span>
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge-${story.moderationStatus || (story.isModerated ? 'approved' : 'pending')}`}>
                          {story.moderationStatus || (story.isModerated ? 'approved' : 'pending')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Recent User Registrations */}
        <div className="admin-card" style={{ margin: 0 }}>
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <FontAwesomeIcon icon={faUsers} style={{ color: 'var(--forest-green)' }} /> Recent Registrations
            </h3>
            <button onClick={() => navigate('/admin/users')} className="btn btn-ghost btn-sm" style={{ fontSize: '0.8rem' }}>
              View All <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>

          {(!data?.recentUsers || data.recentUsers.length === 0) ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No recent users registered.</div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentUsers.map((u) => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{u.email}</td>
                      <td>
                        <span className={`admin-badge admin-badge-${u.role || 'user'}`}>
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge-${u.status || 'active'}`}>
                          {u.status || 'active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. RECENT ACTIVITY AUDIT LOGS
      ────────────────────────────────────────────────────────────── */}
      <div className="admin-card" style={{ margin: 0 }}>
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            <FontAwesomeIcon icon={faFileLines} style={{ color: 'var(--stat-card-3-icon-color)' }} /> Recent Administrative Audit Trail
          </h3>
          <button onClick={() => navigate('/admin/logs')} className="btn btn-ghost btn-sm" style={{ fontSize: '0.8rem' }}>
            Full Audit Logs <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>

        {(!data?.recentLogs || data.recentLogs.length === 0) ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No audit logs recorded yet.</div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Acting Admin</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {data.recentLogs.map((log) => (
                  <tr key={log._id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 600 }}>{log.adminName}</td>
                    <td>
                      <span className="admin-badge admin-badge-admin" style={{ fontSize: '0.68rem' }}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{log.targetTitle || log.targetType}</span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {log.ipAddress || 'Internal'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
