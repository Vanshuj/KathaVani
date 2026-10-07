const express = require('express');
const router  = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getStore, isMongoMode } = require('../config/db');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const getStory = () => isMongoMode() ? require('../models/Story') : null;
const getUser  = () => isMongoMode() ? require('../models/User')  : null;

const HISTORICAL_KW = ['chola','mughal','maurya','gupta','maratha','vijayanagara','british raj','partition','gandhi','rajput','vedic','harappan','pala','ashoka','akbar'];
const computeAuth = (content, tags) => {
  const text = (content + ' ' + (tags || []).join(' ')).toLowerCase();
  let score  = Math.floor(Math.random() * 20) + 60;
  HISTORICAL_KW.forEach(kw => { if (text.includes(kw)) score = Math.min(99, score + 3); });
  return score;
};

// GET /api/stories
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { tag, language, region, search, page = 1, limit = 20 } = req.query;

    if (isMongoMode()) {
      const Story = getStory();
      const query = {};
      if (tag)      query.tags     = tag;
      if (language) query.language = language;
      if (region)   query.region   = region;
      if (search)   query.$or = [{ title: { $regex: search, $options: 'i' } }, { content: { $regex: search, $options: 'i' } }];
      const total   = await Story.countDocuments(query);
      const stories = await Story.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
      return res.json({ stories, total, page: Number(page), limit: Number(limit) });
    }

    let stories = [...getStore().stories];
    if (tag)      stories = stories.filter(s => s.tags.includes(tag));
    if (language) stories = stories.filter(s => s.language === language);
    if (region)   stories = stories.filter(s => s.region === region);
    if (search)   { const q = search.toLowerCase(); stories = stories.filter(s => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)); }
    stories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ stories: stories.slice((page - 1) * limit, page * limit), total: stories.length, page: Number(page), limit: Number(limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/stories/geo/map: must be BEFORE /:id
router.get('/geo/map', async (_req, res) => {
  try {
    if (isMongoMode()) {
      const stories = await getStory().find({ lat: { $ne: null }, lng: { $ne: null } }).select('title lat lng region tags votes');
      return res.json(stories);
    }
    res.json(getStore().stories.filter(s => s.lat && s.lng).map(s => ({ _id: s._id, title: s.title, lat: s.lat, lng: s.lng, region: s.region, tags: s.tags, votes: s.votes })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/stories/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    if (isMongoMode()) {
      const story = await getStory().findById(req.params.id);
      if (!story) return res.status(404).json({ error: 'Story not found' });
      return res.json(story);
    }
    const story = getStore().stories.find(s => s._id === req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });
    res.json(story);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/stories
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content, language = 'English', region = 'Pan India', tags = [], lat, lng, audioUrl, videoUrl, nodeGraph = [] } = req.body;
    if (!title || (!content && !audioUrl && !videoUrl)) {
      return res.status(400).json({ error: 'Title and either content, audio, or video are required' });
    }
    const auth = computeAuth(content || '', tags);

    if (isMongoMode()) {
      const story = await getStory().create({ title, content: content || '', language, region, tags, author: req.user.id, authorName: req.user.name, authenticity: auth, lat: lat || null, lng: lng || null, audioUrl: audioUrl || null, videoUrl: videoUrl || null, nodeGraph, voterIds: [] });
      // award karma
      await getUser().findByIdAndUpdate(req.user.id, { $inc: { karma: 20 }, $addToSet: { badges: 'Elder Storyteller' } });
      return res.status(201).json(story);
    }

    const store = getStore();
    const story = { _id: uuidv4(), title, content: content || '', language, region, tags, author: req.user.id, authorName: req.user.name, authenticity: auth, votes: 0, voterIds: [], karma: 0, lat: lat || null, lng: lng || null, audioUrl: audioUrl || null, videoUrl: videoUrl || null, isModerated: false, nodeGraph, createdAt: new Date(), updatedAt: new Date() };
    store.stories.push(story);
    const user = store.users.find(u => u._id === req.user.id);
    if (user) { user.karma = (user.karma || 0) + 20; if (!user.badges.includes('Elder Storyteller')) user.badges.push('Elder Storyteller'); }
    res.status(201).json(story);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/stories/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (isMongoMode()) {
      const story = await getStory().findById(req.params.id);
      if (!story) return res.status(404).json({ error: 'Story not found' });
      if (story.author.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
      Object.assign(story, req.body);
      if (req.body.content || req.body.tags) story.authenticity = computeAuth(story.content, story.tags);
      await story.save();
      return res.json(story);
    }
    const store = getStore();
    const idx   = store.stories.findIndex(s => s._id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Story not found' });
    if (store.stories[idx].author !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    store.stories[idx] = { ...store.stories[idx], ...req.body, updatedAt: new Date() };
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

module.exports = router;
