const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  content:      { type: String, default: '' },
  author:       { type: mongoose.Schema.Types.Mixed },   // ObjectId or string id
  authorName:   { type: String },
  language:     { type: String, default: 'English' },
  region:       { type: String, default: 'Pan India' },
  tags:         [{ type: String }],
  authenticity: { type: Number, default: 70 },
  votes:        { type: Number, default: 0 },
  voterIds:     [{ type: mongoose.Schema.Types.Mixed }],
  karma:        { type: Number, default: 0 },
  lat:          { type: Number, default: null },
  lng:          { type: Number, default: null },
  audioUrl:     { type: String, default: null },
  videoUrl:     { type: String, default: null },
  isModerated:  { type: Boolean, default: false },
  nodeGraph:    [{ type: mongoose.Schema.Types.Mixed }],
}, { timestamps: true });

module.exports = mongoose.model('Story', storySchema);
