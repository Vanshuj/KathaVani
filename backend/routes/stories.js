const express = require('express');
const router  = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getStore, isMongoMode } = require('../config/db');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const {
  notifyStorySubmitted,
  notifyStoryVoted,
  notifyStoryReviewed
} = require('../utils/notificationService');

const getStory = () => isMongoMode() ? require('../models/Story') : null;
const getUser  = () => isMongoMode() ? require('../models/User')  : null;

const HISTORICAL_KW = ['chola','mughal','maurya','gupta','maratha','vijayanagara','british raj','partition','gandhi','rajput','vedic','harappan','pala','ashoka','akbar'];
const computeAuth = (content, tags) => {
  const text = (content + ' ' + (tags || []).join(' ')).toLowerCase();
  let score  = Math.floor(Math.random() * 20) + 60;
  HISTORICAL_KW.forEach(kw => { if (text.includes(kw)) score = Math.min(99, score + 3); });
  return score;
};

// Cultural region matching helper
const regionsMatch = (storyRegion, userRegion) => {
  if (!storyRegion || !userRegion) return false;
  const s = storyRegion.trim().toLowerCase();
  const u = userRegion.trim().toLowerCase();
  if (s === 'pan india' || u === 'pan india' || s === 'all' || u === 'all') return true;
  if (s === u) return true;
  return s.includes(u) || u.includes(s);
};

// Story visibility permission check:
// - Approved stories are globally accessible to everyone (authenticated & unauthenticated)
// - Pending stories are visible only to the story author, admins, or users in the story's region
// - Rejected stories are visible only to the author and admins
const canUserAccessStory = (story, user) => {
  const isApproved = story.moderationStatus === 'approved' || story.isModerated;
  if (isApproved) return true;
  if (!user) return false;
  if (user.role === 'admin') return true;

  const isAuthor = (
    (story.author && story.author.toString() === user.id.toString()) ||
    (story.authorName && user.name && story.authorName.toLowerCase() === user.name.toLowerCase())
  );
  if (isAuthor) return true;

  if (story.moderationStatus === 'pending' || story.moderationStatus === 'flagged') {
    return regionsMatch(story.region, user.region);
  }

  return false;
};

