import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faCheckDouble,
  faCheckCircle,
  faTimesCircle,
  faCommentDots,
  faBookOpen,
  faBook,
  faStar,
  faShieldHalved,
  faExclamationTriangle,
  faInfoCircle,
  faTimes,
  faSpinner,
  faInbox
} from '@fortawesome/free-solid-svg-icons';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification
} from '../services/notificationApi';
import { useAuth } from '../context/AuthContext';
import './NotificationBell.css';

/**
 * Relative time formatter for storytelling notifications
 */
const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

/**
 * Maps notification type to its contextual icon, color, and clay highlight
 */
const getNotificationIconInfo = (type) => {
  switch (type) {
    case 'story_submitted':
      return { icon: faBookOpen, color: 'var(--steel-blue, #90AEB2)', bg: 'var(--steel-blue-subtle, #EDF5F6)' };
    case 'story_approved':
      return { icon: faCheckCircle, color: '#16A34A', bg: 'rgba(22, 163, 74, 0.12)' };
    case 'story_rejected':
      return { icon: faTimesCircle, color: '#DC2626', bg: 'rgba(220, 38, 38, 0.12)' };
    case 'story_feedback':
      return { icon: faCommentDots, color: 'var(--ceramic-mug, #DD8E75)', bg: 'var(--ceramic-mug-subtle, #FDF1ED)' };
    case 'story_voted':
      return { icon: faStar, color: '#D97706', bg: 'rgba(217, 119, 6, 0.12)' };
    case 'story_reviewed':
      return { icon: faStar, color: '#D97706', bg: 'rgba(217, 119, 6, 0.12)' };
    case 'regional_story':
      return { icon: faBook, color: 'var(--pastel-lilac-dark, #6D4CA0)', bg: 'rgba(109, 76, 160, 0.12)' };
    case 'account_suspended':
      return { icon: faExclamationTriangle, color: '#DC2626', bg: 'rgba(220, 38, 38, 0.12)' };
    case 'account_restored':
      return { icon: faShieldHalved, color: '#16A34A', bg: 'rgba(22, 163, 74, 0.12)' };
    case 'account_restricted':
      return { icon: faExclamationTriangle, color: '#D97706', bg: 'rgba(217, 119, 6, 0.12)' };
    case 'admin_new_story':
      return { icon: faBookOpen, color: 'var(--terracotta, #B6594C)', bg: 'var(--cranberry-subtle, #F9EFEB)' };
    case 'admin_moderation':
      return { icon: faShieldHalved, color: 'var(--forest-green, #182B28)', bg: 'var(--steel-blue-subtle, #EDF5F6)' };
    default:
      return { icon: faInfoCircle, color: 'var(--charcoal-muted, #536E69)', bg: 'var(--clay-tray, #F1ECE2)' };
  }
};

