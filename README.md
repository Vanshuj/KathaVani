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
- [Admin Setup & Security](#-admin-setup--security)
- [API Reference](#-api-reference)
- [Real-Time Oral Listening Engine](#-real-time-oral-listening-engine)
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

### 🛡️ Secure Admin Panel & Moderation Console
- **Dedicated Admin Portal** (`/admin/login`) — Separate authentication boundary with JWT role validation and session isolation.
- **Role-Based Access Control (RBAC)** — Granular permissions for `user`, `reviewer`, and `admin` roles, strictly enforced on the server.
- **Real-Time Operational Metrics** — Live dashboard metrics for total users, active vs. suspended accounts, stories pending review, published lore, and active administrators.
- **User Governance** — Search and filter users, inspect profiles and submitted stories, suspend/reactivate with documented reasons, selectively restrict account capabilities (e.g. story submission), safely soft-delete or permanently delete accounts.
- **Story Moderation Workflow** — Review queue with `pending`, `approved`, `rejected`, and `flagged` statuses, content editing, deletion, and required moderation reasoning.
- **Administrator Management** — Promote verified users, provision new admins, revoke privileges, and prevent self-demotion or removal of the last administrator.
- **Immutable Audit Trail** — Chronological logging of all administrative operations (user changes, story moderation, role elevations) with admin identification and change details.
- **Tactile 3D Claymorphic Console** — Bespoke responsive layout featuring sidebar navigation, live stat cards, responsive data tables, modal dialogs, and dark/light themes.

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
│   ├── server.js             # Express server entry point (routes: /api/* & /api/admin/*)
│   ├── config/
│   │   └── db.js             # MongoDB & in-memory store + admin auto-bootstrap
│   ├── middleware/
│   │   └── auth.js           # JWT verification, admin-role check & capability enforcement
│   ├── models/
│   │   ├── User.js           # Roles (admin/reviewer/user), status & restrictions
│   │   ├── Story.js          # Moderation status (pending/approved/flagged/rejected)
│   │   └── AuditLog.js       # Immutable administrative audit trail
│   ├── routes/
│   │   ├── auth.js           # User registration & login
│   │   ├── admin.js          # Protected admin endpoints (users, stories, admins, logs)
│   │   ├── stories.js        # Story CRUD, voting, node graphs & geo-map
│   │   ├── users.js          # Profile, preferences, karma & listening tracking
│   │   └── vault.js          # Offline packs, sync & curated lore
│   └── scripts/
│       ├── seedAdmin.js      # CLI initial admin bootstrap script
│       └── testAdminSecurity.js # Automated 27-point security test suite
│
└── frontend/
    ├── public/
    │   ├── index.html
    │   └── sw.js             # Offline Service Worker
    └── src/
        ├── index.js
        ├── App.js            # Routing & application shell (includes /admin/* routes)
        ├── index.css         # 3D Claymorphic core design system
        ├── styles/
        │   └── admin.css     # 3D Claymorphic admin console design system
        ├── assets/
        │   └── clay_storytelling_duo.png
        ├── context/
        │   ├── AuthContext.js        # Public user authentication context
        │   ├── AdminAuthContext.js   # Isolated admin authentication & session state
        │   └── AppContext.js
        ├── hooks/
        │   └── useSpeech.js   # Audio narration & real-time listening accumulator
        ├── services/
        │   ├── api.js         # Public user API client (kv_token)
        │   ├── adminApi.js    # Dedicated admin API client (kv_admin_token)
        │   ├── mockAI.js      # Deterministic AI, sentiment & node engines
        │   └── offline.js     # IndexedDB localForage wrapper
        ├── components/
        │   ├── ClayStorytellingDuo.js  # 3D Hero duo interactive player
        │   ├── ClaymorphicBook.js      # 3D interactive manuscript
        │   ├── CulturalMapSection.js   # Leaflet cultural map
        │   ├── Features3D.js           # 3D platform feature pillars
        │   ├── Layout.js               # Public navbar & footer
        │   ├── NodeTree.js             # Branching story node graph
        │   ├── AuthenticityMeter.js    # Historical score meter
        │   └── admin/
        │       └── AdminLayout.js      # Tactile 3D admin sidebar, header & drawer
        └── pages/
            ├── Home.js                 # Hero, 3D duo & live stat cards
            ├── ListenerPage.js         # Multilingual story reader
            ├── StorytellerPage.js      # Branching narrative creator
            ├── StoryDetail.js          # Story reader & oral player
            ├── VaultPage.js            # Curated archive & offline packs
            ├── SettingsPage.js         # Profile, appearance & audio settings
            ├── AuthPage.js             # Sign in & sign up
            └── admin/
                ├── AdminLogin.js       # Dedicated admin authentication portal
                ├── AdminDashboard.js   # Live platform KPIs & recent activities
                ├── AdminUsers.js       # User governance, suspension, restrictions & deletion
                ├── AdminStories.js     # Moderation review queue, editor & approval
                ├── AdminManagement.js  # Administrator provisioning & privilege control
                └── AdminLogs.js        # Searchable immutable audit trail
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

# Admin Bootstrap Configuration (Optional / Defaults provided)
ADMIN_EMAIL=admin@kathavani.org
ADMIN_PASSWORD=AdminKatha@2024!
ADMIN_NAME="Chief Archivist"
```

### Frontend (`frontend/.env`)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🛡️ Admin Setup & Security

KathaVani implements strict defense-in-depth protection for platform governance and cultural moderation:

### 1. Initial Admin Provisioning (Bootstrap CLI)
To bootstrap the initial administrator without insecure public sign-up:

```bash
# From the backend directory or root:
cd backend
npm run seed:admin

# Or with custom credentials:
node scripts/seedAdmin.js customadmin@kathavani.org "MyStrongPassword#123" "Master Archivist"
```

The script:
- Verifies database connectivity (MongoDB Atlas or in-memory mode).
- Salts and hashes the password using `bcryptjs` (cost factor 10).
- Assigns role `admin` and status `active`.
- If an admin account already exists with that email, it safely verifies and preserves it without duplicate accounts.
- Automatic bootstrap also runs transparently during backend server startup if no administrators exist.

### 2. Dedicated Portal Separation
- **Isolated Login Portal**: Admins access the console via `/admin/login`.
- **Token Separation**: Admin JWT tokens are stored in `kv_admin_token` (separate from regular user `kv_token`), preventing cross-session privilege leakage or UI state pollution.
- **Strict Role Enforcement**: Normal users attempting to log in via `/admin/login` or accessing `/api/admin/*` receive `403 Forbidden` (`Admin privileges required`).

### 3. Server-Enforced Governance Rules
- **Self-Protection**: The logged-in admin cannot demote, suspend, or delete their own active account.
- **Last-Admin Safeguard**: The system counts active administrators; demoting or deleting the final admin is rejected with `400 Bad Request`.
- **Archive Integrity**: User deletion defaults to soft-delete (`isDeleted: true`), preserving their cultural stories in the oral archive unless explicit hard-deletion is authorized.
- **Account Restrictions**: Granular restrictions (`submit_story`, `listen_audio`, `comment`) are checked at the middleware level before allowing protected actions.
- **Immutable Audit Trail**: Every moderation and admin action automatically writes an immutable log record with acting admin details, target metadata, and reasons.

### 4. Running the Security Test Suite
KathaVani includes an automated security test runner testing 27 security assertions:

```bash
cd backend
npm run test:security
```

Verified test results:
```text
  [PASS] 1. Unauthenticated request to /api/admin/dashboard/stats returns 401
  [PASS] 2. Unauthenticated request to /api/admin/users returns 401
  [PASS] 3. Public registration payload injecting role: 'admin' is sanitized to role: 'user'
  [PASS] 4. Regular user accessing /api/admin/dashboard/stats returns 403
  [PASS] 5. Regular user accessing /api/admin/users returns 403
  [PASS] 6. Regular user attempting to authenticate at /api/admin/auth/login returns 403
  [PASS] 7. Admin successfully authenticates at /api/admin/auth/login
  [PASS] 8. Admin GET /api/admin/auth/me returns admin role
  [PASS] 9. Admin dashboard stats returns live numbers
  [PASS] 10. Admin can list users with pagination and search
  [PASS] 11. Admin can suspend regular user with documented reason
  [PASS] 12. Suspended user login is rejected with 403 and suspension reason
  [PASS] 13. Suspended user token blocked from authenticated endpoints
  [PASS] 14. Admin can reactivate suspended user
  [PASS] 15. Reactivated user can log in normally
  [PASS] 16. Admin can restrict capabilities (e.g. submit_story)
  [PASS] 17. User restricted from submit_story is blocked (403)
  [PASS] 18. Admin can lift capability restrictions
  [PASS] 19. Admin can promote user to reviewer
  [PASS] 20. Admin can create new admin account
  [PASS] 21. Newly created admin can log in
  [PASS] 22. Secondary admin can be demoted back to user
  [PASS] 23. Preventing demotion of the last active administrator (safeguard)
  [PASS] 24. Admin can list stories with moderation status
  [PASS] 25. Admin can moderate story (approve/flag/reject with reason)
  [PASS] 26. Admin can fetch immutable audit logs
  [PASS] 27. Audit logs contain recorded administrative actions
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

### Admin Management & Moderation Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/admin/auth/login` | Public (Admin credentials) | Dedicated admin authentication; returns admin JWT |
| `GET` | `/api/admin/auth/me` | Admin | Verify admin session and fetch admin profile |
| `GET` | `/api/admin/dashboard/stats` | Admin | Real-time platform metrics (users, stories, status counts) |
| `GET` | `/api/admin/users` | Admin | List & search users (filters: search, role, status, page, limit) |
| `GET` | `/api/admin/users/:id` | Admin | View full user profile, restrictions & submitted stories |
| `PUT` | `/api/admin/users/:id/status` | Admin | Suspend or reactivate user with documented reason |
| `PUT` | `/api/admin/users/:id/restrictions` | Admin | Restrict/unrestrict capabilities (`submit_story`, `listen_audio`, `comment`) |
| `PUT` | `/api/admin/users/:id/role` | Admin | Update user role (`user`, `reviewer`, `admin`) with safeguards |
| `DELETE` | `/api/admin/users/:id` | Admin | Soft-delete (preserve stories) or permanent delete account |
| `GET` | `/api/admin/stories` | Admin | List & search stories (filters: search, status, language, page, limit) |
| `GET` | `/api/admin/stories/:id` | Admin | Fetch full story content and moderation metadata |
| `PUT` | `/api/admin/stories/:id/moderate` | Admin | Approve, flag, or reject story with documented reason |
| `PUT` | `/api/admin/stories/:id` | Admin | Edit story title, excerpt, content, cultural context, tags |
| `DELETE` | `/api/admin/stories/:id` | Admin | Soft-delete or permanently remove inappropriate story |
| `GET` | `/api/admin/admins` | Admin | List all registered platform administrators |
| `POST` | `/api/admin/admins` | Admin | Provision a new administrator account |
| `PUT` | `/api/admin/admins/:id/demote` | Admin | Demote administrator with last-active-admin safeguard |
| `GET` | `/api/admin/logs` | Admin | Fetch paginated, searchable immutable audit logs |

---

## 👤 Demo Accounts

Pre-seeded accounts available in demo / in-memory mode:

| Role | Email | Password | Name | Access Portal |
|---|---|---|---|---|
| **Administrator** | `admin@kathavani.org` | `AdminKatha@2024!` | Chief Archivist | `/admin/login` (Admin Console) |
| **Storyteller** | `priya@demo.com` | `demo123` | Priya Sharma | Public Website (`/auth`) |
| **Listener** | `arjun@demo.com` | `demo123` | Arjun Mehta | Public Website (`/auth`) |

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

### 4. Admin Governance & Moderation Flow
1. Navigate to `/admin/login` in your browser.
2. Sign in with the administrator credentials (`admin@kathavani.org` / `AdminKatha@2024!`).
3. Explore the **Dashboard** displaying live counters for registered users, active vs. suspended accounts, stories pending review, published stories, and active administrators.
4. Open **User Management** (`/admin/users`) to search users, inspect submitted stories, toggle capability restrictions (e.g. story submission), suspend accounts with documented reasons, or promote accounts.
5. Open **Story Moderation** (`/admin/stories`) to review pending or flagged lore, read full stories, edit narrative excerpts, or approve/reject submissions with feedback.
6. Open **Admin Management** (`/admin/admins`) to provision new administrators or manage existing privileges (protected with last-admin safeguards).
7. Inspect **Activity Logs** (`/admin/logs`) to verify that all administrative actions are captured in the immutable audit trail.
8. Click **Logout** to verify session cleanup and redirect back to `/admin/login`.

---

## 📄 License

MIT License — see `LICENSE` for details.

*Preserving India's oral heritage through technology and living memories.*
