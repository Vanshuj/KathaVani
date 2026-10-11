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
  isModerated:      { type: Boolean, default: false },
  moderationStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'flagged'], default: 'pending' },
  moderationReason: { type: String, default: null },
  adminFeedback:           { type: String, default: '' },
  improvementSuggestions:  { type: String, default: '' },
  rejectionReason:         { type: String, default: '' },
  adminReviews: [{
    adminId:                { type: mongoose.Schema.Types.Mixed },
    adminName:              { type: String, default: 'Administrator' },
    action:                 { type: String, enum: ['approved', 'rejected', 'flagged', 'pending', 'review_saved'], default: 'pending' },
    feedback:               { type: String, default: '' },
    improvementSuggestions: { type: String, default: '' },
    rejectionReason:        { type: String, default: '' },
    createdAt:              { type: Date, default: Date.now }
  }],
  moderatedBy:      { type: mongoose.Schema.Types.Mixed, default: null },
  moderatedAt:      { type: Date, default: null },
  isDeleted:        { type: Boolean, default: false },
  deletedAt:        { type: Date, default: null },
  nodeGraph:        [{ type: mongoose.Schema.Types.Mixed }],
  rating:           { type: Number, default: 0 },
  ratingCount:      { type: Number, default: 0 },
  reviews: [{
    _id:            { type: String, required: true },
    userId:         { type: mongoose.Schema.Types.Mixed, required: true },
    userName:       { type: String, required: true },
    rating:         { type: Number, required: true, min: 1, max: 5 },
    comment:        { type: String, default: '' },
    createdAt:      { type: Date, default: Date.now },
    updatedAt:      { type: Date, default: Date.now }
  }],
}, { timestamps: true });

module.exports = mongoose.model('Story', storySchema);
