const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient:     { type: mongoose.Schema.Types.Mixed, default: null }, // User ID or null for role-based broadcast
  recipientRole: { type: String, enum: ['user', 'admin', 'all'], default: 'user' },
  title:         { type: String, required: true },
  message:       { type: String, required: true },
  type:          {
    type: String,
    enum: [
      'story_submitted',
      'story_approved',
      'story_rejected',
      'story_feedback',
      'story_voted',
      'story_reviewed',
      'regional_story',
      'account_suspended',
      'account_restored',
      'account_restricted',
      'admin_new_story',
      'admin_moderation',
      'system'
    ],
    default: 'system'
  },
  link:          { type: String, default: null },
  metadata:      { type: mongoose.Schema.Types.Mixed, default: {} },
  isRead:        { type: Boolean, default: false },
  readAt:        { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
