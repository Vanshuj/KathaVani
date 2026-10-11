const jwt = require('jsonwebtoken');
const { getStore, isMongoMode } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'kathavani-secret-2024';
const getUserModel = () => isMongoMode() ? require('../models/User') : null;

// Base authentication middleware: verifies token, loads user & checks active status
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Server-side verification of user existence and status
    let user;
    if (isMongoMode()) {
      user = await getUserModel().findById(decoded.id).select('-password');
    } else {
      user = getStore().users.find(u => u._id === decoded.id);
    }

    if (!user || user.isDeleted) {
      return res.status(401).json({ error: 'User account no longer exists' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        error: 'Account suspended',
        reason: user.suspensionReason || 'Violation of community guidelines',
        suspendedAt: user.suspendedAt
      });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role || 'user',
      region: user.region || 'Pan India',
      status: user.status || 'active',
      restrictedCapabilities: user.restrictedCapabilities || []
    };
    req.fullUser = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Strict Admin authorization middleware
const adminMiddleware = async (req, res, next) => {
  // Always run authMiddleware check first
  await authMiddleware(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Administrator privileges required' });
    }
    next();
  });
};

// Reviewer or Admin authorization middleware
const reviewerOrAdminMiddleware = async (req, res, next) => {
  await authMiddleware(req, res, () => {
    if (req.user.role !== 'admin' && req.user.role !== 'reviewer') {
      return res.status(403).json({ error: 'Access denied: Reviewer or Administrator privileges required' });
    }
    next();
  });
};

// Optional auth for public routes (e.g. browsing stories)
const optionalAuth = async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role || 'user',
        region: decoded.region || 'Pan India'
      };

      if (!decoded.region && decoded.id) {
        if (isMongoMode()) {
          const u = await getUserModel().findById(decoded.id).select('region role');
          if (u) {
            req.user.region = u.region || 'Pan India';
            req.user.role = u.role || req.user.role;
          }
        } else {
          const u = getStore().users.find(x => x._id === decoded.id);
          if (u) {
            req.user.region = u.region || 'Pan India';
            req.user.role = u.role || req.user.role;
          }
        }
      }
    } catch {}
  }
  next();
};

// Helper middleware to check if user has a specific restriction
const requireCapability = (capability) => (req, res, next) => {
  if (req.user && req.user.status === 'restricted' && req.user.restrictedCapabilities?.includes(capability)) {
    return res.status(403).json({
      error: `Capability restricted: You are not permitted to perform '${capability}'.`,
      capability
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  reviewerOrAdminMiddleware,
  optionalAuth,
  requireCapability,
  JWT_SECRET
};
