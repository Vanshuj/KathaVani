const express = require('express');
const router = express.Router();
const { getStore, isMongoMode } = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const getUser = () => isMongoMode() ? require('../models/User') : null;

const QUIZZES = [
  {
    id: 'q1', title: 'Chola Dynasty Quiz', storyTag: 'mythology',
    questions: [
      { q: 'Who was the greatest Chola emperor who conquered Southeast Asia?', options: ['Rajendra Chola I', 'Parantaka I', 'Kulottunga I', 'Aditya I'], correct: 0 },
      { q: 'What was the capital of the Chola empire?', options: ['Madurai', 'Thanjavur', 'Kanchipuram', 'Uraiyur'], correct: 1 },
      { q: 'The famous Brihadeeswarar Temple was built by which Chola king?', options: ['Kulottunga', 'Rajaraja I', 'Vijayalaya', 'Aditya II'], correct: 1 },
      { q: 'Which river was central to the Chola civilization?', options: ['Godavari', 'Krishna', 'Kaveri', 'Tungabhadra'], correct: 2 },
      { q: 'What maritime achievement is Rajendra Chola known for?', options: ['Building a navy', 'Naval expedition to Southeast Asia', 'Crossing the Indian Ocean', 'Discovering Sri Lanka'], correct: 1 }
    ]
  },
  {
    id: 'q2', title: 'Mughal Empire Lore', storyTag: 'history',
    questions: [
      { q: 'Who founded the Mughal Empire in India?', options: ['Humayun', 'Babur', 'Akbar', 'Jahangir'], correct: 1 },
      { q: 'Which Mughal emperor built the Taj Mahal?', options: ['Akbar', 'Jahangir', 'Shah Jahan', 'Aurangzeb'], correct: 2 },
      { q: 'What was the official language of the Mughal court?', options: ['Hindi', 'Urdu', 'Persian', 'Arabic'], correct: 2 },
      { q: 'Who was Akbar\'s finance minister known for the land revenue system?', options: ['Todar Mal', 'Birbal', 'Abul Fazl', 'Man Singh'], correct: 0 },
      { q: 'Which Mughal emperor abolished Jizya tax?', options: ['Humayun', 'Akbar', 'Jahangir', 'Shah Jahan'], correct: 1 }
    ]
  },
  {
    id: 'q3', title: 'Indian Freedom Struggle', storyTag: 'resistance',
    questions: [
      { q: 'In which year did India gain independence?', options: ['1945', '1946', '1947', '1948'], correct: 2 },
      { q: 'Who led the Salt March of 1930?', options: ['Nehru', 'Gandhi', 'Bose', 'Patel'], correct: 1 },
      { q: 'What was the Quit India Movement year?', options: ['1940', '1941', '1942', '1943'], correct: 2 },
      { q: 'Rani Lakshmibai fought in which revolt?', options: ['Sepoy Mutiny 1857', 'Non-cooperation', 'Quit India', 'Civil Disobedience'], correct: 0 },
      { q: 'Who gave the famous "Tryst with Destiny" speech?', options: ['Gandhi', 'Patel', 'Nehru', 'Bose'], correct: 2 }
    ]
  }
];

// GET /api/gamification/quizzes
router.get('/quizzes', (req, res) => {
  res.json(QUIZZES.map(q => ({ id: q.id, title: q.title, storyTag: q.storyTag, questionCount: q.questions.length })));
});

// GET /api/gamification/quizzes/:id
router.get('/quizzes/:id', (req, res) => {
  const quiz = QUIZZES.find(q => q.id === req.params.id);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  res.json(quiz);
});

// POST /api/gamification/quizzes/:id/submit
router.post('/quizzes/:id/submit', authMiddleware, async (req, res) => {
  try {
    const quiz = QUIZZES.find(q => q.id === req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    const { answers = [] } = req.body;
    let score = 0;
    const results = quiz.questions.map((q, i) => {
      const correct = answers[i] === q.correct;
      if (correct) score++;
      return { question: q.q, yourAnswer: answers[i], correctAnswer: q.correct, correct };
    });

    const points = Math.round((score / quiz.questions.length) * 20);

    if (isMongoMode()) {
      const User = getUser();
      const user = await User.findById(req.user.id);
      if (user) {
        user.karma = (user.karma || 0) + points;
        if (score === quiz.questions.length && !user.badges.includes('Quiz Champion')) {
          user.badges.push('Quiz Champion');
        }
        await user.save();
      }
      return res.json({ score, total: quiz.questions.length, points, results, karma: user?.karma });
    }

    const store = getStore();
    const user = store.users.find(u => u._id === req.user.id);
    if (user) {
      user.karma = (user.karma || 0) + points;
      if (score === quiz.questions.length && !user.badges.includes('Quiz Champion')) {
        user.badges.push('Quiz Champion');
      }
    }

    res.json({ score, total: quiz.questions.length, points, results, karma: user?.karma });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/gamification/badges
router.get('/badges', (req, res) => {
  const ALL_BADGES = [
    { id: 'story-seed', name: 'Story Seed', description: 'Earn 100 karma points', icon: 'seedling', requirement: 100 },
    { id: 'myth-keeper', name: 'Myth Keeper', description: 'Earn 300 karma points', icon: 'scroll', requirement: 300 },
    { id: 'cultural-guardian', name: 'Cultural Guardian', description: 'Earn 500 karma points', icon: 'landmark', requirement: 500 },
    { id: 'elder-storyteller', name: 'Elder Storyteller', description: 'Publish a story to the vault', icon: 'microphone', requirement: 0 },
    { id: 'quiz-champion', name: 'Quiz Champion', description: 'Score 100% on any quiz', icon: 'trophy', requirement: 0 },
  ];
  res.json(ALL_BADGES);
});

module.exports = router;
