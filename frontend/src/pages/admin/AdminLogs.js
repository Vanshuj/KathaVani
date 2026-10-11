import React, { useEffect, useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faRotateRight,
  faFileLines,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { getAdminAuditLogs } from '../../services/adminApi';
import { useApp } from '../../context/AppContext';

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [targetTypeFilter, setTargetTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const [activeLog, setActiveLog] = useState(null);

  const { showNotification } = useApp();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminAuditLogs({
        page,
        limit,
        search: search.trim() || undefined,
        action: actionFilter !== 'all' ? actionFilter : undefined,
        targetType: targetTypeFilter !== 'all' ? targetTypeFilter : undefined
      });
      setLogs(res.logs || []);
      setTotal(res.total || 0);
    } catch (err) {
      showNotification(err.error || 'Failed to retrieve audit logs', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, actionFilter, targetTypeFilter, showNotification]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.ceil(total / limit) || 1;

  const getActionBadgeClass = (action = '') => {
    if (action.includes('LOGIN')) return 'admin-badge-reviewer';
    if (action.includes('SUSPENDED') || action.includes('DELETED') || action.includes('REJECTED')) return 'admin-badge-rejected';
    if (action.includes('ACTIVATED') || action.includes('APPROVED')) return 'admin-badge-approved';
    if (action.includes('CREATED') || action.includes('PROMOTED')) return 'admin-badge-admin';
    return 'admin-badge-flagged';
  };

  return (
    <div className="fade-in">
      {/* ─────────────────────────────────────────────────────────────
          1. TOOLBAR: SEARCH & FILTERS
      ────────────────────────────────────────────────────────────── */}
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <div style={{ position: 'relative' }} className="admin-search-input">
            <FontAwesomeIcon
              icon={faSearch}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by admin name, action, or target..."
              style={{ paddingLeft: '2.4rem', width: '100%' }}
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="admin-filter-select"
          >
            <option value="all">All Actions</option>
            <option value="ADMIN_LOGIN">Admin Logins</option>
            <option value="USER_SUSPENDED">User Suspended</option>
            <option value="USER_ACTIVATED">User Activated</option>
            <option value="USER_ROLE_CHANGED">Role Changed</option>
            <option value="USER_SOFT_DELETED">User Soft-Deleted</option>
            <option value="USER_PERMANENTLY_DELETED">User Deleted</option>
            <option value="STORY_APPROVED">Story Approved</option>
            <option value="STORY_FLAGGED">Story Flagged</option>
            <option value="STORY_REJECTED">Story Rejected</option>
            <option value="STORY_EDITED">Story Edited</option>
            <option value="STORY_REMOVED">Story Removed</option>
            <option value="ADMIN_CREATED">Admin Created</option>
            <option value="ADMIN_DEMOTED">Admin Demoted</option>
          </select>

          <select
            value={targetTypeFilter}
            onChange={(e) => { setTargetTypeFilter(e.target.value); setPage(1); }}
            className="admin-filter-select"
          >
            <option value="all">All Targets</option>
            <option value="User">User</option>
            <option value="Story">Story</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <button onClick={fetchLogs} className="btn btn-secondary btn-sm" title="Refresh">
          <FontAwesomeIcon icon={faRotateRight} spin={loading} /> Refresh
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. AUDIT LOGS TABLE
      ────────────────────────────────────────────────────────────── */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Administrator</th>
                <th>Action Performed</th>
                <th>Target Resource</th>
                <th>Target Type</th>
                <th>IP Address</th>
                <th style={{ textAlign: 'right' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    Loading audit trail records...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No audit records found matching your filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    <td>
                      <div style={{ fontWeight: 700 }}>{log.adminName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.adminEmail}</div>
                    </td>

                    <td>
                      <span className={`admin-badge ${getActionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {log.targetTitle || 'N/A'}
                      </div>
                      {log.targetId && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          ID: {log.targetId}
                        </div>
                      )}
                    </td>

                    <td>
                      <span className="admin-badge admin-badge-user">{log.targetType}</span>
                    </td>

                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {log.ipAddress || 'Internal'}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setActiveLog(log)}
                        className="btn btn-ghost btn-sm"
                        title="View Log Metadata"
                      >
                        <FontAwesomeIcon icon={faFileLines} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="admin-pagination" style={{ padding: '1rem 1.5rem' }}>
          <div>
            Showing {logs.length} of {total} audit records
          </div>
          <div className="admin-page-controls">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn btn-secondary btn-sm"
            >
              Previous
            </button>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem', fontWeight: 700 }}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn btn-secondary btn-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. LOG DETAIL MODAL
      ────────────────────────────────────────────────────────────── */}
      {activeLog && (
        <div className="admin-modal-overlay" onClick={() => setActiveLog(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Audit Record Details</h3>
              <button onClick={() => setActiveLog(null)} className="btn btn-ghost btn-sm">
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <div><strong>Action:</strong> <span className={`admin-badge ${getActionBadgeClass(activeLog.action)}`}>{activeLog.action}</span></div>
                <div><strong>Timestamp:</strong> {new Date(activeLog.createdAt).toLocaleString()}</div>
                <div><strong>Acting Admin:</strong> {activeLog.adminName} ({activeLog.adminEmail})</div>
                <div><strong>IP Address:</strong> {activeLog.ipAddress || 'Internal/Direct'}</div>
                <div><strong>Target Type:</strong> {activeLog.targetType}</div>
                <div><strong>Target Record:</strong> {activeLog.targetTitle || activeLog.targetId || 'N/A'}</div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.45rem' }}>
                  Recorded Operation Metadata
                </label>
                <pre
                  style={{
                    background: 'var(--bg-primary)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    fontSize: '0.82rem',
                    fontFamily: 'var(--font-mono)',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    margin: 0
                  }}
                >
                  {JSON.stringify(activeLog.details || {}, null, 2)}
                </pre>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button onClick={() => setActiveLog(null)} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