// GET /api/stories
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { tag, language, region, search, author, likedBy, page = 1, limit = 20 } = req.query;

    if (isMongoMode()) {
      const Story = getStory();
      const query = { isDeleted: { $ne: true } };
      if (tag)      query.tags     = tag;
      if (language) query.language = language;
      if (region)   query.region   = region;
      if (search)   query.$or = [{ title: { $regex: search, $options: 'i' } }, { content: { $regex: search, $options: 'i' } }];
      if (author)   query.$or = [{ author: author }, { authorName: author }];
      if (likedBy)  query.voterIds = likedBy;

      // Visibility enforcement:
      if (!req.user) {
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { moderationStatus: 'approved' },
            { isModerated: true, moderationStatus: { $ne: 'rejected' } }
          ]
        });
      } else if (req.user.role !== 'admin') {
        const userRegion = (req.user.region || 'Pan India').trim();
        const isPanIndia = userRegion.toLowerCase() === 'pan india';
        const orConditions = [
          { moderationStatus: 'approved' },
          { isModerated: true, moderationStatus: { $ne: 'rejected' } },
          { author: req.user.id },
          { authorName: req.user.name }
        ];

        if (isPanIndia) {
          orConditions.push({ moderationStatus: { $in: ['pending', 'flagged'] } });
        } else {
          const escaped = userRegion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          orConditions.push({
            moderationStatus: { $in: ['pending', 'flagged'] },
            region: { $regex: new RegExp(escaped, 'i') }
          });
          orConditions.push({
            moderationStatus: { $in: ['pending', 'flagged'] },
            region: 'Pan India'
          });
        }

        query.$and = query.$and || [];
        query.$and.push({ $or: orConditions });
      }

      const total   = await Story.countDocuments(query);
      const stories = await Story.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
      return res.json({ stories, total, page: Number(page), limit: Number(limit) });
    }

    let stories = getStore().stories.filter(s => !s.isDeleted && canUserAccessStory(s, req.user));
    if (tag)      stories = stories.filter(s => s.tags.includes(tag));
    if (language) stories = stories.filter(s => s.language === language);
    if (region)   stories = stories.filter(s => s.region === region);
    if (search)   { const q = search.toLowerCase(); stories = stories.filter(s => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)); }
    if (author)   stories = stories.filter(s => (s.author && s.author.toString() === author.toString()) || (s.authorName && s.authorName.toLowerCase() === author.toLowerCase()));
    if (likedBy)  stories = stories.filter(s => s.voterIds && (s.voterIds.includes(likedBy) || s.voterIds.map(v => (v._id || v).toString()).includes(likedBy.toString())));
    stories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ stories: stories.slice((page - 1) * limit, page * limit), total: stories.length, page: Number(page), limit: Number(limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/stories/geo/map: must be BEFORE /:id
router.get('/geo/map', optionalAuth, async (req, res) => {
  try {
    if (isMongoMode()) {
      const query = { lat: { $ne: null }, lng: { $ne: null }, isDeleted: { $ne: true } };
      if (!req.user) {
        query.$and = [{ $or: [{ moderationStatus: 'approved' }, { isModerated: true, moderationStatus: { $ne: 'rejected' } }] }];
      } else if (req.user.role !== 'admin') {
        const userRegion = (req.user.region || 'Pan India').trim();
        const isPanIndia = userRegion.toLowerCase() === 'pan india';
        const orConditions = [
          { moderationStatus: 'approved' },
          { isModerated: true, moderationStatus: { $ne: 'rejected' } },
          { author: req.user.id },
          { authorName: req.user.name }
        ];
        if (isPanIndia) {
          orConditions.push({ moderationStatus: { $in: ['pending', 'flagged'] } });
        } else {
          const escaped = userRegion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          orConditions.push({ moderationStatus: { $in: ['pending', 'flagged'] }, region: { $regex: new RegExp(escaped, 'i') } });
          orConditions.push({ moderationStatus: { $in: ['pending', 'flagged'] }, region: 'Pan India' });
        }
        query.$and = [{ $or: orConditions }];
      }
      const stories = await getStory().find(query).select('title lat lng region tags votes moderationStatus');
      return res.json(stories);
    }
    const stories = getStore().stories
      .filter(s => s.lat && s.lng && !s.isDeleted && canUserAccessStory(s, req.user))
      .map(s => ({ _id: s._id, title: s.title, lat: s.lat, lng: s.lng, region: s.region, tags: s.tags, votes: s.votes, moderationStatus: s.moderationStatus }));
    res.json(stories);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/stories/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    let story;
    if (isMongoMode()) {
      story = await getStory().findById(req.params.id);
    } else {
      story = getStore().stories.find(s => s._id === req.params.id);
    }
    if (!story || story.isDeleted) return res.status(404).json({ error: 'Story not found' });

    if (!canUserAccessStory(story, req.user)) {
      return res.status(403).json({
        error: 'This story is currently pending administrative approval and is visible only to users belonging to its cultural region.',
        region: story.region || 'Regional',
        moderationStatus: story.moderationStatus || 'pending'
      });
    }

    res.json(story);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/stories
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user && req.user.status === 'restricted' && req.user.restrictedCapabilities?.includes('submit_story')) {
      return res.status(403).json({ error: 'Your account is restricted from submitting new stories.' });
    }

    const { title, content, language = 'English', region = 'Pan India', tags = [], lat, lng, audioUrl, videoUrl, nodeGraph = [] } = req.body;
    if (!title || (!content && !audioUrl && !videoUrl)) {
      return res.status(400).json({ error: 'Title and either content, audio, or video are required' });
    }
    const auth = computeAuth(content || '', tags);

    if (isMongoMode()) {
      const story = await getStory().create({
        title,
        content: content || '',
        language,
        region,
        tags,
        author: req.user.id,
        authorName: req.user.name,
        authenticity: auth,
        lat: lat || null,
        lng: lng || null,
        audioUrl: audioUrl || null,
        videoUrl: videoUrl || null,
        nodeGraph,
        voterIds: [],
        isModerated: false,
        moderationStatus: 'pending',
        adminFeedback: '',
        improvementSuggestions: '',
        rejectionReason: '',
        adminReviews: []
      });
      // award karma
      await getUser().findByIdAndUpdate(req.user.id, { $inc: { karma: 20 }, $addToSet: { badges: 'Elder Storyteller' } });
      await notifyStorySubmitted(story, req.user, req.io);
      return res.status(201).json(story);
    }

    const store = getStore();
    const story = {
      _id: uuidv4(),
      title,
      content: content || '',
      language,
      region,
      tags,
      author: req.user.id,
      authorName: req.user.name,
      authenticity: auth,
      votes: 0,
      voterIds: [],
      karma: 0,
      lat: lat || null,
      lng: lng || null,
      audioUrl: audioUrl || null,
      videoUrl: videoUrl || null,
      isModerated: false,
      moderationStatus: 'pending',
      adminFeedback: '',
      improvementSuggestions: '',
      rejectionReason: '',
      adminReviews: [],
      nodeGraph,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    store.stories.push(story);
    const user = store.users.find(u => u._id === req.user.id);
    if (user) { user.karma = (user.karma || 0) + 20; if (!user.badges.includes('Elder Storyteller')) user.badges.push('Elder Storyteller'); }
    await notifyStorySubmitted(story, req.user, req.io);
    res.status(201).json(story);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/stories/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user && req.user.status === 'restricted' && req.user.restrictedCapabilities?.includes('submit_story')) {
      return res.status(403).json({ error: 'Your account is restricted from updating stories.' });
    }

    const { title, content, language, region, tags, audioUrl, videoUrl, nodeGraph, lat, lng } = req.body;

    if (isMongoMode()) {
      const story = await getStory().findById(req.params.id);
      if (!story) return res.status(404).json({ error: 'Story not found' });

      const isAuthor = (
        (story.author?._id || story.author || '').toString() === req.user.id.toString() ||
        (req.user.name && story.authorName && req.user.name.toLowerCase() === story.authorName.toLowerCase())
      );
      if (!isAuthor && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'You are not authorized to edit this story' });
      }

      if (title !== undefined) story.title = title.trim();
      if (content !== undefined) story.content = content;
      if (language !== undefined) story.language = language;
      if (region !== undefined) story.region = region;
      if (tags !== undefined) story.tags = Array.isArray(tags) ? tags : [];
      if (audioUrl !== undefined) story.audioUrl = audioUrl;
      if (videoUrl !== undefined) story.videoUrl = videoUrl;
      if (nodeGraph !== undefined) story.nodeGraph = nodeGraph;
      if (lat !== undefined) story.lat = lat;
      if (lng !== undefined) story.lng = lng;

      if (content !== undefined || tags !== undefined) {
        story.authenticity = computeAuth(story.content || '', story.tags || []);
      }
      story.updatedAt = new Date();
      await story.save();
      return res.json(story);
    }

    const store = getStore();
    const idx   = store.stories.findIndex(s => s._id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Story not found' });

    const currentStory = store.stories[idx];
    const isAuthor = (
      (currentStory.author?._id || currentStory.author || '').toString() === req.user.id.toString() ||
      (req.user.name && currentStory.authorName && req.user.name.toLowerCase() === currentStory.authorName.toLowerCase())
    );
    if (!isAuthor && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to edit this story' });
    }

    const updated = { ...currentStory };
    if (title !== undefined) updated.title = title.trim();
    if (content !== undefined) updated.content = content;
    if (language !== undefined) updated.language = language;
    if (region !== undefined) updated.region = region;
    if (tags !== undefined) updated.tags = Array.isArray(tags) ? tags : [];
    if (audioUrl !== undefined) updated.audioUrl = audioUrl;
    if (videoUrl !== undefined) updated.videoUrl = videoUrl;
    if (nodeGraph !== undefined) updated.nodeGraph = nodeGraph;
    if (lat !== undefined) updated.lat = lat;
    if (lng !== undefined) updated.lng = lng;

    const finalContent = content !== undefined ? content : currentStory.content;
    const finalTags    = tags !== undefined ? tags : currentStory.tags;
    updated.authenticity = computeAuth(finalContent || '', finalTags || []);
    updated.updatedAt = new Date();

    store.stories[idx] = updated;
    res.json(store.stories[idx]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/stories/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (isMongoMode()) {
      const story = await getStory().findById(req.params.id);
      if (!story) return res.status(404).json({ error: 'Story not found' });
      if (story.author.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
      await story.deleteOne();
      return res.json({ message: 'Deleted' });
    }
    const store = getStore();
    const idx   = store.stories.findIndex(s => s._id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Story not found' });
    if (store.stories[idx].author !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    store.stories.splice(idx, 1);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/stories/:id/authenticity
router.get('/:id/authenticity', async (req, res) => {
  try {
    if (isMongoMode()) {
      const story = await getStory().findById(req.params.id).select('authenticity votes');
      if (!story) return res.status(404).json({ error: 'Story not found' });
      return res.json({ authenticity: story.authenticity, votes: story.votes });
    }
    const story = getStore().stories.find(s => s._id === req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });
    res.json({ authenticity: story.authenticity, votes: story.votes });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/stories/:id/vote
router.post('/:id/vote', authMiddleware, async (req, res) => {
  try {
    if (isMongoMode()) {
      const story = await getStory().findById(req.params.id);
      if (!story) return res.status(404).json({ error: 'Story not found' });
      const uid = req.user.id;
      if (story.voterIds.map(v => v.toString()).includes(uid)) return res.status(400).json({ error: 'Already voted' });
      story.votes      += 1;
      story.karma      += 5;
      story.authenticity = Math.min(99, story.authenticity + 1);
      story.voterIds.push(uid);
      await story.save();
      await getUser().findByIdAndUpdate(uid, { $inc: { karma: 5 } });
      if (req.io) req.io.emit('story-vote-update', { storyId: story._id, votes: story.votes });
      await notifyStoryVoted(story, req.user, req.io);
      return res.json({ votes: story.votes, authenticity: story.authenticity });
    }

    const store = getStore();
    const story = store.stories.find(s => s._id === req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });
    if (story.voterIds.includes(req.user.id)) return res.status(400).json({ error: 'Already voted' });
    story.votes += 1; story.karma += 5; story.authenticity = Math.min(99, story.authenticity + 1); story.voterIds.push(req.user.id);
    const voter = store.users.find(u => u._id === req.user.id);
    if (voter) voter.karma = (voter.karma || 0) + 5;
    if (req.io) req.io.emit('story-vote-update', { storyId: story._id, votes: story.votes });
    await notifyStoryVoted(story, req.user, req.io);
    res.json({ votes: story.votes, authenticity: story.authenticity });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/stories/:id/nodes
router.put('/:id/nodes', authMiddleware, async (req, res) => {
  try {
    if (isMongoMode()) {
      const story = await getStory().findByIdAndUpdate(req.params.id, { nodeGraph: req.body.nodeGraph || [] }, { new: true }).select('nodeGraph');
      if (!story) return res.status(404).json({ error: 'Story not found' });
      return res.json({ nodeGraph: story.nodeGraph });
    }
    const story = getStore().stories.find(s => s._id === req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });
    story.nodeGraph = req.body.nodeGraph || [];
    res.json({ nodeGraph: story.nodeGraph });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/stories/:id/reviews
router.get('/:id/reviews', optionalAuth, async (req, res) => {
  try {
    if (isMongoMode()) {
      const story = await getStory().findById(req.params.id).select('reviews rating ratingCount');
      if (!story) return res.status(404).json({ error: 'Story not found' });
      return res.json({
        rating: story.rating || 0,
        ratingCount: story.ratingCount || 0,
        reviews: story.reviews || []
      });
    }

    const story = getStore().stories.find(s => s._id === req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });
    res.json({
      rating: story.rating || 0,
      ratingCount: story.ratingCount || 0,
      reviews: story.reviews || []
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/stories/:id/reviews
router.post('/:id/reviews', authMiddleware, async (req, res) => {
  try {
    if (req.user && req.user.status === 'restricted' && req.user.restrictedCapabilities?.includes('comment')) {
      return res.status(403).json({ error: 'Your account is restricted from submitting reviews or comments.' });
    }

    const { rating, comment = '' } = req.body;
    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
    }

    const userId = req.user.id;
    const userName = req.user.name || 'Anonymous Storyteller';

    if (isMongoMode()) {
      const story = await getStory().findById(req.params.id);
      if (!story) return res.status(404).json({ error: 'Story not found' });

      story.reviews = story.reviews || [];
      const existingIdx = story.reviews.findIndex(r => (r.userId?._id || r.userId || '').toString() === userId.toString());

      if (existingIdx !== -1) {
        story.reviews[existingIdx].rating = numRating;
        story.reviews[existingIdx].comment = comment.trim();
        story.reviews[existingIdx].updatedAt = new Date();
      } else {
        story.reviews.push({
          _id: uuidv4(),
          userId,
          userName,
          rating: numRating,
          comment: comment.trim(),
          createdAt: new Date(),
          updatedAt: new Date()
        });

        await getUser().findByIdAndUpdate(userId, { $inc: { karma: 5 } }).catch(() => {});
        if (story.author) {
          await getUser().findByIdAndUpdate(story.author, { $inc: { karma: 2 } }).catch(() => {});
        }
      }

      const count = story.reviews.length;
      story.ratingCount = count;
      story.rating = count > 0
        ? Number((story.reviews.reduce((sum, r) => sum + Number(r.rating), 0) / count).toFixed(1))
        : 0;

      await story.save();
      await notifyStoryReviewed(story, req.user, numRating, comment, req.io);
      return res.json({
        rating: story.rating,
        ratingCount: story.ratingCount,
        reviews: story.reviews
      });
    }

    // In-memory mode
    const store = getStore();
    const story = store.stories.find(s => s._id === req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });

    story.reviews = story.reviews || [];
    const existingIdx = story.reviews.findIndex(r => (r.userId?._id || r.userId || '').toString() === userId.toString());

    if (existingIdx !== -1) {
      story.reviews[existingIdx].rating = numRating;
      story.reviews[existingIdx].comment = comment.trim();
      story.reviews[existingIdx].updatedAt = new Date();
    } else {
      story.reviews.push({
        _id: uuidv4(),
        userId,
        userName,
        rating: numRating,
        comment: comment.trim(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const reviewer = store.users.find(u => u._id === userId);
      if (reviewer) reviewer.karma = (reviewer.karma || 0) + 5;
      const author = store.users.find(u => u._id === story.author);
      if (author) author.karma = (author.karma || 0) + 2;
    }

    const count = story.reviews.length;
    story.ratingCount = count;
    story.rating = count > 0
      ? Number((story.reviews.reduce((sum, r) => sum + Number(r.rating), 0) / count).toFixed(1))
      : 0;

    await notifyStoryReviewed(story, req.user, numRating, comment, req.io);
    res.json({
      rating: story.rating,
      ratingCount: story.ratingCount,
      reviews: story.reviews
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/stories/:id/reviews/:reviewId
router.delete('/:id/reviews/:reviewId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (isMongoMode()) {
      const story = await getStory().findById(req.params.id);
      if (!story) return res.status(404).json({ error: 'Story not found' });

      story.reviews = story.reviews || [];
      const reviewIdx = story.reviews.findIndex(r => r._id === req.params.reviewId);
      if (reviewIdx === -1) return res.status(404).json({ error: 'Review not found' });

      const review = story.reviews[reviewIdx];
      const isOwner = (review.userId?._id || review.userId || '').toString() === userId.toString();
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: 'You are not authorized to delete this review' });
      }

      story.reviews.splice(reviewIdx, 1);
      const count = story.reviews.length;
      story.ratingCount = count;
      story.rating = count > 0
        ? Number((story.reviews.reduce((sum, r) => sum + Number(r.rating), 0) / count).toFixed(1))
        : 0;

      await story.save();
      return res.json({
        message: 'Review deleted',
        rating: story.rating,
        ratingCount: story.ratingCount,
        reviews: story.reviews
      });
    }

    const store = getStore();
    const story = store.stories.find(s => s._id === req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });

    story.reviews = story.reviews || [];
    const reviewIdx = story.reviews.findIndex(r => r._id === req.params.reviewId);
    if (reviewIdx === -1) return res.status(404).json({ error: 'Review not found' });

    const review = story.reviews[reviewIdx];
    const isOwner = (review.userId?._id || review.userId || '').toString() === userId.toString();
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'You are not authorized to delete this review' });
    }

    story.reviews.splice(reviewIdx, 1);
    const count = story.reviews.length;
    story.ratingCount = count;
    story.rating = count > 0
      ? Number((story.reviews.reduce((sum, r) => sum + Number(r.rating), 0) / count).toFixed(1))
      : 0;

    res.json({
      message: 'Review deleted',
      rating: story.rating,
      ratingCount: story.ratingCount,
      reviews: story.reviews
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
