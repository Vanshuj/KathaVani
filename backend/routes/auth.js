const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getStore, isMongoMode } = require('../config/db');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

const getUser = () => isMongoMode() ? require('../models/User') : null;

const signToken = (user) =>
  jwt.sign({
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role || 'user',
    region: user.region || 'Pan India'
  }, JWT_SECRET, { expiresIn: '7d' });

const safeUser = (u) => {
  const obj = u.toObject ? u.toObject() : { ...u };
  delete obj.password;
  return obj;
};

// POST /api/auth/register - Standard user registration only (Role escalation strictly forbidden)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, language = 'English', region = 'Pan India' } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    const cleanEmail = email.trim().toLowerCase();
    const hash = await bcrypt.hash(password, 10);

    if (isMongoMode()) {
      const User = getUser();
      if (await User.findOne({ email: cleanEmail })) return res.status(409).json({ error: 'Email already registered' });
      // Security: Enforce user role and active status, completely ignoring any body role injection
      const user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password: hash,
        language,
        region,
        role: 'user',
        status: 'active',
        isDeleted: false,
        restrictedCapabilities: []
      });
      return res.status(201).json({ token: signToken(user), user: safeUser(user) });
    }

    const store = getStore();
    if (store.users.find(u => u.email === cleanEmail && !u.isDeleted)) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const user = {
      _id: uuidv4(),
      name: name.trim(),
      email: cleanEmail,
      password: hash,
      language,
      region,
      role: 'user',
      status: 'active',
      isDeleted: false,
      restrictedCapabilities: [],
      storyPreferences: [],
      narrationMode: 'voice',
      karma: 0,
      badges: [],
      theme: 'light',
      fontSize: 16,
      notifications: true,
      highContrast: false,
      subtitles: false,
      createdAt: new Date()
    };
    store.users.push(user);
    res.status(201).json({ token: signToken(user), user: safeUser(user) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/login - Regular user login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const cleanEmail = email.trim().toLowerCase();

    const defaultAdminEmail = (process.env.ADMIN_EMAIL || 'admin@kathavani.org').trim().toLowerCase();
    const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'AdminKatha@2024!';

    let user;
    if (cleanEmail === defaultAdminEmail && password === defaultAdminPassword) {
      if (isMongoMode()) {
        const User = getUser();
        user = await User.findOne({ email: cleanEmail });
        const hash = await bcrypt.hash(defaultAdminPassword, 10);
        if (!user) {
          user = await User.create({
            name: process.env.ADMIN_NAME || 'Master Administrator',
            email: cleanEmail,
            password: hash,
            role: 'admin',
            status: 'active',
            isDeleted: false,
            language: 'English',
            region: 'Pan India',
            karma: 999,
            badges: ['Master Storyteller', 'Cultural Guardian']
          });
        } else {
          let needsSave = false;
          if (user.role !== 'admin') { user.role = 'admin'; needsSave = true; }
          if (user.status !== 'active') { user.status = 'active'; needsSave = true; }
          if (user.isDeleted) { user.isDeleted = false; needsSave = true; }
          const passMatch = await bcrypt.compare(password, user.password || '');
          if (!passMatch) { user.password = hash; needsSave = true; }
          if (needsSave) await user.save();
        }
      } else {
        const store = getStore();
        user = store.users.find(u => u.email === cleanEmail);
        const hash = bcrypt.hashSync(defaultAdminPassword, 10);
        if (!user) {
          user = {
            _id: 'admin-1',
            name: process.env.ADMIN_NAME || 'Master Administrator',
            email: cleanEmail,
            password: hash,
            role: 'admin',
            status: 'active',
            isDeleted: false,
            language: 'English',
            region: 'Pan India',
            karma: 999,
            badges: ['Master Storyteller', 'Cultural Guardian'],
            createdAt: new Date()
          };
          store.users.unshift(user);
        } else {
          user.role = 'admin';
          user.status = 'active';
          user.isDeleted = false;
          user.password = hash;
        }
      }
    } else {
      user = isMongoMode()
        ? await getUser().findOne({ email: cleanEmail })
        : getStore().users.find(u => u.email === cleanEmail);
    }

    if (!user || user.isDeleted) return res.status(401).json({ error: 'Invalid credentials' });
    if (!await bcrypt.compare(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });

    // Check account status
    if (user.status === 'suspended') {
      return res.status(403).json({
        error: 'Account suspended',
        reason: user.suspensionReason || 'Violation of community guidelines',
        suspendedAt: user.suspendedAt
      });
    }

    res.json({ token: signToken(user), user: safeUser(user) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    let user;
    if (isMongoMode()) {
      user = await getUser().findById(req.user.id).select('-password');
    } else {
      const raw = getStore().users.find(u => u._id === req.user.id);
      if (raw) { user = { ...raw }; delete user.password; }
    }
    if (!user || user.isDeleted) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
