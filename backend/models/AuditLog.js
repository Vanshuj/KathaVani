const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  adminId:     { type: mongoose.Schema.Types.Mixed, required: true },
  adminName:   { type: String, required: true },
  adminEmail:  { type: String, required: true },
  action:      { type: String, required: true },
  targetType:  { type: String, required: true }, // 'User', 'Story', 'Admin', 'System'
  targetId:    { type: mongoose.Schema.Types.Mixed, default: null },
  targetTitle: { type: String, default: null },
  details:     { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress:   { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
