import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar, faStarHalfAlt, faCommentDots, faTrash, faPen, faCheck,
  faSpinner, faUserCircle, faAward, faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { getStoryReviews, submitStoryReview, deleteStoryReview } from '../services/api';
import { useNavigate } from 'react-router-dom';

const RATING_LABELS = {
  1: '1★ Needs Context',
  2: '2★ Fair Oral Lore',
  3: '3★ Good Storytelling',
  4: '4★ Inspiring & Resonant',
  5: '5★ Living Heritage Masterpiece!'
};

export default function StoryReviews({ storyId, initialRating = 0, initialRatingCount = 0, initialReviews = [], onRatingUpdate }) {
  const { user } = useAuth();
  const { showNotification } = useApp();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(initialRating);
  const [ratingCount, setRatingCount] = useState(initialRatingCount);
  const [loading, setLoading] = useState(false);

  // Review form state
  const [userRating, setUserRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);

  useEffect(() => {
    if (initialReviews && initialReviews.length > 0) {
      setReviews(initialReviews);
      setRating(initialRating);
      setRatingCount(initialRatingCount);
    } else if (storyId) {
      // Fetch fresh reviews
      setLoading(true);
      getStoryReviews(storyId)
        .then(res => {
          setReviews(res.reviews || []);
          setRating(res.rating || 0);
          setRatingCount(res.ratingCount || 0);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [storyId, initialRating, initialRatingCount, initialReviews]);

  // Check if current user has already reviewed
  const userExistingReview = user ? reviews.find(r => (r.userId?._id || r.userId || '').toString() === (user._id || user.id || '').toString()) : null;

  useEffect(() => {
    if (userExistingReview && !editingReviewId) {
      setUserRating(userExistingReview.rating);
      setComment(userExistingReview.comment || '');
    }
  }, [userExistingReview, editingReviewId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showNotification('Please sign in to rate and review stories', 'warning');
      navigate('/auth');
      return;
    }

    if (user.status === 'restricted' && user.restrictedCapabilities?.includes('comment')) {
      showNotification('Your account is restricted from submitting reviews.', 'error');
      return;
    }

    if (!userRating || userRating < 1 || userRating > 5) {
      showNotification('Please select a star rating between 1 and 5', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitStoryReview(storyId, { rating: userRating, comment: comment.trim() });
      setReviews(res.reviews || []);
      setRating(res.rating || 0);
      setRatingCount(res.ratingCount || 0);
      setEditingReviewId(null);
      if (onRatingUpdate) onRatingUpdate(res.rating, res.ratingCount, res.reviews);
      showNotification(userExistingReview ? 'Your review has been updated!' : 'Thank you! Your review and rating have been recorded.', 'success');
    } catch (err) {
      showNotification(err.error || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await deleteStoryReview(storyId, reviewId);
      setReviews(res.reviews || []);
      setRating(res.rating || 0);
      setRatingCount(res.ratingCount || 0);
      if (onRatingUpdate) onRatingUpdate(res.rating, res.ratingCount, res.reviews);
      showNotification('Review deleted', 'info');
      if (editingReviewId === reviewId) {
        setEditingReviewId(null);
        setComment('');
        setUserRating(5);
      }
    } catch (err) {
      showNotification(err.error || 'Failed to delete review', 'error');
    }
  };

  // Compute breakdown percentages
  const ratingBreakdown = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => Math.round(r.rating) === stars).length;
    const percent = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
    return { stars, count, percent };
  });

  return (
    <section id="reviews-section" style={{ marginTop: '3.5rem', marginBottom: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--terracotta-subtle)', color: 'var(--terracotta)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
          <FontAwesomeIcon icon={faCommentDots} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--forest-green)', fontFamily: 'var(--font-display)' }}>
            Listener Reviews & Ratings
          </h2>
          <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--charcoal-muted)' }}>
            Reflections and cultural resonance shared by the oral storytelling community
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. RATING SUMMARY OVERVIEW CARDS (3D Clay Grid)
      ────────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(220px, 280px) 1fr',
          gap: '1.5rem',
          marginBottom: '2rem',
          alignItems: 'stretch'
        }}
        className="review-summary-grid"
      >
        {/* Overall Score Badge Card */}
        <div
          className="editorial-card-3d"
          style={{
            padding: '1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'var(--bg-card)'
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '3.4rem',
              fontWeight: 800,
              color: 'var(--terracotta)',
              lineHeight: 1,
              marginBottom: '0.4rem'
            }}
          >
            {rating > 0 ? rating.toFixed(1) : '—'}
          </div>

          {/* Golden Stars display */}
          <div style={{ display: 'flex', gap: '4px', color: 'var(--gold)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <FontAwesomeIcon
                key={star}
                icon={faStar}
                style={{
                  color: star <= Math.round(rating) ? 'var(--gold)' : 'var(--clay-border)',
                  opacity: star <= Math.round(rating) ? 1 : 0.4
                }}
              />
            ))}
          </div>

          <div style={{ fontSize: '0.9rem', color: 'var(--charcoal-muted)', fontWeight: 600 }}>
            {ratingCount} {ratingCount === 1 ? 'Community Review' : 'Community Reviews'}
          </div>
        </div>

        {/* Rating Breakdown Progress Bars */}
        <div
          className="editorial-card-3d"
          style={{
            padding: '1.25rem 1.6rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '0.5rem',
            background: 'var(--bg-card)'
          }}
        >
          {ratingBreakdown.map(({ stars, count, percent }) => (
            <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.84rem' }}>
              <span style={{ width: 45, fontWeight: 700, color: 'var(--charcoal)', display: 'flex', alignItems: 'center', gap: 3 }}>
                {stars} <FontAwesomeIcon icon={faStar} style={{ color: 'var(--gold)', fontSize: '0.8rem' }} />
              </span>
              <div
                style={{
                  flex: 1,
                  height: 10,
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-pill)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-clay-inset)',
                  border: '1px solid var(--clay-border)'
                }}
              >
                <div
                  style={{
                    width: `${percent}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--gold), var(--terracotta))',
                    borderRadius: 'var(--radius-pill)',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
              <span style={{ width: 35, textAlign: 'right', color: 'var(--charcoal-muted)', fontWeight: 600 }}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. INTERACTIVE REVIEW FORM
      ────────────────────────────────────────────────────────────── */}
      <div
        className="editorial-card-3d"
        style={{
          padding: '1.5rem',
          marginBottom: '2rem',
          background: 'var(--bg-card)'
        }}
      >
        {!user ? (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: 'var(--forest-green)' }}>
              Sign In to Reflect & Rate This Story
            </h3>
            <p style={{ color: 'var(--charcoal-muted)', fontSize: '0.88rem', margin: '0 auto 1.25rem', maxWidth: 440 }}>
              Join the living circle of KathaVani listeners to contribute your personal reflections and rate cultural manuscripts.
            </p>
            <button onClick={() => navigate('/auth')} className="btn btn-primary btn-sm">
              Sign In to KathaVani <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 6 }} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--charcoal)' }}>
                  {userExistingReview ? 'Update Your Rating & Reflection:' : 'Rate this Story:'}
                </span>
                {/* Interactive Star Buttons */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3, 4, 5].map(star => {
                    const activeStar = hoverRating || userRating;
                    const isFilled = star <= activeStar;
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setUserRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px 4px',
                          color: isFilled ? 'var(--gold)' : 'var(--clay-border)',
                          fontSize: '1.4rem',
                          transition: 'transform 0.15s ease'
                        }}
                        title={RATING_LABELS[star]}
                        aria-label={`Rate ${star} star`}
                      >
                        <FontAwesomeIcon icon={faStar} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--terracotta)', fontWeight: 600 }}>
                {RATING_LABELS[hoverRating || userRating]}
              </span>
            </div>

            {/* Comment Textarea */}
            <div style={{ marginBottom: '1rem' }}>
              <textarea
                rows={3}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="What did you feel hearing this oral tradition? Mention regional authenticity, folklore depth, or ancestral wisdom..."
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--clay-border)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.96rem',
                  lineHeight: 1.6,
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center' }}>
              {userExistingReview && (
                <span style={{ fontSize: '0.8rem', color: 'var(--forest-green)', fontStyle: 'italic', marginRight: 'auto' }}>
                  ✓ You previously rated this lore ({userExistingReview.rating}★)
                </span>
              )}
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={submitting || !userRating}
                style={{
                  borderRadius: 'var(--radius-pill)',
                  padding: '0.45rem 1.25rem'
                }}
              >
                {submitting ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 6 }} />
                    Saving…
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheck} style={{ marginRight: 6 }} />
                    {userExistingReview ? 'Update My Review' : 'Submit Review'}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. COMMUNITY REVIEWS LIST
      ────────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: '1.5rem', color: 'var(--terracotta)' }} />
          </div>
        ) : reviews.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '2.5rem 1.5rem',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px dashed var(--clay-border)',
              color: 'var(--charcoal-muted)'
            }}
          >
            <FontAwesomeIcon icon={faStar} style={{ fontSize: '2rem', color: 'var(--gold)', opacity: 0.6, marginBottom: '0.5rem' }} />
            <h4 style={{ margin: '0 0 0.35rem', color: 'var(--charcoal)' }}>No Reviews Yet</h4>
            <p style={{ margin: 0, fontSize: '0.86rem' }}>
              Be the first listener to share your thoughts and rate this oral tradition.
            </p>
          </div>
        ) : (
          reviews.map(review => {
            const isOwner = user && (String(user._id || user.id) === String(review.userId?._id || review.userId) || user.role === 'admin');
            const reviewDate = review.createdAt ? new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Archive';

            return (
              <div
                key={review._id}
                className="card-interactive"
                style={{
                  padding: '1.25rem 1.5rem',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--clay-border)',
                  boxShadow: 'var(--shadow-clay-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--terracotta), var(--gold))',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                      }}
                    >
                      {review.userName ? review.userName.charAt(0).toUpperCase() : 'L'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--charcoal)' }}>
                        {review.userName || 'Community Listener'}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--charcoal-muted)' }}>
                        {reviewDate}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    {/* Stars */}
                    <div style={{ display: 'flex', gap: '2px', color: 'var(--gold)', fontSize: '0.95rem' }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <FontAwesomeIcon
                          key={s}
                          icon={faStar}
                          style={{
                            color: s <= review.rating ? 'var(--gold)' : 'var(--clay-border)',
                            opacity: s <= review.rating ? 1 : 0.35
                          }}
                        />
                      ))}
                    </div>

                    {isOwner && (
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--vermillion)', padding: '0.2rem 0.5rem', height: 'auto' }}
                        title="Delete your review"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    )}
                  </div>
                </div>

                {review.comment && (
                  <p style={{ margin: '0.4rem 0 0', fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                    "{review.comment}"
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .review-summary-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
