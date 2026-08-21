const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:              { type: String, required: true, trim: true },
  email:             { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:          { type: String, required: true },
  language:          { type: String, default: 'English' },
  region:            { type: String, default: 'Pan India' },
  storyPreferences:  [{ type: String }],
  narrationMode:     { type: String, default: 'voice' },
  karma:             { type: Number, default: 0 },
  badges:            [{ type: String }],
  theme:             { type: String, default: 'light' },
  fontSize:          { type: Number, default: 16 },
  notifications:     { type: Boolean, default: true },
  highContrast:      { type: Boolean, default: false },
  subtitles:         { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
