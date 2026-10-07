const express = require('express');
const router  = express.Router();
const { getStore, isMongoMode } = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const getStory = () => isMongoMode() ? require('../models/Story') : null;

// GET /api/vault/offline-packs
router.get('/offline-packs', async (_req, res) => {
  try {
    const PACK_TAGS = [
      { id: 'pack-mythology', name: 'Mythology Legends Pack',    desc: 'Ancient tales of gods, heroes, and divine epics from across India',    tag: 'mythology', size: '2.1 MB' },
      { id: 'pack-resistance',name: 'Freedom Fighters Pack',     desc: 'Stories of courage, resistance, and the path to independence',          tag: 'resistance', size: '1.8 MB' },
      { id: 'pack-migration', name: 'Migration Chronicles Pack', desc: 'Heartfelt tales of journeys, displacement, and cultural preservation',   tag: 'migration',  size: '1.5 MB' },
    ];

    if (isMongoMode()) {
      const Story = getStory();
      const packs = await Promise.all(PACK_TAGS.map(async p => {
        const stories = await Story.find({ tags: p.tag }).limit(5);
        const count   = await Story.countDocuments({ tags: p.tag });
        return { id: p.id, name: p.name, description: p.desc, tag: p.tag, stories, size: p.size, storyCount: count };
      }));
      return res.json(packs);
    }

    const store = getStore();
    const packs = PACK_TAGS.map(p => ({
      id: p.id, name: p.name, description: p.desc, tag: p.tag, size: p.size,
      stories:    store.stories.filter(s => s.tags.includes(p.tag)).slice(0, 5),
      storyCount: store.stories.filter(s => s.tags.includes(p.tag)).length,
    }));
    res.json(packs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const mongoose = require('mongoose');

// POST /api/vault/sync
router.post('/sync', authMiddleware, async (req, res) => {
  try {
    const { offlineStories = [] } = req.body;
    if (isMongoMode()) {
      const Story  = getStory();
      const synced = [];
      for (const s of offlineStories) {
        let exists = null;
        if (s._id && mongoose.isValidObjectId(s._id)) {
          exists = await Story.findById(s._id).catch(() => null);
        }
        if (!exists) {
          const { _id, ...storyData } = s;
          await Story.create({
            ...storyData,
            author: req.user.id,
            authorName: req.user.name,
            isModerated: false
          });
          synced.push(s._id);
        }
      }
      return res.json({ synced, count: synced.length });
    }
    const store  = getStore();
    const synced = [];
    offlineStories.forEach(s => { if (!store.stories.find(e => e._id === s._id)) { store.stories.push({ ...s, isModerated: false }); synced.push(s._id); } });
    res.json({ synced, count: synced.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/vault/featured
router.get('/featured', async (_req, res) => {
  try {
    if (isMongoMode()) {
      const stories = await getStory().find({ isModerated: true }).sort({ votes: -1 }).limit(3);
      return res.json(stories);
    }
    res.json(getStore().stories.filter(s => s.isModerated).sort((a, b) => b.votes - a.votes).slice(0, 3));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/vault/tags
router.get('/tags', async (_req, res) => {
  try {
    if (isMongoMode()) {
      const result = await getStory().aggregate([{ $unwind: '$tags' }, { $group: { _id: '$tags', count: { $sum: 1 } } }]);
      const tags   = {};
      result.forEach(r => { tags[r._id] = r.count; });
      return res.json(tags);
    }
    const tags = {};
    getStore().stories.forEach(s => s.tags.forEach(t => { tags[t] = (tags[t] || 0) + 1; }));
    res.json(tags);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
