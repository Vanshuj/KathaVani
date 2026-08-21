const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getStore, isMongoMode } = require('../config/db');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

const getUser = () => isMongoMode() ? require('../models/User') : null;

const signToken = (user) =>
  jwt.sign({ id: user._id.toString(), email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

const safeUser = (u) => {
  const obj = u.toObject ? u.toObject() : { ...u };
  delete obj.password;
  return obj;
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, language = 'English', region = 'Pan India' } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    const hash = await bcrypt.hash(password, 10);

    if (isMongoMode()) {
      const User = getUser();
      if (await User.findOne({ email })) return res.status(409).json({ error: 'Email already registered' });
      const user = await User.create({ name, email, password: hash, language, region });
      return res.status(201).json({ token: signToken(user), user: safeUser(user) });
    }

    const store = getStore();
    if (store.users.find(u => u.email === email)) return res.status(409).json({ error: 'Email already registered' });
    const user = { _id: uuidv4(), name, email, password: hash, language, region, storyPreferences: [], narrationMode: 'voice', karma: 0, badges: [], theme: 'light', fontSize: 16, notifications: true, highContrast: false, subtitles: false, createdAt: new Date() };
    store.users.push(user);
    res.status(201).json({ token: signToken(user), user: safeUser(user) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = isMongoMode()
      ? await getUser().findOne({ email })
      : getStore().users.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!await bcrypt.compare(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
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
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
