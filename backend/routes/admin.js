const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getStore, isMongoMode } = require('../config/db');
const { authMiddleware, adminMiddleware, JWT_SECRET } = require('../middleware/auth');
const {
  notifyStoryApproved,
  notifyStoryRejected,
  notifyStoryFeedback,
  notifyUserStatusChanged,
  notifyUserRestrictionsChanged
} = require('../utils/notificationService');

const getUserModel = () => isMongoMode() ? require('../models/User') : null;
const getStoryModel = () => isMongoMode() ? require('../models/Story') : null;
const getAuditLogModel = () => isMongoMode() ? require('../models/AuditLog') : null;

const signToken = (user) =>
  jwt.sign({
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role || 'user'
  }, JWT_SECRET, { expiresIn: '7d' });

const safeUser = (u) => {
  const obj = u.toObject ? u.toObject() : { ...u };
  delete obj.password;
  return obj;
};

// Helper: record administrative audit events
const logAdminAction = async ({ admin, action, targetType, targetId, targetTitle, details = {}, req = null }) => {
  try {
    const ip = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || null) : null;
    const logData = {
      adminId: admin.id || admin._id,
      adminName: admin.name || 'Administrator',
      adminEmail: admin.email || 'admin@kathavani.org',
      action,
      targetType,
      targetId: targetId ? targetId.toString() : null,
      targetTitle: targetTitle || null,
      details,
      ipAddress: ip
    };

    if (isMongoMode()) {
      const AuditLog = getAuditLogModel();
      await AuditLog.create(logData);
    } else {
      const store = getStore();
      store.auditLogs = store.auditLogs || [];
      store.auditLogs.unshift({
        _id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        ...logData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  } catch (err) {
    console.error('Audit log write error:', err.message);
  }
};

// Helper: count active administrators
const countActiveAdmins = async () => {
  if (isMongoMode()) {
    return await getUserModel().countDocuments({ role: 'admin', status: 'active', isDeleted: { $ne: true } });
  }
  return getStore().users.filter(u => u.role === 'admin' && u.status === 'active' && !u.isDeleted).length;
};

// ─────────────────────────────────────────────────────────────
// 1. ADMIN AUTHENTICATION
// ─────────────────────────────────────────────────────────────

// POST /api/admin/auth/login - Dedicated Admin Authentication
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user;

    if (isMongoMode()) {
      user = await getUserModel().findOne({ email: cleanEmail });
    } else {
      user = getStore().users.find(u => u.email === cleanEmail);
    }

    if (!user || user.isDeleted) {
      return res.status(401).json({ error: 'Invalid administrator credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid administrator credentials' });
    }

    // Role check: Normal users are strictly forbidden from logging into Admin Portal
    if (user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied: You do not possess administrator privileges to access this console.'
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        error: 'Administrator account is suspended',
        reason: user.suspensionReason
      });
    }

    // Record login audit
    await logAdminAction({
      admin: user,
      action: 'ADMIN_LOGIN',
      targetType: 'Admin',
      targetId: user._id,
      targetTitle: user.name,
      details: { email: user.email },
      req
    });

    res.json({
      token: signToken(user),
      user: safeUser(user)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/auth/me - Verify active admin session
router.get('/auth/me', adminMiddleware, async (req, res) => {
  try {
    let user;
    if (isMongoMode()) {
      user = await getUserModel().findById(req.user.id).select('-password');
    } else {
      const raw = getStore().users.find(u => u._id === req.user.id);
      if (raw) user = safeUser(raw);
    }
    if (!user || user.isDeleted || user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized admin session' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 2. DASHBOARD OVERVIEW & METRICS
// ─────────────────────────────────────────────────────────────

// GET /api/admin/dashboard/stats
router.get('/dashboard/stats', adminMiddleware, async (_req, res) => {
  try {
    if (isMongoMode()) {
      const User = getUserModel();
      const Story = getStoryModel();
      const AuditLog = getAuditLogModel();

      const [
        totalUsers,
        activeUsers,
        suspendedUsers,
        restrictedUsers,
        totalAdmins,
        totalReviewers,
        totalStories,
        approvedStories,
        pendingStories,
        flaggedStories,
        rejectedStories,
        recentUsers,
        recentStories,
        recentLogs
      ] = await Promise.all([
        User.countDocuments({ isDeleted: { $ne: true } }),
        User.countDocuments({ status: { $nin: ['suspended', 'restricted'] }, isDeleted: { $ne: true } }),
        User.countDocuments({ status: 'suspended', isDeleted: { $ne: true } }),
        User.countDocuments({ status: 'restricted', isDeleted: { $ne: true } }),
        User.countDocuments({ role: 'admin', isDeleted: { $ne: true } }),
        User.countDocuments({ role: 'reviewer', isDeleted: { $ne: true } }),
        Story.countDocuments({ isDeleted: { $ne: true } }),
        Story.countDocuments({ moderationStatus: 'approved', isDeleted: { $ne: true } }),
        Story.countDocuments({
          $or: [
            { moderationStatus: 'pending' },
            { isModerated: false, moderationStatus: { $ne: 'rejected' } }
          ],
          isDeleted: { $ne: true }
        }),
        Story.countDocuments({ moderationStatus: 'flagged', isDeleted: { $ne: true } }),
        Story.countDocuments({ moderationStatus: 'rejected', isDeleted: { $ne: true } }),
        User.find({ isDeleted: { $ne: true } }).select('-password').sort({ createdAt: -1 }).limit(5),
        Story.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 }).limit(5),
        AuditLog.find().sort({ createdAt: -1 }).limit(6)
      ]);

      return res.json({
        stats: {
          totalUsers,
          activeUsers,
          suspendedUsers,
          restrictedUsers,
          totalAdmins,
          totalReviewers,
          totalStories,
          approvedStories,
          pendingStories,
          flaggedStories,
          rejectedStories,
          storiesToBeApproved: pendingStories
        },
        recentUsers,
        recentStories,
        recentLogs
      });
    }

    // In-memory mode
    const store = getStore();
    const users = store.users.filter(u => !u.isDeleted);
    const stories = store.stories.filter(s => !s.isDeleted);
    const logs = store.auditLogs || [];

    const pendingStories = stories.filter(s => s.moderationStatus === 'pending' || (!s.isModerated && s.moderationStatus !== 'rejected')).length;

    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      suspendedUsers: users.filter(u => u.status === 'suspended').length,
      restrictedUsers: users.filter(u => u.status === 'restricted').length,
      totalAdmins: users.filter(u => u.role === 'admin').length,
      totalReviewers: users.filter(u => u.role === 'reviewer').length,
      totalStories: stories.length,
      approvedStories: stories.filter(s => s.moderationStatus === 'approved').length,
      pendingStories,
      flaggedStories: stories.filter(s => s.moderationStatus === 'flagged').length,
      rejectedStories: stories.filter(s => s.moderationStatus === 'rejected').length,
      storiesToBeApproved: pendingStories
    };

    const recentUsers = [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map(safeUser);
    const recentStories = [...stories].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    const recentLogs = [...logs].slice(0, 6);

    res.json({ stats, recentUsers, recentStories, recentLogs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 3. USER MANAGEMENT
// ─────────────────────────────────────────────────────────────

// GET /api/admin/users - Paginated, searchable & filterable users list
router.get('/users', adminMiddleware, async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 15, includeDeleted = 'false' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));

    if (isMongoMode()) {
      const User = getUserModel();
      const query = {};
      if (includeDeleted !== 'true') query.isDeleted = { $ne: true };
      if (role && role !== 'all') query.role = role;
      if (status && status !== 'all') query.status = status;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { region: { $regex: search, $options: 'i' } }
        ];
      }

      const total = await User.countDocuments(query);
      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      return res.json({ users, total, page: pageNum, limit: limitNum });
    }

    let users = getStore().users.map(safeUser);
    if (includeDeleted !== 'true') users = users.filter(u => !u.isDeleted);
    if (role && role !== 'all') users = users.filter(u => u.role === role);
    if (status && status !== 'all') users = users.filter(u => u.status === status);
    if (search) {
      const q = search.toLowerCase();
      users = users.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.region && u.region.toLowerCase().includes(q))
      );
    }
    users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      users: users.slice((pageNum - 1) * limitNum, pageNum * limitNum),
      total: users.length,
      page: pageNum,
      limit: limitNum
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users/:id - User details with submitted stories
router.get('/users/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    let user;
    let userStories = [];

    if (isMongoMode()) {
      user = await getUserModel().findById(id).select('-password');
      if (!user) return res.status(404).json({ error: 'User not found' });
      userStories = await getStoryModel().find({
        $or: [{ author: user._id }, { author: user._id.toString() }],
        isDeleted: { $ne: true }
      }).select('title language region votes authenticity moderationStatus createdAt');
    } else {
      const raw = getStore().users.find(u => u._id === id);
      if (!raw) return res.status(404).json({ error: 'User not found' });
      user = safeUser(raw);
      userStories = getStore().stories.filter(s => (s.author === id || s.author === user._id) && !s.isDeleted);
    }

    res.json({ user, stories: userStories, totalStories: userStories.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/users/:id/status - Suspend or Reactivate account
router.put('/users/:id/status', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['active', 'suspended', 'restricted'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Protection: Admin cannot suspend their own account
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Self-action forbidden: You cannot change your own account status.' });
    }

    let updatedUser;
    if (isMongoMode()) {
      const user = await getUserModel().findById(id);
      if (!user) return res.status(404).json({ error: 'User not found' });

      // If suspending an admin, ensure at least one active admin remains
      if (user.role === 'admin' && status === 'suspended') {
        const activeAdmins = await countActiveAdmins();
        if (activeAdmins <= 1) {
          return res.status(400).json({ error: 'Cannot suspend the last active administrator.' });
        }
      }

      user.status = status;
      if (status === 'suspended') {
        user.suspensionReason = reason || 'Administrative action';
        user.suspendedAt = new Date();
      } else {
        user.suspensionReason = null;
        user.suspendedAt = null;
      }
      await user.save();
      updatedUser = safeUser(user);
    } else {
      const user = getStore().users.find(u => u._id === id);
      if (!user) return res.status(404).json({ error: 'User not found' });

      if (user.role === 'admin' && status === 'suspended') {
        const activeAdmins = await countActiveAdmins();
        if (activeAdmins <= 1) {
          return res.status(400).json({ error: 'Cannot suspend the last active administrator.' });
        }
      }

      user.status = status;
      user.suspensionReason = status === 'suspended' ? (reason || 'Administrative action') : null;
      user.suspendedAt = status === 'suspended' ? new Date() : null;
      updatedUser = safeUser(user);
    }

    await logAdminAction({
      admin: req.user,
      action: status === 'suspended' ? 'USER_SUSPENDED' : 'USER_ACTIVATED',
      targetType: 'User',
      targetId: id,
      targetTitle: updatedUser.name,
      details: { email: updatedUser.email, reason: reason || 'N/A', status },
      req
    });

    await notifyUserStatusChanged(updatedUser, status, reason, req.io);

    res.json({ message: `User marked as ${status}`, user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/users/:id/restrictions - Restrict account capabilities (e.g. submit_story)
router.put('/users/:id/restrictions', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { restrictedCapabilities = [], reason } = req.body;

    if (id === req.user.id) {
      return res.status(400).json({ error: 'Self-action forbidden: You cannot restrict your own account capabilities.' });
    }

    let updatedUser;
    const newStatus = restrictedCapabilities.length > 0 ? 'restricted' : 'active';

    if (isMongoMode()) {
      const user = await getUserModel().findById(id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      user.restrictedCapabilities = restrictedCapabilities;
      user.restrictionReason = reason || null;
      if (user.status !== 'suspended') user.status = newStatus;
      await user.save();
      updatedUser = safeUser(user);
    } else {
      const user = getStore().users.find(u => u._id === id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      user.restrictedCapabilities = restrictedCapabilities;
      user.restrictionReason = reason || null;
      if (user.status !== 'suspended') user.status = newStatus;
      updatedUser = safeUser(user);
    }

    await logAdminAction({
      admin: req.user,
      action: 'USER_RESTRICTIONS_CHANGED',
      targetType: 'User',
      targetId: id,
      targetTitle: updatedUser.name,
      details: { capabilities: restrictedCapabilities, reason },
      req
    });

    await notifyUserRestrictionsChanged(updatedUser, restrictedCapabilities, reason, req.io);

    res.json({ message: 'User restrictions updated', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/users/:id/role - Update user role (user, reviewer, admin)
router.put('/users/:id/role', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'reviewer', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role value' });
    }

    // Protection: Prevent demoting yourself if you are an admin
    if (id === req.user.id && role !== 'admin') {
      const activeAdmins = await countActiveAdmins();
      if (activeAdmins <= 1) {
        return res.status(400).json({ error: 'Cannot demote the last remaining administrator.' });
      }
    }

    let updatedUser;
    let oldRole;

    if (isMongoMode()) {
      const user = await getUserModel().findById(id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      oldRole = user.role;

      if (oldRole === 'admin' && role !== 'admin') {
        const activeAdmins = await countActiveAdmins();
        if (activeAdmins <= 1) {
          return res.status(400).json({ error: 'Cannot demote the last remaining administrator.' });
        }
      }

      user.role = role;
      await user.save();
      updatedUser = safeUser(user);
    } else {
      const user = getStore().users.find(u => u._id === id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      oldRole = user.role;

      if (oldRole === 'admin' && role !== 'admin') {
        const activeAdmins = await countActiveAdmins();
        if (activeAdmins <= 1) {
          return res.status(400).json({ error: 'Cannot demote the last remaining administrator.' });
        }
      }

      user.role = role;
      updatedUser = safeUser(user);
    }

    await logAdminAction({
      admin: req.user,
      action: 'USER_ROLE_CHANGED',
      targetType: 'User',
      targetId: id,
      targetTitle: updatedUser.name,
      details: { previousRole: oldRole, newRole: role },
      req
    });

    res.json({ message: `Role changed to ${role}`, user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/users/:id - Delete user account (Soft or Permanent)
router.delete('/users/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;

    if (id === req.user.id) {
      return res.status(400).json({ error: 'Self-deletion forbidden: You cannot delete your currently authenticated admin account.' });
    }

    let targetName = 'User';
    let targetEmail = '';

    if (isMongoMode()) {
      const user = await getUserModel().findById(id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      targetName = user.name;
      targetEmail = user.email;

      if (user.role === 'admin') {
        const activeAdmins = await countActiveAdmins();
        if (activeAdmins <= 1) {
          return res.status(400).json({ error: 'Cannot delete the last remaining administrator.' });
        }
      }

      if (permanent === 'true' || permanent === true) {
        await getUserModel().findByIdAndDelete(id);
      } else {
        user.isDeleted = true;
        user.deletedAt = new Date();
        user.status = 'suspended';
        await user.save();
      }
    } else {
      const store = getStore();
      const idx = store.users.findIndex(u => u._id === id);
      if (idx === -1) return res.status(404).json({ error: 'User not found' });
      const user = store.users[idx];
      targetName = user.name;
      targetEmail = user.email;

      if (user.role === 'admin') {
        const activeAdmins = await countActiveAdmins();
        if (activeAdmins <= 1) {
          return res.status(400).json({ error: 'Cannot delete the last remaining administrator.' });
        }
      }

      if (permanent === 'true' || permanent === true) {
        store.users.splice(idx, 1);
      } else {
        user.isDeleted = true;
        user.deletedAt = new Date();
        user.status = 'suspended';
      }
    }

    await logAdminAction({
      admin: req.user,
      action: permanent ? 'USER_PERMANENTLY_DELETED' : 'USER_SOFT_DELETED',
      targetType: 'User',
      targetId: id,
      targetTitle: targetName,
      details: { email: targetEmail, isPermanent: permanent },
      req
    });

    res.json({ message: permanent ? 'Account permanently deleted' : 'Account soft-deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 4. STORY MANAGEMENT & MODERATION
// ─────────────────────────────────────────────────────────────

// GET /api/admin/stories - Paginated & filterable story list with moderation details
router.get('/stories', adminMiddleware, async (req, res) => {
  try {
    const { search, language, region, status, page = 1, limit = 15, includeDeleted = 'false' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));

    if (isMongoMode()) {
      const Story = getStoryModel();
      const query = {};
      if (includeDeleted !== 'true') query.isDeleted = { $ne: true };
      if (language && language !== 'all') query.language = language;
      if (region && region !== 'all') query.region = region;
      if (status && status !== 'all') {
        if (status === 'approved') query.$or = [{ moderationStatus: 'approved' }, { isModerated: true }];
        else query.moderationStatus = status;
      }
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { authorName: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } }
        ];
      }

      const total = await Story.countDocuments(query);
      const stories = await Story.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      return res.json({ stories, total, page: pageNum, limit: limitNum });
    }

    let stories = getStore().stories;
    if (includeDeleted !== 'true') stories = stories.filter(s => !s.isDeleted);
    if (language && language !== 'all') stories = stories.filter(s => s.language === language);
    if (region && region !== 'all') stories = stories.filter(s => s.region === region);
    if (status && status !== 'all') {
      if (status === 'approved') stories = stories.filter(s => s.moderationStatus === 'approved' || s.isModerated);
      else stories = stories.filter(s => s.moderationStatus === status);
    }
    if (search) {
      const q = search.toLowerCase();
      stories = stories.filter(s =>
        s.title.toLowerCase().includes(q) ||
        (s.authorName && s.authorName.toLowerCase().includes(q)) ||
        (s.tags && s.tags.some(t => t.toLowerCase().includes(q)))
      );
    }
    stories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      stories: stories.slice((pageNum - 1) * limitNum, pageNum * limitNum),
      total: stories.length,
      page: pageNum,
      limit: limitNum
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/stories/:id - Story details
router.get('/stories/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    let story;

    if (isMongoMode()) {
      story = await getStoryModel().findById(id);
    } else {
      story = getStore().stories.find(s => s._id === id);
    }

    if (!story) return res.status(404).json({ error: 'Story not found' });
    res.json(story);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/stories/:id/moderate - Moderate story (approve, reject, flag, pending) & save editorial review
router.put('/stories/:id/moderate', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, feedback, improvementSuggestions, rejectionReason } = req.body;

    if (!['approved', 'rejected', 'flagged', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid moderation status' });
    }

    const reviewRecord = {
      adminId: req.user.id,
      adminName: req.user.name || 'Administrator',
      action: status,
      feedback: (feedback || '').trim(),
      improvementSuggestions: (improvementSuggestions || '').trim(),
      rejectionReason: (status === 'rejected' ? (rejectionReason || reason || '').trim() : ''),
      createdAt: new Date()
    };

    let updatedStory;
    if (isMongoMode()) {
      const story = await getStoryModel().findById(id);
      if (!story) return res.status(404).json({ error: 'Story not found' });
      story.moderationStatus = status;
      story.isModerated = (status === 'approved');
      story.moderationReason = reason || rejectionReason || feedback || null;

      if (feedback !== undefined) story.adminFeedback = (feedback || '').trim();
      if (improvementSuggestions !== undefined) story.improvementSuggestions = (improvementSuggestions || '').trim();
      if (status === 'rejected') {
        story.rejectionReason = (rejectionReason || reason || story.rejectionReason || 'Submission does not meet archive criteria').trim();
      }

      story.adminReviews = story.adminReviews || [];
      story.adminReviews.unshift(reviewRecord);

      story.moderatedBy = req.user.id;
      story.moderatedAt = new Date();
      await story.save();
      updatedStory = story;
    } else {
      const story = getStore().stories.find(s => s._id === id);
      if (!story) return res.status(404).json({ error: 'Story not found' });
      story.moderationStatus = status;
      story.isModerated = (status === 'approved');
      story.moderationReason = reason || rejectionReason || feedback || null;

      if (feedback !== undefined) story.adminFeedback = (feedback || '').trim();
      if (improvementSuggestions !== undefined) story.improvementSuggestions = (improvementSuggestions || '').trim();
      if (status === 'rejected') {
        story.rejectionReason = (rejectionReason || reason || story.rejectionReason || 'Submission does not meet archive criteria').trim();
      }

      story.adminReviews = story.adminReviews || [];
      story.adminReviews.unshift(reviewRecord);

      story.moderatedBy = req.user.id;
      story.moderatedAt = new Date();
      updatedStory = story;
    }

    await logAdminAction({
      admin: req.user,
      action: `STORY_${status.toUpperCase()}`,
      targetType: 'Story',
      targetId: id,
      targetTitle: updatedStory.title,
      details: {
        status,
        reason: reason || rejectionReason || 'N/A',
        feedback: feedback || 'N/A',
        improvementSuggestions: improvementSuggestions || 'N/A',
        globalPublish: status === 'approved'
      },
      req
    });

    if (status === 'approved') {
      await notifyStoryApproved(updatedStory, req.user, feedback, req.io);
    } else if (status === 'rejected') {
      await notifyStoryRejected(updatedStory, req.user, rejectionReason || reason, feedback, improvementSuggestions, req.io);
    } else if (feedback || improvementSuggestions) {
      await notifyStoryFeedback(updatedStory, req.user, feedback, improvementSuggestions, req.io);
    }

    const actionMessage = status === 'approved'
      ? 'Story approved and published globally!'
      : status === 'rejected'
      ? 'Story rejected with feedback recorded'
      : `Story review updated (${status})`;

    res.json({ message: actionMessage, story: updatedStory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/stories/:id - Edit story content / metadata
router.put('/stories/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, language, region, tags, authenticity } = req.body;

    let updatedStory;
    if (isMongoMode()) {
      const story = await getStoryModel().findById(id);
      if (!story) return res.status(404).json({ error: 'Story not found' });
      if (title !== undefined) story.title = title;
      if (content !== undefined) story.content = content;
      if (language !== undefined) story.language = language;
      if (region !== undefined) story.region = region;
      if (tags !== undefined) story.tags = tags;
      if (authenticity !== undefined) story.authenticity = authenticity;
      story.moderatedBy = req.user.id;
      story.moderatedAt = new Date();
      await story.save();
      updatedStory = story;
    } else {
      const story = getStore().stories.find(s => s._id === id);
      if (!story) return res.status(404).json({ error: 'Story not found' });
      if (title !== undefined) story.title = title;
      if (content !== undefined) story.content = content;
      if (language !== undefined) story.language = language;
      if (region !== undefined) story.region = region;
      if (tags !== undefined) story.tags = tags;
      if (authenticity !== undefined) story.authenticity = authenticity;
      story.moderatedBy = req.user.id;
      story.moderatedAt = new Date();
      story.updatedAt = new Date();
      updatedStory = story;
    }

    await logAdminAction({
      admin: req.user,
      action: 'STORY_EDITED',
      targetType: 'Story',
      targetId: id,
      targetTitle: updatedStory.title,
      details: { fieldsUpdated: Object.keys(req.body) },
      req
    });

    res.json({ message: 'Story updated successfully', story: updatedStory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/stories/:id - Remove / Soft-delete story
router.delete('/stories/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false, reason = 'Removed by administrator' } = req.body;

    let storyTitle = 'Story';

    if (isMongoMode()) {
      const story = await getStoryModel().findById(id);
      if (!story) return res.status(404).json({ error: 'Story not found' });
      storyTitle = story.title;

      if (permanent === 'true' || permanent === true) {
        await getStoryModel().findByIdAndDelete(id);
      } else {
        story.isDeleted = true;
        story.deletedAt = new Date();
        story.moderationReason = reason;
        await story.save();
      }
    } else {
      const store = getStore();
      const idx = store.stories.findIndex(s => s._id === id);
      if (idx === -1) return res.status(404).json({ error: 'Story not found' });
      storyTitle = store.stories[idx].title;

      if (permanent === 'true' || permanent === true) {
        store.stories.splice(idx, 1);
      } else {
        store.stories[idx].isDeleted = true;
        store.stories[idx].deletedAt = new Date();
        store.stories[idx].moderationReason = reason;
      }
    }

    await logAdminAction({
      admin: req.user,
      action: permanent ? 'STORY_PERMANENTLY_DELETED' : 'STORY_REMOVED',
      targetType: 'Story',
      targetId: id,
      targetTitle: storyTitle,
      details: { reason, isPermanent: permanent },
      req
    });

    res.json({ message: 'Story removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 5. ADMIN ACCOUNT MANAGEMENT
// ─────────────────────────────────────────────────────────────

// GET /api/admin/admins - List all active administrators
router.get('/admins', adminMiddleware, async (_req, res) => {
  try {
    if (isMongoMode()) {
      const admins = await getUserModel()
        .find({ role: 'admin', isDeleted: { $ne: true } })
        .select('-password')
        .sort({ createdAt: -1 });
      return res.json(admins);
    }
    const admins = getStore().users
      .filter(u => u.role === 'admin' && !u.isDeleted)
      .map(safeUser)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/admins - Create a new administrator account (Authorized admins only)
router.post('/admins', adminMiddleware, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const hash = await bcrypt.hash(password, 10);

    if (isMongoMode()) {
      const User = getUserModel();
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        if (!existing.isDeleted && existing.role === 'admin') {
          return res.status(409).json({ error: 'Administrator with this email already exists' });
        }
        // Promote existing user account to admin
        existing.role = 'admin';
        existing.status = 'active';
        existing.isDeleted = false;
        existing.password = hash;
        existing.name = name.trim();
        await existing.save();

        await logAdminAction({
          admin: req.user,
          action: 'ADMIN_PROMOTED',
          targetType: 'Admin',
          targetId: existing._id,
          targetTitle: existing.name,
          details: { email: cleanEmail },
          req
        });
        return res.status(201).json({ message: 'User upgraded to Administrator', admin: safeUser(existing) });
      }

      const newAdmin = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password: hash,
        role: 'admin',
        status: 'active',
        isDeleted: false,
        karma: 999,
        badges: ['Cultural Guardian']
      });

      await logAdminAction({
        admin: req.user,
        action: 'ADMIN_CREATED',
        targetType: 'Admin',
        targetId: newAdmin._id,
        targetTitle: newAdmin.name,
        details: { email: cleanEmail },
        req
      });

      return res.status(201).json({ message: 'Administrator created successfully', admin: safeUser(newAdmin) });
    }

    // In-memory mode
    const store = getStore();
    const existing = store.users.find(u => u.email === cleanEmail);
    if (existing) {
      if (!existing.isDeleted && existing.role === 'admin') {
        return res.status(409).json({ error: 'Administrator with this email already exists' });
      }
      existing.role = 'admin';
      existing.status = 'active';
      existing.isDeleted = false;
      existing.password = hash;
      existing.name = name.trim();

      await logAdminAction({
        admin: req.user,
        action: 'ADMIN_PROMOTED',
        targetType: 'Admin',
        targetId: existing._id,
        targetTitle: existing.name,
        details: { email: cleanEmail },
        req
      });
      return res.status(201).json({ message: 'User upgraded to Administrator', admin: safeUser(existing) });
    }

    const newAdmin = {
      _id: uuidv4(),
      name: name.trim(),
      email: cleanEmail,
      password: hash,
      role: 'admin',
      status: 'active',
      isDeleted: false,
      karma: 999,
      badges: ['Cultural Guardian'],
      createdAt: new Date()
    };
    store.users.push(newAdmin);

    await logAdminAction({
      admin: req.user,
      action: 'ADMIN_CREATED',
      targetType: 'Admin',
      targetId: newAdmin._id,
      targetTitle: newAdmin.name,
      details: { email: cleanEmail },
      req
    });

    res.status(201).json({ message: 'Administrator created successfully', admin: safeUser(newAdmin) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/admins/:id/demote - Demote administrator to regular user
router.put('/admins/:id/demote', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { newRole = 'user', reason = 'Administrative role adjustment' } = req.body;

    const activeAdmins = await countActiveAdmins();
    if (activeAdmins <= 1) {
      return res.status(400).json({ error: 'Cannot demote the last remaining active administrator.' });
    }

    let demotedUser;
    if (isMongoMode()) {
      const user = await getUserModel().findById(id);
      if (!user) return res.status(404).json({ error: 'Admin user not found' });
      if (user.role !== 'admin') return res.status(400).json({ error: 'Target user is not an administrator' });

      user.role = newRole;
      await user.save();
      demotedUser = safeUser(user);
    } else {
      const user = getStore().users.find(u => u._id === id);
      if (!user) return res.status(404).json({ error: 'Admin user not found' });
      if (user.role !== 'admin') return res.status(400).json({ error: 'Target user is not an administrator' });

      user.role = newRole;
      demotedUser = safeUser(user);
    }

    await logAdminAction({
      admin: req.user,
      action: 'ADMIN_DEMOTED',
      targetType: 'Admin',
      targetId: id,
      targetTitle: demotedUser.name,
      details: { newRole, reason },
      req
    });

    res.json({ message: `Administrator demoted to ${newRole}`, user: demotedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 6. ADMINISTRATIVE AUDIT & ACTIVITY LOGS
// ─────────────────────────────────────────────────────────────

// GET /api/admin/logs - Paginated and searchable audit logs
router.get('/logs', adminMiddleware, async (req, res) => {
  try {
    const { search, action, targetType, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));

    if (isMongoMode()) {
      const AuditLog = getAuditLogModel();
      const query = {};
      if (action && action !== 'all') query.action = action;
      if (targetType && targetType !== 'all') query.targetType = targetType;
      if (search) {
        query.$or = [
          { adminName: { $regex: search, $options: 'i' } },
          { adminEmail: { $regex: search, $options: 'i' } },
          { action: { $regex: search, $options: 'i' } },
          { targetTitle: { $regex: search, $options: 'i' } }
        ];
      }

      const total = await AuditLog.countDocuments(query);
      const logs = await AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      return res.json({ logs, total, page: pageNum, limit: limitNum });
    }

    let logs = getStore().auditLogs || [];
    if (action && action !== 'all') logs = logs.filter(l => l.action === action);
    if (targetType && targetType !== 'all') logs = logs.filter(l => l.targetType === targetType);
    if (search) {
      const q = search.toLowerCase();
      logs = logs.filter(l =>
        l.adminName.toLowerCase().includes(q) ||
        l.adminEmail.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        (l.targetTitle && l.targetTitle.toLowerCase().includes(q))
      );
    }
    logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      logs: logs.slice((pageNum - 1) * limitNum, pageNum * limitNum),
      total: logs.length,
      page: pageNum,
      limit: limitNum
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
