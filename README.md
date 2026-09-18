# 🧠 COGNIVA — Cognitive Gaming & Memory Assistance Platform

> A premium HealthTech application for elderly patients with memory decline, built for North East India.
> Designed to feel like a friendly digital companion — not a clinical dashboard.

---

## ✨ Features

| Phase | Feature |
|-------|---------|
| 🎨 Phase 1 | Patient Home UI — time-aware greeting, large action cards, MIRA assistant |
| 🎮 Phase 2 | Cognitive Games Hub — Memory Match (NE Indian emojis 🦏🧣🎋☕) + Daily Sequence |
| 🔄 Phase 3 | Offline-First PWA — auto-syncs game results to Flask backend when online |
| 📊 Phase 4 | Caregiver Analytics Dashboard — trend charts, attention alerts (Recharts) |
| 🌐 Phase 5 | Localisation Engine — English / हिंदी / অসমীয়া (instant, no reload) |

---

## 🚀 Quick Start — Run on Any Computer

### Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18 or higher | https://nodejs.org |
| Python | 3.10 or higher | https://www.python.org |
| Git | any | https://git-scm.com |

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/abhishekcse025-cse/AI-Based-Cognitive-Gaming-and-Memory-Assistance-Platform-for-Elderly-Dementia-Patients-in-NER.git
cd AI-Based-Cognitive-Gaming-and-Memory-Assistance-Platform-for-Elderly-Dementia-Patients-in-NER
```

---

### Step 2 — Install frontend dependencies

```bash
npm install
```

---

### Step 3 — Install backend dependencies

```bash
cd backend
pip install flask flask-cors
cd ..
```

---

### Step 4 — Run the app (two terminals)

**Terminal 1 — Frontend (React)**
```bash
npm run dev
```
Open **http://localhost:5173** in your browser.

**Terminal 2 — Backend (Flask API)**
```bash
# Windows
python backend/app.py

# Mac / Linux
python3 backend/app.py
```
API runs on **http://localhost:5000**.

---

### ⚡ One-command start (Windows)

Double-click **`start.bat`** in the project root — it opens both servers automatically.

### ⚡ One-command start (Mac / Linux)

```bash
chmod +x start.sh && ./start.sh
```

---

## 📁 Project Structure

```
cogniva-frontend/
├── backend/
│   ├── app.py              # Flask REST API (SQLite WAL, /api/sync, /api/analytics)
│   └── requirements.txt    # Python dependencies
├── src/
│   ├── components/
│   │   ├── patient/        # PatientHomeScreen, ActionCards, GreetingHeader, BottomNav
│   │   ├── mira/           # MIRA floating assistant button + panel
│   │   ├── accessibility/  # TextSize, Contrast, Motion, Language settings panel
│   │   └── layout/         # AppShell, PatientLayout
│   ├── context/
│   │   ├── AccessibilityContext.tsx   # Font size, contrast, language (persisted)
│   │   ├── LanguageContext.tsx        # Dictionary engine (en/hi/as)
│   │   └── MiraContext.tsx            # MIRA voice assistant state
│   ├── games/
│   │   ├── MemoryMatch.tsx    # AI adaptive card-matching game (levels 1–4)
│   │   ├── DailySequence.tsx  # Daily routine recall game
│   │   └── GameShared.tsx     # Shared GameHeader, StatsBar, CompletionScreen
│   ├── screens/
│   │   ├── GameHub.tsx              # Game selector
│   │   ├── CaregiverDashboard.tsx   # Analytics charts (Recharts)
│   │   └── PlaceholderScreens.tsx   # MyDay, Reminders, Memories, Settings
│   ├── services/
│   │   └── syncService.ts    # Offline-first sync bridge
│   └── utils/
│       ├── adaptiveEngine.ts # Staircase difficulty algorithm
│       └── storage.ts        # localStorage session management
├── start.bat               # Windows one-click launcher
├── start.sh                # Mac/Linux one-click launcher
└── vite.config.ts          # Vite + PWA config
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/sync` | Sync game sessions (idempotent upserts) |
| GET | `/api/analytics` | Moving average trends + attention flag |

---

## 🎮 Cognitive Games

### Memory Match
- NE Indian cultural emojis: 🦏 Rhino, 🧣 Gamusa, 🎋 Bamboo, ☕ Assamese Tea, 🌸 Orchid, 🐘 Elephant
- **AI Adaptive Engine**: 4 levels (3/4/5/6 pairs), auto-adjusts difficulty based on accuracy & time
- 2-Miss Rule: subtle hint after missing the same pair twice
- 12s idle hint: gentle pulse if no interaction

### Daily Sequence
- Arrange familiar daily activities in the correct order
- Large 80px touch targets with up/down arrow controls

---

## ♿ Accessibility Features

- Minimum **64px touch targets** throughout
- **Text size control**: Small / Default / Large / Extra-Large
- **High contrast mode**
- **Reduced motion** toggle (respects OS preference)
- **Multi-language**: English / हिंदी (Hindi) / অসমীয়া (Assamese)

---

## 🔒 Caregiver Access

Hold the discreet 🔒 lock icon in the top-right corner of the home screen for **1.5 seconds** to access the Caregiver Analytics Dashboard.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite 8 |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Animation | Framer Motion |
| Charts | Recharts |
| PWA | vite-plugin-pwa (Workbox) |
| Backend | Python Flask 3 + Flask-CORS |
| Database | SQLite (WAL mode) |
| Icons | Lucide React |

---

## 📸 Screenshots

> Patient Home Screen · Memory Match Game · Caregiver Dashboard · Hindi Localisation

---

*Built with ❤️ for elderly patients in North East India.*
