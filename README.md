# 🪔 KathaVani — Cultural Storytelling Hub

> *Where Stories Live Forever*

KathaVani is a full-stack web application for discovering, sharing, and preserving India's rich cultural heritage through interactive storytelling. It features AI-powered narrative building, geo-tagged story trails, multilingual TTS/STT, offline story packs, gamification, and a community vault — all built without any third-party AI API keys.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start (Local)](#-quick-start-local)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Mock AI Logic](#-mock-ai-logic)
- [Demo Accounts](#-demo-accounts)

---

## ✨ Features

### Core Features
- **🎙️ Storyteller Workshop** — Write or dictate stories with Web Speech API (STT), get AI-powered node suggestions, and build branching narratives with a visual node tree (up to 20+ nodes, backtracking supported)
- **📖 Listener Hub** — Browse all community stories, play TTS narration in 6 languages (English, Hindi, Tamil, Telugu, Marathi, Kannada), vote on stories
- **🗺️ Geo-Tagged Story Trails** — Interactive Leaflet map showing story origins across India
- **🏺 Community Vault** — Moderated archive with mythology, resistance, migration, and folklore tags
- **📥 Offline Story Packs** — Download story packs to IndexedDB (via localForage), sync back when online
- **🏆 Gamification** — Quizzes, karma points, badges, and a leaderboard
- **🌀 What If? Mode** — Mock AI generates 2 alternate historical endings
- **🌱 Story Sprouts** — Template-based micro-tales for kids
- **🎭 Emotion-Aware Narration** — Keyword analysis detects mood (Joy / Sorrow / Anger / Mystery)
- **🎵 Cultural Soundscape** — Ambient atmosphere descriptions (Temple Bells, Sacred Forest, etc.)
- **📸 AR Overlay Simulation** — Modal showing story title over a camera-like frame
- **⚙️ Settings** — Full profile, appearance, accessibility, notification, and security settings, all persisted to backend

### Technical Highlights
- JWT authentication with bcrypt password hashing
- In-memory database with rich seeded data (easy swap to MongoDB)
- Socket.io real-time vote updates
- Service worker for offline caching
- Dark/light theme with CSS variables
- Responsive, mobile-first design

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Context API |
| Styling | Custom CSS with CSS Variables (no framework dependency) |
| Maps | Leaflet + react-leaflet |
| HTTP | Axios |
| Speech | Web Speech API (browser-native) |
| Offline | localForage (IndexedDB) + Service Worker |
| Icons | FontAwesome 6 |
| Fonts | Playfair Display, Crimson Pro, DM Mono |
| Backend | Node.js + Express |
| Auth | JWT + bcryptjs |
| Database | In-memory store (Mongoose-ready for MongoDB) |
| Real-time | Socket.io |
| Deployment | Frontend → Vercel/Netlify, Backend → Render/Railway |

---

## 📁 Project Structure

```
kathavani/
├── package.json              # Root monorepo scripts
├── README.md
│
├── backend/
│   ├── server.js             # Express entry point + Socket.io
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   └── db.js             # DB connection + in-memory store + seeding
│   ├── middleware/
│   │   └── auth.js           # JWT middleware
│   └── routes/
│       ├── auth.js           # POST /register, POST /login, GET /me
│       ├── stories.js        # CRUD + vote + node graph + geo
│       ├── users.js          # Profile, karma, quiz, password, leaderboard
│       ├── gamification.js   # Quizzes, badges
│       └── vault.js          # Offline packs, sync, featured, tags
│
└── frontend/
    ├── package.json
    ├── .env.example
    ├── public/
    │   ├── index.html
    │   └── sw.js             # Service worker
    └── src/
        ├── index.js
        ├── App.js            # Router + providers
        ├── index.css         # Complete design system
        ├── context/
        │   ├── AuthContext.js
        │   └── AppContext.js  # Theme, font size, online status
        ├── services/
        │   ├── api.js         # All API calls via Axios
        │   ├── mockAI.js      # Node suggestions, What If?, Sprouts, Sentiment
        │   └── offline.js     # localForage IndexedDB helpers
        ├── hooks/
        │   └── useSpeech.js   # TTS + STT hook
        ├── components/
        │   ├── Layout.js      # Navbar + footer + toast
        │   ├── NodeTree.js    # Visual branching tree
        │   ├── StoryMap.js    # Leaflet map component
        │   ├── AuthenticityMeter.js
        │   └── WhatIfModal.js
        └── pages/
            ├── Home.js
            ├── AuthPage.js
            ├── StorytellerPage.js
            ├── ListenerPage.js
            ├── VaultPage.js
            ├── GamificationPage.js
            ├── SettingsPage.js
            └── StoryDetail.js
```

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js v18+ and npm v9+
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/kathavani.git
cd kathavani
```

### 2. Install All Dependencies

```bash
# Install root deps (concurrently)
npm install

# Install backend deps
cd backend && npm install && cd ..

# Install frontend deps
cd frontend && npm install && cd ..
```

Or use the convenience script:
```bash
npm run install:all
```

### 3. Set Up Environment Variables

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env if needed (defaults work out-of-the-box with in-memory DB)

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env if your backend runs on a different port
```

### 4. Run Development Servers

```bash
# Start both frontend and backend together
npm run dev
```

Or start them separately:

```bash
# Terminal 1 — Backend (port 5000)
npm run dev:backend

# Terminal 2 — Frontend (port 3000)
npm run dev:frontend
```

### 5. Open in Browser

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/health

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `MONGODB_URI` | `inmemory` | MongoDB URI or `inmemory` for demo |
| `JWT_SECRET` | `kathavani-super-secret-...` | JWT signing secret |
| `FRONTEND_URL` | `http://localhost:3000` | CORS allowed origin |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_API_URL` | `http://localhost:5000/api` | Backend API base URL |

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user (auth required) |

### Stories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stories` | List stories (query: tag, language, region, search, page, limit) |
| GET | `/api/stories/:id` | Get single story |
| POST | `/api/stories` | Create story (auth required) |
| PUT | `/api/stories/:id` | Update story (auth required, owner only) |
| DELETE | `/api/stories/:id` | Delete story (auth required, owner only) |
| POST | `/api/stories/:id/vote` | Vote on story (auth required) |
| GET | `/api/stories/:id/authenticity` | Get authenticity score |
| PUT | `/api/stories/:id/nodes` | Save node graph (auth required) |
| GET | `/api/stories/geo/map` | Get geo-tagged stories for map |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get user profile (auth required) |
| PUT | `/api/users/preferences` | Update preferences (auth required) |
| PUT | `/api/users/karma` | Add karma points (auth required) |
| POST | `/api/users/quiz` | Record quiz score (auth required) |
| PUT | `/api/users/password` | Change password (auth required) |
| DELETE | `/api/users/account` | Delete account (auth required) |
| GET | `/api/users/leaderboard` | Get top 10 users |

### Gamification
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gamification/quizzes` | List all quizzes |
| GET | `/api/gamification/quizzes/:id` | Get quiz with questions |
| POST | `/api/gamification/quizzes/:id/submit` | Submit answers (auth required) |
| GET | `/api/gamification/badges` | Get all badge definitions |

### Vault
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vault/offline-packs` | Get downloadable packs |
| POST | `/api/vault/sync` | Sync offline stories (auth required) |
| GET | `/api/vault/featured` | Get featured stories |
| GET | `/api/vault/tags` | Get tag counts |

---

## 🌐 Deployment

### Deploy Frontend to Vercel

```bash
cd frontend
npm run build

# Using Vercel CLI
npx vercel --prod
```

Or connect your GitHub repo to Vercel and set:
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Environment Variable**: `REACT_APP_API_URL=https://your-backend.onrender.com/api`

### Deploy Backend to Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repository
3. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add environment variables:
   - `MONGODB_URI` → Your MongoDB Atlas URI (or leave as `inmemory`)
   - `JWT_SECRET` → A strong random string
   - `FRONTEND_URL` → Your Vercel frontend URL
   - `PORT` → `10000` (Render's default)

### Deploy Backend to Railway

```bash
cd backend
railway login
railway init
railway up
```

Set the same environment variables in Railway's dashboard.

### Using MongoDB Atlas (Production)

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Get the connection URI: `mongodb+srv://user:password@cluster.mongodb.net/kathavani`
3. Set `MONGODB_URI` to this value in your backend environment

---

## 🤖 Mock AI Logic

All AI features work without any API keys using deterministic logic:

### Node Suggestions (`generateNodeSuggestions`)
Detects cultural keywords (chola, mughal, maratha, folk, migration, nature) in the story text and returns 3–5 contextually appropriate plot continuations from curated phrase lists. Falls back to generic story-continuation phrases.

### Authenticity Meter (`computeAuthenticity` / `AuthenticityMeter`)
- Base score: 55–65
- +5 for stories over 100 words, +5 more for 500+ words
- +3 for each historical keyword found (Chola, Mughal, Maurya, etc.)
- +2 for having any tags, +3 for 3+ tags
- Capped at 99

### What If? Alternate History (`generateWhatIf`)
Returns 2 of 4 pre-written alternate endings (Peace Treaty, Tragic Sacrifice, Hidden Alliance, Long Exile) based on a random selection seeded from story content.

### Story Sprouts (`generateStorySprout`)
Fills a template: `"Once upon a time, a [animal] discovered [object] and learned that [moral]"` using random picks from curated cultural lists.

### Emotion/Sentiment Analysis (`analyzeSentiment`)
Counts occurrences of joy, sorrow, anger, and mystery keywords to determine the dominant mood and suggest an appropriate narration style.

---

## 👤 Demo Accounts

The in-memory database is pre-seeded with:

| Email | Password | Name | Karma |
|-------|----------|------|-------|
| `priya@demo.com` | `demo123` | Priya Sharma | 450 |
| `arjun@demo.com` | `demo123` | Arjun Mehta | 320 |

5 pre-seeded stories covering mythology, resistance, migration, folklore, and tribal themes from regions across India.

---

## 🧪 Testing Key Flows

### Storyteller Flow
1. Login → Navigate to `/storyteller`
2. Write a story mentioning "Chola" or "Mughal" → Watch authenticity meter rise
3. Click **Suggest Nodes** → Pick a continuation → See node tree update
4. Click any node in the tree → Story reverts to that state (backtracking)
5. Click **What If?** → Choose an alternate ending
6. Click **Publish to Vault** → Story appears in Community Vault

### Listener Flow
1. Navigate to `/listener`
2. Browse stories → Click **Narrate** to hear TTS
3. Switch to **Story Map** tab → Click map markers to read geo-stories
4. Vote on a story → Karma is awarded

### Offline Flow
1. Navigate to `/vault` → **Offline Packs** tab
2. Click **Download for Offline** → Pack saved to IndexedDB
3. Disable internet → Offline indicator appears
4. Downloaded packs still accessible in browser storage

### Gamification Flow
1. Navigate to `/gamification` → **Quizzes** tab
2. Start a quiz → Answer questions → Submit
3. See score + karma earned
4. Check **Badges** tab → Progress bars show karma requirements
5. Check **Ranks** tab → Leaderboard

---

## 📄 License

MIT License — see LICENSE file for details.

---

*Built with ❤️ to preserve India's living heritage.*
