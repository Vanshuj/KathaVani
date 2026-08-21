const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const { getStore, isMongoMode } = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const getUser = () => isMongoMode() ? require('../models/User') : null;

const awardBadges = (karma, badges) => {
  const earned = [...badges];
  if (karma >= 100 && !earned.includes('Story Seed'))        earned.push('Story Seed');
  if (karma >= 300 && !earned.includes('Myth Keeper'))       earned.push('Myth Keeper');
  if (karma >= 500 && !earned.includes('Cultural Guardian')) earned.push('Cultural Guardian');
  return earned;
};

// GET /api/users/profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    if (isMongoMode()) {
      const user = await getUser().findById(req.user.id).select('-password');
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json(user);
    }
    const raw = getStore().users.find(u => u._id === req.user.id);
    if (!raw) return res.status(404).json({ error: 'User not found' });
    const { password: _, ...safe } = raw;
    res.json(safe);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/users/preferences
router.put('/preferences', authMiddleware, async (req, res) => {
  try {
    const allowed = ['name','language','region','storyPreferences','narrationMode','theme','fontSize','notifications','highContrast','subtitles'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    if (isMongoMode()) {
      const user = await getUser().findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json(user);
    }
    const user = getStore().users.find(u => u._id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    Object.assign(user, updates);
    const { password: _, ...safe } = user;
    res.json(safe);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/users/karma
router.put('/karma', authMiddleware, async (req, res) => {
  try {
    const { points = 5 } = req.body;
    if (isMongoMode()) {
      const user = await getUser().findById(req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      user.karma  = (user.karma || 0) + points;
      user.badges = awardBadges(user.karma, user.badges);
      await user.save();
      return res.json({ karma: user.karma, badges: user.badges });
    }
    const user = getStore().users.find(u => u._id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.karma  = (user.karma || 0) + points;
    user.badges = awardBadges(user.karma, user.badges);
    res.json({ karma: user.karma, badges: user.badges });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/users/quiz
router.post('/quiz', authMiddleware, async (req, res) => {
  try {
    const { score = 0, total = 5 } = req.body;
    const points = Math.round((score / total) * 20);
    if (isMongoMode()) {
      const user = await getUser().findById(req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      user.karma  = (user.karma || 0) + points;
      user.badges = awardBadges(user.karma, user.badges);
      if (score === total && !user.badges.includes('Quiz Champion')) user.badges.push('Quiz Champion');
      await user.save();
      return res.json({ pointsEarned: points, karma: user.karma, badges: user.badges });
    }
    const user = getStore().users.find(u => u._id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.karma  = (user.karma || 0) + points;
    user.badges = awardBadges(user.karma, user.badges);
    if (score === total && !user.badges.includes('Quiz Champion')) user.badges.push('Quiz Champion');
    res.json({ pointsEarned: points, karma: user.karma, badges: user.badges });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/users/password
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' });
    if (isMongoMode()) {
      const user = await getUser().findById(req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      if (!await bcrypt.compare(currentPassword, user.password)) return res.status(401).json({ error: 'Current password incorrect' });
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      return res.json({ message: 'Password updated' });
    }
    const user = getStore().users.find(u => u._id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!await bcrypt.compare(currentPassword, user.password)) return res.status(401).json({ error: 'Current password incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    res.json({ message: 'Password updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/users/account
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    if (isMongoMode()) {
      await getUser().findByIdAndDelete(req.user.id);
      return res.json({ message: 'Account deleted' });
    }
    const store = getStore();
    const idx   = store.users.findIndex(u => u._id === req.user.id);
    if (idx !== -1) store.users.splice(idx, 1);
    res.json({ message: 'Account deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/users/leaderboard
router.get('/leaderboard', async (_req, res) => {
  try {
    if (isMongoMode()) {
      const users = await getUser().find().select('name karma badges region').sort({ karma: -1 }).limit(10);
      return res.json(users);
    }
    const leaders = getStore().users
      .map(u => ({ name: u.name, karma: u.karma, badges: u.badges, region: u.region }))
      .sort((a, b) => b.karma - a.karma).slice(0, 10);
    res.json(leaders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
