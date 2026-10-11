import React, { useEffect, useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faRotateRight,
  faCheck,
  faXmark,
  faTrash,
  faEye,
  faHeadphones,
  faShieldHalved,
  faLanguage,
  faMapPin,
  faGlobe,
  faClock,
  faCommentDots,
  faLightbulb,
  faTriangleExclamation,
  faFloppyDisk
} from '@fortawesome/free-solid-svg-icons';
import { useSearchParams } from 'react-router-dom';
import {
  getAdminStories,
  getAdminStoryDetail,
  moderateStory,
  deleteAdminStory
} from '../../services/adminApi';
import { useApp } from '../../context/AppContext';

export default function AdminStories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [stories, setStories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [languageFilter, setLanguageFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlStatus = searchParams.get('status');
    if (urlStatus && urlStatus !== statusFilter) {
      setStatusFilter(urlStatus);
      setPage(1);
    }
  }, [searchParams]);

  // Side-by-side Story Inspection & Review Console State
  const [reviewStory, setReviewStory] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    feedback: '',
    improvementSuggestions: '',
    rejectionReason: ''
  });

  // Story removal modal state
  const [deleteModal, setDeleteModal] = useState({ open: false, story: null, reason: '', permanent: false });
  const [submittingAction, setSubmittingAction] = useState(false);

  const { showNotification } = useApp();

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminStories({
        page,
        limit,
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        language: languageFilter !== 'all' ? languageFilter : undefined
      });
      setStories(res.stories || []);
      setTotal(res.total || 0);
    } catch (err) {
      showNotification(err.error || 'Failed to retrieve stories', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, languageFilter, showNotification]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // Open Side-by-Side Story Details & Review Console
  const handleOpenReview = async (st) => {
    setReviewStory(st);
    setReviewForm({
      feedback: st.adminFeedback || '',
      improvementSuggestions: st.improvementSuggestions || '',
      rejectionReason: st.rejectionReason || ''
    });
    setReviewLoading(true);
    try {
      const full = await getAdminStoryDetail(st._id);
      setReviewStory(full);
      setReviewForm({
        feedback: full.adminFeedback || '',
        improvementSuggestions: full.improvementSuggestions || '',
        rejectionReason: full.rejectionReason || ''
      });
    } catch {
      // Keep basic info
    } finally {
      setReviewLoading(false);
    }
  };

  // Quick Approve directly from table row
  const handleQuickApprove = async (st) => {
    setSubmittingAction(true);
    try {
      await moderateStory(st._id, 'approved', {
        reason: 'Approved by administrator for global archive distribution',
        feedback: 'Approved for global publication.'
      });
      showNotification(`"${st.title}" approved and published globally!`, 'success');
      fetchStories();
    } catch (err) {
      showNotification(err.error || 'Failed to approve story', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Apply Moderation & Editorial Review from the console
  const handleReviewAction = async (targetStatus) => {
    if (!reviewStory) return;
    if (targetStatus === 'rejected' && !reviewForm.rejectionReason.trim()) {
      showNotification('Please provide a reason for rejecting this story.', 'error');
      return;
    }

    setSubmittingAction(true);
    try {
      const res = await moderateStory(reviewStory._id, targetStatus, {
        feedback: reviewForm.feedback,
        improvementSuggestions: reviewForm.improvementSuggestions,
        rejectionReason: reviewForm.rejectionReason,
        reason: targetStatus === 'rejected' ? reviewForm.rejectionReason : reviewForm.feedback
      });

      const message = targetStatus === 'approved'
        ? 'Story approved and published globally!'
        : targetStatus === 'rejected'
        ? 'Story rejected and feedback saved.'
        : 'Editorial review notes saved successfully.';

      showNotification(message, 'success');
      if (res.story) {
        setReviewStory(res.story);
      }
      fetchStories();
    } catch (err) {
      showNotification(err.error || 'Failed to apply moderation action', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Submit Story Removal / Deletion
  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    if (!deleteModal.story) return;
    setSubmittingAction(true);
    try {
      await deleteAdminStory(deleteModal.story._id, deleteModal.reason, deleteModal.permanent);
      showNotification('Story removed from archive', 'info');
      setDeleteModal({ open: false, story: null, reason: '', permanent: false });
      if (reviewStory && reviewStory._id === deleteModal.story._id) {
        setReviewStory(null);
      }
      fetchStories();
    } catch (err) {
      showNotification(err.error || 'Failed to delete story', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="fade-in">
      {/* ─────────────────────────────────────────────────────────────
          1. SEARCH AND FILTER TOOLBAR
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
              placeholder="Search by title, author, or tags..."
              style={{ paddingLeft: '2.4rem', width: '100%' }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="admin-filter-select"
          >
            <option value="all">All Moderation Statuses</option>
            <option value="pending">Pending Approval (Regional)</option>
            <option value="approved">Approved (Global)</option>
            <option value="rejected">Rejected</option>
            <option value="flagged">Flagged</option>
          </select>

          <select
            value={languageFilter}
            onChange={(e) => { setLanguageFilter(e.target.value); setPage(1); }}
            className="admin-filter-select"
          >
            <option value="all">All Languages</option>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Tamil">Tamil</option>
            <option value="Kannada">Kannada</option>
            <option value="Marathi">Marathi</option>
            <option value="Bengali">Bengali</option>
            <option value="Telugu">Telugu</option>
          </select>
        </div>

        <button onClick={fetchStories} className="btn btn-secondary btn-sm" title="Refresh list">
          <FontAwesomeIcon icon={faRotateRight} spin={loading} /> Refresh
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. STORIES MODERATION TABLE
      ────────────────────────────────────────────────────────────── */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Story Title & Region</th>
                <th>Author</th>
                <th>Language</th>
                <th>Authenticity</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && stories.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    Loading stories repository...
                  </td>
                </tr>
              ) : stories.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No stories found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                stories.map((st) => {
                  const currentStatus = st.moderationStatus || (st.isModerated ? 'approved' : 'pending');
                  return (
                    <tr key={st._id}>
                      <td>
                        <div
                          style={{ fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' }}
                          onClick={() => handleOpenReview(st)}
                          title="Click to open manuscript & review console"
                        >
                          {st.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {st.region || 'Pan India'} {st.audioUrl && <span>• <FontAwesomeIcon icon={faHeadphones} /> Audio</span>}
                        </div>
                      </td>

                      <td style={{ color: 'var(--text-secondary)' }}>
                        {st.authorName || 'Community Teller'}
                      </td>

                      <td>
                        <span className="admin-badge admin-badge-user">{st.language || 'English'}</span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>{st.authenticity || 70}%</span>
                          <FontAwesomeIcon
                            icon={faShieldHalved}
                            style={{
                              color: (st.authenticity || 70) >= 85 ? 'var(--forest-green)' : 'var(--terracotta)',
                              fontSize: '0.8rem'
                            }}
                          />
                        </div>
                      </td>

                      <td>
                        <span className={`admin-badge admin-badge-${currentStatus}`}>
                          {currentStatus === 'pending' ? 'Pending (Regional)' : currentStatus === 'approved' ? 'Approved (Global)' : currentStatus}
                        </span>
                        {st.rejectionReason ? (
                          <div style={{ fontSize: '0.72rem', color: '#DC2626', marginTop: '0.2rem' }}>
                            {st.rejectionReason.slice(0, 24)}...
                          </div>
                        ) : st.moderationReason ? (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            {st.moderationReason.slice(0, 24)}...
                          </div>
                        ) : null}
                      </td>

                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {st.createdAt ? new Date(st.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                          {/* Inspect & Review Manuscript Button */}
                          <button
                            onClick={() => handleOpenReview(st)}
                            className="btn btn-ghost btn-sm"
                            title="Inspect Manuscript & Editorial Review"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>

                          {/* Quick Approve Button (Replaces Flag & Edit) */}
                          {currentStatus !== 'approved' ? (
                            <button
                              onClick={() => handleQuickApprove(st)}
                              disabled={submittingAction}
                              className="btn-approve-quick"
                              title="Approve Story & Publish Globally"
                            >
                              <FontAwesomeIcon icon={faCheck} />
                              <span>Approve</span>
                            </button>
                          ) : (
                            <span
                              className="admin-badge admin-badge-approved"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', margin: 0, padding: '0.35rem 0.65rem' }}
                              title="Published globally to all listeners"
                            >
                              <FontAwesomeIcon icon={faGlobe} style={{ fontSize: '0.75rem' }} />
                              <span>Published</span>
                            </span>
                          )}

                          {/* Delete Story */}
                          <button
                            onClick={() => setDeleteModal({ open: true, story: st, reason: '', permanent: false })}
                            className="btn btn-ghost btn-sm"
                            title="Remove story from archive"
                            style={{ color: '#DC2626' }}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
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
            Showing {stories.length} of {total} archived stories
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
          3. SIDE-BY-SIDE STORY DETAILS & ADMIN REVIEW CONSOLE
      ────────────────────────────────────────────────────────────── */}
      {reviewStory && (
        <div className="admin-modal-overlay" onClick={() => setReviewStory(null)}>
          <div className="admin-modal admin-modal-review" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
                <h3 className="admin-modal-title" style={{ maxWidth: '620px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {reviewStory.title}
                </h3>
                <span className={`admin-badge admin-badge-${reviewStory.moderationStatus || 'pending'}`}>
                  {reviewStory.moderationStatus === 'pending' ? 'Pending Approval' : reviewStory.moderationStatus || 'pending'}
                </span>
              </div>
              <button onClick={() => setReviewStory(null)} className="btn btn-ghost btn-sm">
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div className="admin-review-grid">
                {/* ─── LEFT: Story Details & Manuscript ─── */}
                <div className="admin-story-detail-pane">
                  {/* Cultural Regional Visibility Scope Banner */}
                  {reviewStory.moderationStatus === 'approved' ? (
                    <div className="admin-story-scope-banner scope-approved">
                      <FontAwesomeIcon icon={faGlobe} />
                      <span>
                        <strong>Published Globally:</strong> This story has been approved by administrators and is accessible worldwide to all readers, listeners, and guests.
                      </span>
                    </div>
                  ) : reviewStory.moderationStatus === 'rejected' ? (
                    <div className="admin-story-scope-banner scope-rejected">
                      <FontAwesomeIcon icon={faTriangleExclamation} />
                      <span>
                        <strong>Submission Rejected:</strong> Hidden from public lounge feeds. See editorial rejection feedback on the right.
                      </span>
                    </div>
                  ) : (
                    <div className="admin-story-scope-banner scope-pending">
                      <FontAwesomeIcon icon={faMapPin} />
                      <span>
                        <strong>Regional Visibility Only:</strong> Pending administrative approval. Currently visible exclusively to users belonging to the <u>{reviewStory.region || 'Pan India'}</u> cultural region.
                      </span>
                    </div>
                  )}

                  {/* Story Meta Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="admin-badge admin-badge-user">
                      <FontAwesomeIcon icon={faLanguage} style={{ marginRight: '0.35rem' }} />
                      {reviewStory.language || 'English'}
                    </span>
                    <span className="admin-badge admin-badge-user">
                      <FontAwesomeIcon icon={faMapPin} style={{ marginRight: '0.35rem' }} />
                      {reviewStory.region || 'Pan India'}
                    </span>
                    <span className="admin-badge admin-badge-admin">
                      <FontAwesomeIcon icon={faShieldHalved} style={{ marginRight: '0.35rem' }} />
                      {reviewStory.authenticity || 70}% Authenticity
                    </span>
                    {reviewStory.tags && reviewStory.tags.map(t => (
                      <span key={t} className="admin-badge" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Storyteller: <strong>{reviewStory.authorName || 'Anonymous'}</strong> • Submitted on {reviewStory.createdAt ? new Date(reviewStory.createdAt).toLocaleDateString() : 'N/A'} • {reviewStory.votes || 0} community votes
                  </div>

                  {/* Narration Audio Preview */}
                  {reviewStory.audioUrl && (
                    <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--forest-green)' }}>
                        <FontAwesomeIcon icon={faHeadphones} /> Attached Narration Audio
                      </div>
                      <audio controls src={reviewStory.audioUrl} style={{ width: '100%', height: '36px' }} />
                    </div>
                  )}

                  {/* Manuscript Viewer */}
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Story Manuscript
                    </div>
                    {reviewLoading ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Loading full manuscript...
                      </div>
                    ) : (
                      <div className="admin-story-manuscript-box">
                        {reviewStory.content || 'No text content available.'}
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── RIGHT: Admin Story Review Console ─── */}
                <div className="admin-story-review-pane">
                  <div>
                    <h4 style={{ margin: '0 0 0.35rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <FontAwesomeIcon icon={faCommentDots} style={{ color: 'var(--terracotta)' }} />
                      Admin Story Reviews
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Record editorial feedback, suggest improvements, or provide reasons for rejection alongside the story.
                    </p>
                  </div>

                  {/* Previous Review History */}
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FontAwesomeIcon icon={faClock} />
                      Review History & Logged Feedback
                    </div>

                    {reviewStory.adminReviews && reviewStory.adminReviews.length > 0 ? (
                      <div className="admin-review-history-list">
                        {reviewStory.adminReviews.map((rev, idx) => (
                          <div key={idx} className="admin-review-history-item">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ color: 'var(--text-primary)' }}>{rev.adminName || 'Administrator'}</strong>
                              <span className={`admin-badge admin-badge-${rev.action || 'pending'}`} style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>
                                {rev.action}
                              </span>
                            </div>
                            {rev.feedback && (
                              <div>
                                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Feedback: </span>
                                <span>{rev.feedback}</span>
                              </div>
                            )}
                            {rev.improvementSuggestions && (
                              <div>
                                <span style={{ color: 'var(--forest-green)', fontWeight: 600 }}>Improvements: </span>
                                <span>{rev.improvementSuggestions}</span>
                              </div>
                            )}
                            {rev.rejectionReason && (
                              <div style={{ color: '#DC2626' }}>
                                <span style={{ fontWeight: 600 }}>Rejection Reason: </span>
                                <span>{rev.rejectionReason}</span>
                              </div>
                            )}
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              {new Date(rev.createdAt).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : reviewStory.adminFeedback || reviewStory.rejectionReason || reviewStory.moderationReason ? (
                      <div className="admin-review-history-item">
                        {reviewStory.adminFeedback && (
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Feedback: </span>
                            <span>{reviewStory.adminFeedback}</span>
                          </div>
                        )}
                        {reviewStory.improvementSuggestions && (
                          <div>
                            <span style={{ color: 'var(--forest-green)', fontWeight: 600 }}>Improvements: </span>
                            <span>{reviewStory.improvementSuggestions}</span>
                          </div>
                        )}
                        {reviewStory.rejectionReason && (
                          <div style={{ color: '#DC2626' }}>
                            <span style={{ fontWeight: 600 }}>Rejection Reason: </span>
                            <span>{reviewStory.rejectionReason}</span>
                          </div>
                        )}
                        {reviewStory.moderationReason && !reviewStory.rejectionReason && (
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Note: </span>
                            <span>{reviewStory.moderationReason}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ padding: '0.85rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                        No editorial review notes recorded yet for this story.
                      </div>
                    )}
                  </div>

                  {/* Write Editorial Review Form */}
                  <div className="admin-review-form">
                    <div className="admin-review-field">
                      <label htmlFor="review-feedback">
                        <FontAwesomeIcon icon={faCommentDots} style={{ color: 'var(--terracotta)' }} />
                        Editorial Feedback
                      </label>
                      <textarea
                        id="review-feedback"
                        rows={3}
                        value={reviewForm.feedback}
                        onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                        placeholder="Write constructive editorial feedback on tone, folklore authenticity, narration..."
                      />
                    </div>

                    <div className="admin-review-field">
                      <label htmlFor="review-improvements">
                        <FontAwesomeIcon icon={faLightbulb} style={{ color: '#D97706' }} />
                        Suggest Improvements
                      </label>
                      <textarea
                        id="review-improvements"
                        rows={2}
                        value={reviewForm.improvementSuggestions}
                        onChange={(e) => setReviewForm({ ...reviewForm, improvementSuggestions: e.target.value })}
                        placeholder="Suggest specific narrative improvements, historical references, vernacular terms..."
                      />
                    </div>

                    <div className="admin-review-field">
                      <label htmlFor="review-rejection" style={{ color: reviewStory.moderationStatus === 'rejected' ? '#DC2626' : undefined }}>
                        <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: '#DC2626' }} />
                        Reason for Rejection (If rejecting)
                      </label>
                      <textarea
                        id="review-rejection"
                        rows={2}
                        value={reviewForm.rejectionReason}
                        onChange={(e) => setReviewForm({ ...reviewForm, rejectionReason: e.target.value })}
                        placeholder="Provide reasons for rejection or guidelines the author must meet..."
                        style={{ borderColor: reviewForm.rejectionReason ? '#DC2626' : undefined }}
                      />
                    </div>

                    {/* Moderation Actions */}
                    <div className="admin-review-actions">
                      <button
                        type="button"
                        onClick={() => handleReviewAction('approved')}
                        disabled={submittingAction}
                        className="btn btn-primary"
                        style={{
                          background: 'var(--forest-green)',
                          borderColor: 'var(--forest-green)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                        <span>Approve & Publish Globally</span>
                      </button>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                        <button
                          type="button"
                          onClick={() => handleReviewAction('pending')}
                          disabled={submittingAction}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                        >
                          <FontAwesomeIcon icon={faFloppyDisk} />
                          <span>Save Review Notes</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReviewAction('rejected')}
                          disabled={submittingAction}
                          className="btn btn-sm"
                          style={{
                            background: '#DC2626',
                            color: '#fff',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem'
                          }}
                        >
                          <FontAwesomeIcon icon={faXmark} />
                          <span>Reject Story</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button onClick={() => setReviewStory(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. DELETE STORY CONFIRMATION MODAL
      ────────────────────────────────────────────────────────────── */}
      {deleteModal.open && (
        <div className="admin-modal-overlay" onClick={() => setDeleteModal({ ...deleteModal, open: false })}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleDeleteSubmit}>
              <div className="admin-modal-header">
                <h3 className="admin-modal-title" style={{ color: '#DC2626' }}>Remove Story from Archive</h3>
                <button type="button" onClick={() => setDeleteModal({ ...deleteModal, open: false })} className="btn btn-ghost btn-sm">
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
              <div className="admin-modal-body">
                <p style={{ margin: '0 0 1rem', fontSize: '0.92rem' }}>
                  Are you sure you want to remove <strong>{deleteModal.story?.title}</strong>?
                </p>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    Reason for Removal
                  </label>
                  <input
                    type="text"
                    required
                    value={deleteModal.reason}
                    onChange={(e) => setDeleteModal({ ...deleteModal, reason: e.target.value })}
                    placeholder="e.g. Inappropriate content, copyright dispute, duplicate entry"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ background: 'rgba(220, 38, 38, 0.08)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(220, 38, 38, 0.25)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontWeight: 700, color: '#DC2626', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={deleteModal.permanent}
                      onChange={(e) => setDeleteModal({ ...deleteModal, permanent: e.target.checked })}
                    />
                    <span>Permanent Deletion (Purge completely from database)</span>
                  </label>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={() => setDeleteModal({ ...deleteModal, open: false })} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submittingAction} className="btn" style={{ background: '#DC2626', color: '#fff' }}>
                  {submittingAction ? 'Removing...' : 'Confirm Removal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
