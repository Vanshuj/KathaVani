import React, { useEffect, useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faBan,
  faRotateRight,
  faTrash,
  faEye,
  faUserGear,
  faSliders,
  faCircleCheck,
  faXmark,
  faBookOpen
} from '@fortawesome/free-solid-svg-icons';
import {
  getAdminUsers,
  getAdminUserDetail,
  updateAdminUserStatus,
  updateAdminUserRestrictions,
  updateAdminUserRole,
  deleteAdminUser
} from '../../services/adminApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useApp } from '../../context/AppContext';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusModal, setStatusModal] = useState({ open: false, user: null, targetStatus: 'suspended', reason: '' });
  const [restrictionModal, setRestrictionModal] = useState({ open: false, user: null, restrictSubmitStory: false, reason: '' });
  const [roleModal, setRoleModal] = useState({ open: false, user: null, targetRole: 'user' });
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null, isPermanent: false });
  const [submittingAction, setSubmittingAction] = useState(false);

  const { admin } = useAdminAuth();
  const { showNotification } = useApp();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminUsers({
        page,
        limit,
        search: search.trim() || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      setUsers(res.users || []);
      setTotal(res.total || 0);
    } catch (err) {
      showNotification(err.error || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, roleFilter, statusFilter, showNotification]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Open Details Modal
  const handleOpenDetails = async (u) => {
    setSelectedUser(u);
    setDetailLoading(true);
    try {
      const res = await getAdminUserDetail(u._id);
      setDetailData(res);
    } catch {
      setDetailData(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // Execute Status Change (Suspend / Activate)
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusModal.user) return;
    setSubmittingAction(true);
    try {
      await updateAdminUserStatus(statusModal.user._id, statusModal.targetStatus, statusModal.reason);
      showNotification(`Account status updated to ${statusModal.targetStatus}`, 'success');
      setStatusModal({ open: false, user: null, targetStatus: 'suspended', reason: '' });
      fetchUsers();
    } catch (err) {
      showNotification(err.error || 'Failed to update status', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Execute Capability Restrictions Change
  const handleRestrictionsSubmit = async (e) => {
    e.preventDefault();
    if (!restrictionModal.user) return;
    setSubmittingAction(true);
    try {
      const capabilities = restrictionModal.restrictSubmitStory ? ['submit_story'] : [];
      await updateAdminUserRestrictions(restrictionModal.user._id, capabilities, restrictionModal.reason);
      showNotification('Account capabilities updated', 'success');
      setRestrictionModal({ open: false, user: null, restrictSubmitStory: false, reason: '' });
      fetchUsers();
    } catch (err) {
      showNotification(err.error || 'Failed to update restrictions', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Execute Role Change
  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    if (!roleModal.user) return;
    setSubmittingAction(true);
    try {
      await updateAdminUserRole(roleModal.user._id, roleModal.targetRole);
      showNotification(`User role changed to ${roleModal.targetRole}`, 'success');
      setRoleModal({ open: false, user: null, targetRole: 'user' });
      fetchUsers();
    } catch (err) {
      showNotification(err.error || 'Failed to update role', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Execute Account Deletion
  const handleDeleteSubmit = async () => {
    if (!deleteModal.user) return;
    setSubmittingAction(true);
    try {
      await deleteAdminUser(deleteModal.user._id, deleteModal.isPermanent);
      showNotification(deleteModal.isPermanent ? 'Account permanently deleted' : 'Account soft-deleted', 'info');
      setDeleteModal({ open: false, user: null, isPermanent: false });
      fetchUsers();
    } catch (err) {
      showNotification(err.error || 'Failed to delete account', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="fade-in">
      {/* ─────────────────────────────────────────────────────────────
          1. SEARCH AND FILTER CONTROLS
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
              placeholder="Search by name, email, or ID..."
              style={{ paddingLeft: '2.4rem', width: '100%' }}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="admin-filter-select"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="reviewer">Reviewer</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="admin-filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="restricted">Restricted</option>
          </select>
        </div>

        <button onClick={fetchUsers} className="btn btn-secondary btn-sm" title="Refresh list">
          <FontAwesomeIcon icon={faRotateRight} spin={loading} /> Refresh
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. USERS TABLE
      ────────────────────────────────────────────────────────────── */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Status</th>
                <th>Karma & Region</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>Loading registered users...</div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No users match the selected query.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrentAdmin = u._id === admin?._id || u._id === admin?.id;
                  return (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="admin-avatar" style={{ width: 34, height: 34 }}>
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                              {u.name} {isCurrentAdmin && <span style={{ fontSize: '0.7rem', color: 'var(--terracotta)' }}>(You)</span>}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={`admin-badge admin-badge-${u.role || 'user'}`}>
                          {u.role || 'user'}
                        </span>
                      </td>

                      <td>
                        <span className={`admin-badge admin-badge-${u.status || 'active'}`}>
                          {u.status || 'active'}
                        </span>
                        {u.status === 'suspended' && u.suspensionReason && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            {u.suspensionReason.slice(0, 30)}...
                          </div>
                        )}
                        {u.status === 'restricted' && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--terracotta)', marginTop: '0.2rem' }}>
                            {u.restrictedCapabilities?.join(', ') || 'Restricted'}
                          </div>
                        )}
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.84rem' }}>{u.karma || 0} Karma</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.region || 'Pan India'}</div>
                      </td>

                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          {/* View details */}
                          <button
                            onClick={() => handleOpenDetails(u)}
                            className="btn btn-ghost btn-sm"
                            title="View Profile & Stories"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>

                          {/* Suspend / Reactivate */}
                          {!isCurrentAdmin && (
                            <button
                              onClick={() => setStatusModal({
                                open: true,
                                user: u,
                                targetStatus: u.status === 'suspended' ? 'active' : 'suspended',
                                reason: ''
                              })}
                              className="btn btn-ghost btn-sm"
                              title={u.status === 'suspended' ? 'Reactivate account' : 'Suspend account'}
                              style={{ color: u.status === 'suspended' ? 'var(--forest-green)' : '#DC2626' }}
                            >
                              <FontAwesomeIcon icon={u.status === 'suspended' ? faCircleCheck : faBan} />
                            </button>
                          )}

                          {/* Restrict capabilities */}
                          {!isCurrentAdmin && (
                            <button
                              onClick={() => setRestrictionModal({
                                open: true,
                                user: u,
                                restrictSubmitStory: (u.restrictedCapabilities || []).includes('submit_story'),
                                reason: u.restrictionReason || ''
                              })}
                              className="btn btn-ghost btn-sm"
                              title="Manage account restrictions"
                              style={{ color: 'var(--terracotta)' }}
                            >
                              <FontAwesomeIcon icon={faSliders} />
                            </button>
                          )}

                          {/* Change Role */}
                          <button
                            onClick={() => setRoleModal({ open: true, user: u, targetRole: u.role || 'user' })}
                            className="btn btn-ghost btn-sm"
                            title="Change user role"
                          >
                            <FontAwesomeIcon icon={faUserGear} />
                          </button>

                          {/* Delete account */}
                          {!isCurrentAdmin && (
                            <button
                              onClick={() => setDeleteModal({ open: true, user: u, isPermanent: false })}
                              className="btn btn-ghost btn-sm"
                              title="Delete account"
                              style={{ color: '#DC2626' }}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="admin-pagination" style={{ padding: '1rem 1.5rem' }}>
          <div>
            Showing {users.length} of {total} registered users
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
          3. USER DETAILS MODAL
      ────────────────────────────────────────────────────────────── */}
      {selectedUser && (
        <div className="admin-modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">User Account Overview</h3>
              <button onClick={() => setSelectedUser(null)} className="btn btn-ghost btn-sm">
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="admin-avatar" style={{ width: 56, height: 56, fontSize: '1.4rem' }}>
                  {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.2rem', fontFamily: 'var(--font-serif)' }}>{selectedUser.name}</h4>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{selectedUser.email}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.45rem' }}>
                    <span className={`admin-badge admin-badge-${selectedUser.role || 'user'}`}>{selectedUser.role || 'user'}</span>
                    <span className={`admin-badge admin-badge-${selectedUser.status || 'active'}`}>{selectedUser.status || 'active'}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div><strong>User ID:</strong> <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{selectedUser._id}</span></div>
                <div><strong>Karma Points:</strong> {selectedUser.karma || 0}</div>
                <div><strong>Preferred Language:</strong> {selectedUser.language || 'English'}</div>
                <div><strong>Cultural Region:</strong> {selectedUser.region || 'Pan India'}</div>
                <div><strong>Registered:</strong> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}</div>
                <div><strong>Badges:</strong> {selectedUser.badges?.join(', ') || 'None'}</div>
              </div>

              {/* User Stories */}
              <h4 style={{ margin: '1rem 0 0.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FontAwesomeIcon icon={faBookOpen} style={{ color: 'var(--terracotta)' }} /> Authored Lore ({detailData?.totalStories || 0})
              </h4>
              {detailLoading ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading authored stories...</div>
              ) : (!detailData?.stories || detailData.stories.length === 0) ? (
                <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>This user has not contributed any oral stories yet.</div>
              ) : (
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  {detailData.stories.map((st) => (
                    <div key={st._id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{st.title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{st.language} • {st.votes} votes • {st.authenticity}% authenticity</div>
                      </div>
                      <span className={`admin-badge admin-badge-${st.moderationStatus || 'approved'}`}>
                        {st.moderationStatus || 'approved'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="admin-modal-footer">
              <button onClick={() => setSelectedUser(null)} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. SUSPEND / REACTIVATE MODAL
      ────────────────────────────────────────────────────────────── */}
      {statusModal.open && (
        <div className="admin-modal-overlay" onClick={() => setStatusModal({ ...statusModal, open: false })}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleStatusSubmit}>
              <div className="admin-modal-header">
                <h3 className="admin-modal-title">
                  {statusModal.targetStatus === 'suspended' ? 'Suspend Account' : 'Reactivate Account'}
                </h3>
                <button type="button" onClick={() => setStatusModal({ ...statusModal, open: false })} className="btn btn-ghost btn-sm">
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
              <div className="admin-modal-body">
                <p style={{ margin: '0 0 1rem', fontSize: '0.92rem' }}>
                  Are you sure you want to {statusModal.targetStatus === 'suspended' ? 'suspend' : 'reactivate'} the account for <strong>{statusModal.user?.name}</strong> ({statusModal.user?.email})?
                </p>

                {statusModal.targetStatus === 'suspended' && (
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.45rem' }}>
                      Reason for Suspension
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={statusModal.reason}
                      onChange={(e) => setStatusModal({ ...statusModal, reason: e.target.value })}
                      placeholder="Specify violation of community guidelines or moderation reason..."
                      style={{ width: '100%' }}
                    />
                  </div>
                )}
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={() => setStatusModal({ ...statusModal, open: false })} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className={`btn ${statusModal.targetStatus === 'suspended' ? 'btn-danger' : 'btn-primary'}`}
                  style={statusModal.targetStatus === 'suspended' ? { background: '#DC2626', color: '#fff' } : {}}
                >
                  {submittingAction ? 'Updating...' : `Confirm ${statusModal.targetStatus === 'suspended' ? 'Suspension' : 'Reactivation'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. RESTRICTIONS MODAL
      ────────────────────────────────────────────────────────────── */}
      {restrictionModal.open && (
        <div className="admin-modal-overlay" onClick={() => setRestrictionModal({ ...restrictionModal, open: false })}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleRestrictionsSubmit}>
              <div className="admin-modal-header">
                <h3 className="admin-modal-title">Account Capability Restrictions</h3>
                <button type="button" onClick={() => setRestrictionModal({ ...restrictionModal, open: false })} className="btn btn-ghost btn-sm">
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
              <div className="admin-modal-body">
                <p style={{ margin: '0 0 1.25rem', fontSize: '0.92rem' }}>
                  Manage individual feature restrictions for <strong>{restrictionModal.user?.name}</strong>.
                </p>

                <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={restrictionModal.restrictSubmitStory}
                      onChange={(e) => setRestrictionModal({ ...restrictionModal, restrictSubmitStory: e.target.checked })}
                      style={{ width: 18, height: 18 }}
                    />
                    <span>Restrict Story Submission (Blocks contributing new oral lore)</span>
                  </label>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.45rem' }}>
                    Reason for Restriction
                  </label>
                  <input
                    type="text"
                    value={restrictionModal.reason}
                    onChange={(e) => setRestrictionModal({ ...restrictionModal, reason: e.target.value })}
                    placeholder="e.g. Spammed low-authenticity submissions"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={() => setRestrictionModal({ ...restrictionModal, open: false })} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submittingAction} className="btn btn-primary">
                  {submittingAction ? 'Saving...' : 'Save Restrictions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. ROLE CHANGE MODAL
      ────────────────────────────────────────────────────────────── */}
      {roleModal.open && (
        <div className="admin-modal-overlay" onClick={() => setRoleModal({ ...roleModal, open: false })}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleRoleSubmit}>
              <div className="admin-modal-header">
                <h3 className="admin-modal-title">Change Account Role</h3>
                <button type="button" onClick={() => setRoleModal({ ...roleModal, open: false })} className="btn btn-ghost btn-sm">
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
              <div className="admin-modal-body">
                <p style={{ margin: '0 0 1.25rem', fontSize: '0.92rem' }}>
                  Modify authorization role for <strong>{roleModal.user?.name}</strong>.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {['user', 'reviewer', 'admin'].map((r) => (
                    <label
                      key={r}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        padding: '0.85rem 1rem',
                        border: '1.5px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        background: roleModal.targetRole === r ? 'var(--stat-card-1-bg)' : 'var(--bg-primary)'
                      }}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={r}
                        checked={roleModal.targetRole === r}
                        onChange={() => setRoleModal({ ...roleModal, targetRole: r })}
                      />
                      <div>
                        <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{r}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {r === 'admin' && 'Full administrative access to all console features and user controls.'}
                          {r === 'reviewer' && 'Can review, approve, and moderate community story submissions.'}
                          {r === 'user' && 'Standard platform member with storytelling and listening access.'}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={() => setRoleModal({ ...roleModal, open: false })} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submittingAction} className="btn btn-primary">
                  {submittingAction ? 'Updating...' : 'Update Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7. DELETE ACCOUNT CONFIRMATION MODAL
      ────────────────────────────────────────────────────────────── */}
      {deleteModal.open && (
        <div className="admin-modal-overlay" onClick={() => setDeleteModal({ ...deleteModal, open: false })}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title" style={{ color: '#DC2626' }}>Delete Account</h3>
              <button onClick={() => setDeleteModal({ ...deleteModal, open: false })} className="btn btn-ghost btn-sm">
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: '0 0 1rem', fontSize: '0.92rem' }}>
                Are you sure you want to delete the account for <strong>{deleteModal.user?.name}</strong> ({deleteModal.user?.email})?
              </p>

              <div style={{ background: 'rgba(220, 38, 38, 0.08)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(220, 38, 38, 0.25)', marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 700, color: '#DC2626' }}>
                  <input
                    type="checkbox"
                    checked={deleteModal.isPermanent}
                    onChange={(e) => setDeleteModal({ ...deleteModal, isPermanent: e.target.checked })}
                    style={{ width: 18, height: 18 }}
                  />
                  <span>Permanent Deletion (Purge completely from database)</span>
                </label>
                <p style={{ margin: '0.35rem 0 0 2rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  By default, accounts are soft-deleted to preserve cultural archive integrity and historical story attribution.
                </p>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button onClick={() => setDeleteModal({ ...deleteModal, open: false })} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleDeleteSubmit}
                disabled={submittingAction}
                className="btn"
                style={{ background: '#DC2626', color: '#fff' }}
              >
                {submittingAction ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
