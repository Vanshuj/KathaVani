const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getStore, isMongoMode } = require('../config/db');

const getNotificationModel = () => isMongoMode() ? require('../models/Notification') : null;

/**
 * GET /api/notifications
 * Fetch notifications for authenticated user/admin with unread count and filtering
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { filter = 'all', limit = 50 } = req.query;
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
    const userId = req.user.id.toString();
    const isAdmin = req.user.role === 'admin';

    if (isMongoMode()) {
      const Notification = getNotificationModel();
      
      // Access scope:
      // Regular user: recipient == userId or (recipientRole == 'all')
      // Admin: recipient == userId or recipientRole == 'admin' or recipientRole == 'all'
      const scopeConditions = isAdmin
        ? [{ recipient: userId }, { recipientRole: 'admin' }, { recipientRole: 'all' }]
        : [{ recipient: userId }, { recipientRole: 'all' }];

      const baseQuery = { $or: scopeConditions };

      // Calculate total unread count for current scope
      const unreadCount = await Notification.countDocuments({
        ...baseQuery,
        isRead: false
      });

      // Filter query
      const query = { ...baseQuery };
      if (filter === 'unread') {
        query.isRead = false;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limitNum);

      return res.json({
        notifications,
        unreadCount
      });
    }

    // In-memory mode
    const store = getStore();
    store.notifications = store.notifications || [];

    const scoped = store.notifications.filter(n => {
      const rec = n.recipient ? n.recipient.toString() : null;
      if (isAdmin) {
        return rec === userId || n.recipientRole === 'admin' || n.recipientRole === 'all';
      }
      return rec === userId || n.recipientRole === 'all';
    });

    const unreadCount = scoped.filter(n => !n.isRead).length;

    let filtered = scoped;
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      notifications: filtered.slice(0, limitNum),
      unreadCount
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark a single notification as read
 */
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id.toString();
    const isAdmin = req.user.role === 'admin';

    if (isMongoMode()) {
      const Notification = getNotificationModel();
      const notif = await Notification.findById(id);

      if (!notif) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      // Verify authorization
      const notifRec = notif.recipient ? notif.recipient.toString() : null;
      const isAuthorized = (notifRec === userId) || (isAdmin && notif.recipientRole === 'admin');
      if (!isAuthorized) {
        return res.status(403).json({ error: 'Unauthorized to modify this notification' });
      }

      notif.isRead = true;
      notif.readAt = new Date();
      await notif.save();

      if (req.io) {
        req.io.emit('notification-update', { recipient: notif.recipient, recipientRole: notif.recipientRole });
      }

      return res.json({ success: true, notification: notif });
    }

    // In-memory mode
    const store = getStore();
    store.notifications = store.notifications || [];
    const notif = store.notifications.find(n => n._id === id);

    if (!notif) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const notifRec = notif.recipient ? notif.recipient.toString() : null;
    const isAuthorized = (notifRec === userId) || (isAdmin && notif.recipientRole === 'admin');
    if (!isAuthorized) {
      return res.status(403).json({ error: 'Unauthorized to modify this notification' });
    }

    notif.isRead = true;
    notif.readAt = new Date();
    notif.updatedAt = new Date();

    if (req.io) {
      req.io.emit('notification-update', { recipient: notif.recipient, recipientRole: notif.recipientRole });
    }

    res.json({ success: true, notification: notif });
  } catch (err) {
    console.error('Error marking notification read:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications in scope as read
 */
router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id.toString();
    const isAdmin = req.user.role === 'admin';

    if (isMongoMode()) {
      const Notification = getNotificationModel();
      const scopeConditions = isAdmin
        ? [{ recipient: userId }, { recipientRole: 'admin' }, { recipientRole: 'all' }]
        : [{ recipient: userId }, { recipientRole: 'all' }];

      const result = await Notification.updateMany(
        { $or: scopeConditions, isRead: false },
        { $set: { isRead: true, readAt: new Date() } }
      );

      if (req.io) {
        req.io.emit('notification-update', { recipient: userId, recipientRole: isAdmin ? 'admin' : 'user' });
      }

      return res.json({ success: true, count: result.modifiedCount || 0 });
    }

    // In-memory mode
    const store = getStore();
    store.notifications = store.notifications || [];
    let count = 0;

    store.notifications.forEach(n => {
      const rec = n.recipient ? n.recipient.toString() : null;
      const inScope = isAdmin
        ? (rec === userId || n.recipientRole === 'admin' || n.recipientRole === 'all')
        : (rec === userId || n.recipientRole === 'all');

      if (inScope && !n.isRead) {
        n.isRead = true;
        n.readAt = new Date();
        n.updatedAt = new Date();
        count++;
      }
    });

    if (req.io) {
      req.io.emit('notification-update', { recipient: userId, recipientRole: isAdmin ? 'admin' : 'user' });
    }

    res.json({ success: true, count });
  } catch (err) {
    console.error('Error marking all notifications read:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/notifications/:id
 * Dismiss/delete a notification
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id.toString();
    const isAdmin = req.user.role === 'admin';

    if (isMongoMode()) {
      const Notification = getNotificationModel();
      const notif = await Notification.findById(id);

      if (!notif) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      const notifRec = notif.recipient ? notif.recipient.toString() : null;
      const isAuthorized = (notifRec === userId) || (isAdmin && notif.recipientRole === 'admin');
      if (!isAuthorized) {
        return res.status(403).json({ error: 'Unauthorized to delete this notification' });
      }

      await Notification.findByIdAndDelete(id);

      if (req.io) {
        req.io.emit('notification-update', { recipient: notif.recipient, recipientRole: notif.recipientRole });
      }

      return res.json({ success: true, message: 'Notification dismissed' });
    }

    // In-memory mode
    const store = getStore();
    store.notifications = store.notifications || [];
    const idx = store.notifications.findIndex(n => n._id === id);

    if (idx === -1) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const notif = store.notifications[idx];
    const notifRec = notif.recipient ? notif.recipient.toString() : null;
    const isAuthorized = (notifRec === userId) || (isAdmin && notif.recipientRole === 'admin');
    if (!isAuthorized) {
      return res.status(403).json({ error: 'Unauthorized to delete this notification' });
    }

    store.notifications.splice(idx, 1);

    if (req.io) {
      req.io.emit('notification-update', { recipient: notif.recipient, recipientRole: notif.recipientRole });
    }

    res.json({ success: true, message: 'Notification dismissed' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