export default function NotificationBell({ isAdmin = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Determine if this bell is active and authenticated
  const hasAuth = isAdmin
    ? Boolean(localStorage.getItem('kv_admin_token') || localStorage.getItem('kv_token'))
    : Boolean(user || localStorage.getItem('kv_token'));

  /**
   * Fetch notifications from backend
   */
  const loadNotifications = useCallback(async (showLoader = false) => {
    if (!hasAuth) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    if (showLoader) setLoading(true);
    try {
      const data = await fetchNotifications({ filter: 'all', limit: 40, isAdmin });
      if (data && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setUnreadCount(typeof data.unreadCount === 'number' ? data.unreadCount : 0);
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err.message);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [hasAuth, isAdmin]);

  // Initial fetch and interval refresh (every 25 seconds)
  useEffect(() => {
    loadNotifications(false);
    const interval = setInterval(() => loadNotifications(false), 25000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Click outside to dismiss
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Toggle dropdown
  const toggleDropdown = () => {
    if (!isOpen) {
      loadNotifications(true);
    }
    setIsOpen(prev => !prev);
  };

  // Mark single notification as read and navigate
  const handleItemClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await markNotificationRead(notif._id, isAdmin);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Error marking as read:', err);
      }
    }

    setIsOpen(false);

    if (notif.link) {
      navigate(notif.link);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    if (unreadCount === 0 || actionLoading) return;
    setActionLoading(true);
    try {
      await markAllNotificationsRead(isAdmin);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all read:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Dismiss / Delete single notification
  const handleDismiss = async (e, notifId) => {
    e.stopPropagation();
    try {
      const target = notifications.find(n => n._id === notifId);
      await deleteNotification(notifId, isAdmin);
      setNotifications(prev => prev.filter(n => n._id !== notifId));
      if (target && !target.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error dismissing notification:', err);
    }
  };

  // Filter items according to active tab
  const displayedNotifications = activeTab === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  return (
    <div className="kv-notif-container" ref={containerRef}>
      {/* Bell Button */}
      <button
        onClick={toggleDropdown}
        className={`kv-notif-bell-btn ${isOpen ? 'active' : ''}`}
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Notifications"
      >
        <FontAwesomeIcon icon={faBell} size="sm" />
        {unreadCount > 0 && (
          <span className="kv-notif-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Box */}
      {isOpen && (
        <div className="kv-notif-dropdown" role="region" aria-label="Recent notifications">
          {/* Header */}
          <div className="kv-notif-header">
            <div className="kv-notif-header-left">
              <h3 className="kv-notif-title">
                {isAdmin ? 'Admin Alerts' : 'Notifications'}
              </h3>
              {unreadCount > 0 && (
                <span className="kv-notif-header-badge">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0 || actionLoading}
              className="kv-notif-mark-all-btn"
              title="Mark all notifications as read"
            >
              <FontAwesomeIcon icon={faCheckDouble} />
              <span>Mark all read</span>
            </button>
          </div>

          {/* All vs Unread Tabs */}
          <div className="kv-notif-tabs" role="tablist">
            <button
              className={`kv-notif-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
              role="tab"
              aria-selected={activeTab === 'all'}
            >
              <span>All</span>
              <span className="kv-notif-tab-count">{notifications.length}</span>
            </button>
            <button
              className={`kv-notif-tab ${activeTab === 'unread' ? 'active' : ''}`}
              onClick={() => setActiveTab('unread')}
              role="tab"
              aria-selected={activeTab === 'unread'}
            >
              <span>Unread</span>
              <span className="kv-notif-tab-count">{unreadCount}</span>
            </button>
          </div>

          {/* Notification List */}
          <div className="kv-notif-list">
            {loading ? (
              <div className="kv-notif-loading">
                <FontAwesomeIcon icon={faSpinner} spin />
                <span>Loading folklore updates...</span>
              </div>
            ) : !hasAuth ? (
              <div className="kv-notif-empty">
                <div className="kv-notif-empty-icon">
                  <FontAwesomeIcon icon={faBell} />
                </div>
                <div className="kv-notif-empty-title">Sign In for Notifications</div>
                <p className="kv-notif-empty-desc">
                  Log in to your storyteller account to receive lore approvals, reviews, and community updates.
                </p>
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="kv-notif-empty">
                <div className="kv-notif-empty-icon">
                  <FontAwesomeIcon icon={faInbox} />
                </div>
                <div className="kv-notif-empty-title">
                  {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </div>
                <p className="kv-notif-empty-desc">
                  {activeTab === 'unread'
                    ? 'All folklore reviews and alerts have been read.'
                    : 'When someone reads, upvotes, or reviews your stories, updates will appear here.'}
                </p>
              </div>
            ) : (
              displayedNotifications.map((notif) => {
                const iconInfo = getNotificationIconInfo(notif.type);
                return (
                  <div
                    key={notif._id}
                    onClick={() => handleItemClick(notif)}
                    className={`kv-notif-item ${!notif.isRead ? 'unread' : 'read'}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleItemClick(notif);
                      }
                    }}
                  >
                    {/* Icon Bubble */}
                    <div
                      className="kv-notif-icon-bubble"
                      style={{ color: iconInfo.color, background: iconInfo.bg }}
                    >
                      <FontAwesomeIcon icon={iconInfo.icon} />
                    </div>

                    {/* Content */}
                    <div className="kv-notif-content">
                      <div className="kv-notif-item-title">
                        <span>{notif.title}</span>
                        <span className="kv-notif-time">{formatTimeAgo(notif.createdAt)}</span>
                      </div>
                      <p className="kv-notif-item-message">{notif.message}</p>
                    </div>

                    {/* Dismiss Button */}
                    <button
                      onClick={(e) => handleDismiss(e, notif._id)}
                      className="kv-notif-dismiss-btn"
                      title="Dismiss notification"
                      aria-label="Dismiss notification"
                    >
                      <FontAwesomeIcon icon={faTimes} size="xs" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
