# 🪔 KathaVani — Cultural Storytelling & Living Oral Archive

> *Where India's Oral Stories Live Forever*

KathaVani is a modern full-stack web application designed for discovering, sharing, and safeguarding India's rich oral traditions, regional folklore, and living cultural heritage. Featuring a tactile **3D Claymorphic UI**, live oral audio narration with real-time listening time tracking, interactive geo-tagged cultural maps, branching narrative workshops, multilingual TTS/STT across 12 Indic languages, and offline story packs.

---

## 📋 Table of Contents

- [Features](#-features)
- [3D Claymorphism Design System](#-3d-claymorphism-design-system)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start (Local)](#-quick-start-local)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Real-Time Oral Listening Engine](#-real-time-oral-listening-engine)
- [Mock AI Logic](#-mock-ai-logic)
- [Demo Accounts](#-demo-accounts)
- [Testing Key Flows](#-testing-key-flows)

---

## ✨ Features

### 🎧 Living Oral Archive & Discovery
- **🧑‍🤝‍🧑 Hero 3D Storytelling Duo** — Interactive 3D clay visual depicting oral storytelling (a girl reading ancient manuscripts and a boy listening to oral narratives through headphones) with live audio preview and story carousel.
- **📊 Real-Time Platform Metric Cards** — Four tactile 3D clay stat cards rendered in harmonious green and orange pastel tones:
  - **Languages Supported**: 12 Indic languages with dynamic active archive count.
  - **Stories Archived**: Live count of community stories and verified lore.
  - **Hours Listened**: Real-time oral playback duration tracking with live pulsing `● Live Listening` status and spoken words counter.
  - **Active Story Streak**: Consecutive daily calendar streak tracking.
- **📖 Listener Hub** — Multilingual storytelling browser with search, regional tagging, audio narration, and community voting.
- **🗺️ Geo-Tagged Cultural Map** — Interactive Leaflet map displaying story origins across India with geographic pins and regional narratives.
- **🏺 Community Vault** — Curated cultural vault categorizing stories by Mythology & Epics, Oral Resistance, Migration Chronicles, Folklore, and Tribal Lore.
- **📥 Offline Story Packs** — Download story packs to IndexedDB (via localForage) for uninterrupted reading and listening without internet access.

### ✍️ Storyteller Workshop & Preservation
- **🎙️ Speech-to-Text Dictation** — Dictate or type stories using browser Web Speech API.
- **🌿 Interactive Node Tree** — Craft branching narratives with dynamic visual node graphs (supports 20+ story branches and state backtracking).
- **🛡️ Authenticity Verification** — Algorithmic cultural analysis verifying historical keywords, length, and community authenticity score.
- **🌀 What If? Alternate Endings** — Generate alternate historical turning points based on narrative themes.
- **🌱 Story Sprouts** — Cultural micro-tales tailored for young listeners and cultural education.

### 🔊 Multilingual Audio & Emotion-Aware Narration
- **12 Indic Languages Supported**: English, Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Odia, Punjabi, and Assamese.
- **Emotion-Aware Pacing**: Detects tone (Joy, Sorrow, Passion, Mystery) and adjusts playback rate, pitch, and inflection.
- **Dual Engine Audio**: Web Speech API with automatic fallback to high-quality Indic audio streams.

---

## 🎨 3D Claymorphism Design System

KathaVani features a bespoke 3D clay aesthetic crafted with pure CSS:
- **Intaglio & Embossed Clay Elevation**: Multi-layered inner and outer drop shadows simulating soft, tactile clay objects.
- **Heritage & Pastel Color Palette**: Nature-inspired earth tones including Sage Green, Terracotta Orange, Sunlit Amber, and Forest Green.
- **Adaptive Light & Dark Modes**: Seamless theme switching with custom clay surfaces, readable contrasts, and ambient glow effects.
- **Pill Badges & Micro-Interactions**: Fluid hover lifts, tactile press responses, and organic rounded corners.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router v6, Context API |
| **Styling** | Vanilla CSS3 (3D Claymorphism design tokens & variables) |
| **Audio & Speech** | Web Speech API (Synthesis & Recognition) + Google TTS Fallback Stream |
| **Maps** | Leaflet + react-leaflet |
| **Offline Storage** | localForage (IndexedDB) + Service Worker cache |
| **Icons & Fonts** | FontAwesome 6, Inter, Outfit, Crimson Pro, DM Mono |
| **Backend** | Node.js + Express |
| **Authentication** | JWT (JSON Web Tokens) + bcryptjs |
| **Database** | In-memory store (seed-ready) / MongoDB via Mongoose |
| **Real-Time** | Custom browser event orchestration + Socket.io |

---

## 📁 Project Structure

```
kathavani/
├── package.json
├── README.md
│
├── backend/
│   ├── server.js             # Express server entry point
│   ├── config/
│   │   └── db.js             # MongoDB connection & in-memory seeded store
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   ├── models/
│   │   ├── Story.js          # Story schema
│   │   └── User.js           # User schema (includes listenedSeconds & preferences)
│   └── routes/
│       ├── auth.js           # Registration & login routes
│       ├── stories.js        # Story CRUD, voting, node graphs & geo-map
│       ├── users.js          # Profile, preferences, karma & listening tracking
│       └── vault.js          # Offline packs, sync & curated lore
│
└── frontend/
    ├── public/
    │   ├── index.html
    │   └── sw.js             # Offline Service Worker
    └── src/
        ├── index.js
        ├── App.js            # Routing & application shell
        ├── index.css         # 3D Claymorphic design system
        ├── assets/
        │   └── clay_storytelling_duo.png
        ├── context/
        │   ├── AuthContext.js
        │   └── AppContext.js
        ├── hooks/
        │   └── useSpeech.js   # Audio narration & real-time listening accumulator
        ├── services/
        │   ├── api.js         # Backend API client
        │   ├── mockAI.js      # Deterministic AI, sentiment & node engines
        │   └── offline.js     # IndexedDB localForage wrapper
        ├── components/
        │   ├── ClayStorytellingDuo.js  # 3D Hero duo interactive player
        │   ├── ClaymorphicBook.js      # 3D interactive manuscript
        │   ├── CulturalMapSection.js   # Leaflet cultural map
        │   ├── Features3D.js           # 3D platform feature pillars
        │   ├── Layout.js               # Navbar & footer
        │   ├── NodeTree.js             # Branching story node graph
        │   └── AuthenticityMeter.js    # Historical score meter
        └── pages/
            ├── Home.js                 # Hero, 3D duo & live stat cards
            ├── ListenerPage.js         # Multilingual story reader
            ├── StorytellerPage.js      # Branching narrative creator
            ├── StoryDetail.js          # Story reader & oral player
            ├── VaultPage.js            # Curated archive & offline packs
            ├── SettingsPage.js         # Profile, appearance & audio settings
            └── AuthPage.js             # Sign in & sign up
```

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js v18+ and npm v9+
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Vanshuj/KathaVani.git
cd kathavani
```

### 2. Install Dependencies

```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

Or install manually:
```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 3. Run Development Servers

```bash
# Concurrently starts Backend (:5000) and Frontend (:3000)
npm run dev
```

Or start them in separate terminals:
- **Backend**: `cd backend && npm run dev`
- **Frontend**: `cd frontend && npm run dev`

Open `http://localhost:3000` in your browser.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=inmemory          # Or mongodb+srv://... for MongoDB Atlas
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env`)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## ⏱️ Real-Time Oral Listening Engine

KathaVani includes an audio listening tracking engine:
- **Active Narration Detection**: Whenever audio is actively playing through `useSpeech.js`, a 1-second interval accumulator tracks elapsed listening time.
- **Live Reactive UI**: Dispatches browser events (`kv_listen_time_updated` and `kv_listen_stopped`) so the Home page's **"Hours Listened"** card displays:
  - `● Live Listening` with an animated pulse during playback.
  - Dynamically recalculates duration in `seconds`, `mins`, or `hrs`.
  - Dynamically computes spoken words heard (`~130 words/min`).
- **Cross-Session Persistence**: Saved in `localStorage` under `kv_user_listen_seconds` and synchronized with the backend user profile (`listenedSeconds`).

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a user account |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT |
| `GET` | `/api/auth/me` | Fetch authenticated user data |

### Stories
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stories` | List stories (filters: language, region, tag, search) |
| `GET` | `/api/stories/:id` | Get story by ID |
| `POST` | `/api/stories` | Submit a new story (auth required) |
| `PUT` | `/api/stories/:id` | Update story (author only) |
| `DELETE` | `/api/stories/:id` | Delete story (author only) |
| `POST` | `/api/stories/:id/vote` | Upvote a story |
| `PUT` | `/api/stories/:id/nodes` | Save branching narrative node graph |
| `GET` | `/api/stories/geo/map` | Fetch geo-located stories for the map |

### Users & Preferences
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users/profile` | Get current user profile |
| `PUT` | `/api/users/preferences` | Update settings, theme, and listening time |
| `PUT` | `/api/users/karma` | Award cultural karma points |
| `GET` | `/api/users/leaderboard` | View top contributors |

### Vault & Offline
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/vault/offline-packs` | Retrieve curated packs for offline storage |
| `POST` | `/api/vault/sync` | Sync locally cached stories to archive |
| `GET` | `/api/vault/featured` | Fetch featured oral lore |

---

## 👤 Demo Accounts

Pre-seeded accounts available in demo / in-memory mode:

| Email | Password | Name |
|---|---|---|
| `priya@demo.com` | `demo123` | Priya Sharma |
| `arjun@demo.com` | `demo123` | Arjun Mehta |

---

## 🧪 Testing Key Flows

### 1. Oral Listening & Live Stats Flow
1. Open the Home page (`/`).
2. Scroll to the **Hero 3D Storytelling Duo** and click **"Listen Audio"**.
3. Observe the **"Hours Listened"** card below switch to **`● Live Listening`** with dynamic time increments.
4. Stop audio and observe accumulated minutes and words updated persistently.

### 2. Storyteller Workshop Flow
1. Navigate to `/storyteller`.
2. Write or dictate your story using the microphone button.
3. Watch the **Authenticity Meter** score update dynamically based on historical context.
4. Click **"Suggest Nodes"** to create branching story choices.
5. Click **"Publish to Vault"** to submit the story to the community archive.

### 3. Offline Mode Flow
1. Navigate to `/vault` → **Offline Packs**.
2. Click **"Download for Offline"** to save lore to IndexedDB.
3. Toggle offline mode in DevTools or disconnect internet.
4. Saved stories remain readable and accessible without network connectivity.

---

## 📄 License

MIT License — see `LICENSE` for details.

*Preserving India's oral heritage through technology and living memories.*
