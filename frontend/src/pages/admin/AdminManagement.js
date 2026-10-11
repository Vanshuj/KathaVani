import React, { useEffect, useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserShield,
  faPlus,
  faRotateRight,
  faUserSlash,
  faEnvelope,
  faLock,
  faUser,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { getAdminsList, createAdminAccount, demoteAdminAccount } from '../../services/adminApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useApp } from '../../context/AppContext';

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModal, setCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [demoteModal, setDemoteModal] = useState({ open: false, adminUser: null, newRole: 'user', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const { admin: currentAdmin } = useAdminAuth();
  const { showNotification } = useApp();

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminsList();
      setAdmins(data || []);
    } catch (err) {
      showNotification(err.error || 'Failed to retrieve administrators', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Create new Admin
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showNotification('Password must be at least 8 characters long', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await createAdminAccount({
        name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        password: newPassword
      });
      showNotification('Administrator created successfully', 'success');
      setCreateModal(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      fetchAdmins();
    } catch (err) {
      showNotification(err.error || 'Failed to create administrator', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Demote Admin
  const handleDemoteSubmit = async (e) => {
    e.preventDefault();
    if (!demoteModal.adminUser) return;

    if (admins.length <= 1) {
      showNotification('Cannot demote the last remaining administrator', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await demoteAdminAccount(demoteModal.adminUser._id, demoteModal.newRole, demoteModal.reason);
      showNotification(`Administrator demoted to ${demoteModal.newRole}`, 'success');
      setDemoteModal({ open: false, adminUser: null, newRole: 'user', reason: '' });
      fetchAdmins();
    } catch (err) {
      showNotification(err.error || 'Failed to demote administrator', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fade-in">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & ACTION CONTROLS
      ────────────────────────────────────────────────────────────── */}
      <div className="admin-toolbar">
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
            System Administrators ({admins.length})
          </h2>
          <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Privileged accounts with access to platform security, moderation, and user governance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchAdmins} className="btn btn-secondary btn-sm" title="Refresh">
            <FontAwesomeIcon icon={faRotateRight} spin={loading} /> Refresh
          </button>
          <button
            onClick={() => setCreateModal(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <FontAwesomeIcon icon={faPlus} /> Create Administrator
          </button>
        </div>
      </div>

      {/* Security Rule Warning Box */}
      <div
        style={{
          background: 'rgba(55, 81, 77, 0.08)',
          border: '1px solid var(--stat-card-1-border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem'
        }}
      >
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--stat-card-1-icon-bg)', color: 'var(--stat-card-1-icon-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FontAwesomeIcon icon={faUserShield} />
        </div>
        <div style={{ fontSize: '0.82rem', lineHeight: 1.45, color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Security Policy:</strong> Public registration of administrators is disabled. Only existing authenticated administrators can provision or authorize new administrative accounts. Every role change is recorded in the immutable audit log.
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. ADMINS TABLE
      ────────────────────────────────────────────────────────────── */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Administrator</th>
                <th>Email Address</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && admins.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    Loading administrator registry...
                  </td>
                </tr>
              ) : (
                admins.map((adm) => {
                  const isSelf = adm._id === currentAdmin?._id || adm._id === currentAdmin?.id;
                  const isLastAdmin = admins.length <= 1;

                  return (
                    <tr key={adm._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="admin-avatar" style={{ background: 'var(--stat-card-3-icon-bg)', color: 'var(--stat-card-3-icon-color)' }}>
                            {adm.name ? adm.name.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>
                              {adm.name} {isSelf && <span style={{ color: 'var(--terracotta)', fontSize: '0.72rem' }}>(Current Session)</span>}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              ID: {adm._id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                        {adm.email}
                      </td>

                      <td>
                        <span className="admin-badge admin-badge-active">
                          {adm.status || 'Active'}
                        </span>
                      </td>

                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {adm.createdAt ? new Date(adm.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        {isSelf ? (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Active</span>
                        ) : isLastAdmin ? (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Last Admin</span>
                        ) : (
                          <button
                            onClick={() => setDemoteModal({ open: true, adminUser: adm, newRole: 'user', reason: '' })}
                            className="btn btn-ghost btn-sm"
                            title="Revoke Admin privileges"
                            style={{ color: '#DC2626' }}
                          >
                            <FontAwesomeIcon icon={faUserSlash} /> Revoke Privileges
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. CREATE NEW ADMINISTRATOR MODAL
      ────────────────────────────────────────────────────────────── */}
      {createModal && (
        <div className="admin-modal-overlay" onClick={() => setCreateModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleCreateSubmit}>
              <div className="admin-modal-header">
                <h3 className="admin-modal-title">Provision New Administrator</h3>
                <button type="button" onClick={() => setCreateModal(false)} className="btn btn-ghost btn-sm">
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FontAwesomeIcon icon={faUser} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra"
                      style={{ paddingLeft: '2.4rem', width: '100%' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    Official Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FontAwesomeIcon icon={faEnvelope} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="e.g. ramesh@kathavani.org"
                      style={{ paddingLeft: '2.4rem', width: '100%' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    Temporary Password (min 8 characters)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FontAwesomeIcon icon={faLock} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      style={{ paddingLeft: '2.4rem', width: '100%' }}
                    />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Will be securely hashed using bcryptjs.
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={() => setCreateModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Creating...' : 'Create Administrator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. REVOKE ADMIN PRIVILEGES MODAL
      ────────────────────────────────────────────────────────────── */}
      {demoteModal.open && (
        <div className="admin-modal-overlay" onClick={() => setDemoteModal({ ...demoteModal, open: false })}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleDemoteSubmit}>
              <div className="admin-modal-header">
                <h3 className="admin-modal-title" style={{ color: '#DC2626' }}>Revoke Administrative Privileges</h3>
                <button type="button" onClick={() => setDemoteModal({ ...demoteModal, open: false })} className="btn btn-ghost btn-sm">
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
              <div className="admin-modal-body">
                <p style={{ margin: '0 0 1rem', fontSize: '0.92rem' }}>
                  Are you sure you want to revoke administrative privileges from <strong>{demoteModal.adminUser?.name}</strong> ({demoteModal.adminUser?.email})?
                </p>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    Assign New Role
                  </label>
                  <select
                    value={demoteModal.newRole}
                    onChange={(e) => setDemoteModal({ ...demoteModal, newRole: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="user">Standard User</option>
                    <option value="reviewer">Reviewer</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    Reason for Demotion
                  </label>
                  <input
                    type="text"
                    value={demoteModal.reason}
                    onChange={(e) => setDemoteModal({ ...demoteModal, reason: e.target.value })}
                    placeholder="e.g. End of administrative term, reassignment"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={() => setDemoteModal({ ...demoteModal, open: false })} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn" style={{ background: '#DC2626', color: '#fff' }}>
                  {submitting ? 'Revoking...' : 'Confirm Revocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
