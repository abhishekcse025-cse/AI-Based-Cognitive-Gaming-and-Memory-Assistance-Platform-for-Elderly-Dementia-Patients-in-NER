# 🧠 COGNIVA — Cognitive Gaming & Memory Assistance Platform

> A premium HealthTech application for elderly patients with memory decline, built for North East India.
> Designed to feel like a friendly digital companion — not a clinical dashboard.

---

## 🚀 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** (Vercel) | *(set after deployment)* |
| **Backend API** (Render) | *(set after deployment)* |

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

## 🖥️ Run Locally — Any Computer

### Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18 or higher | https://nodejs.org |
| Python | 3.10 or higher | https://www.python.org |
| Git | any | https://git-scm.com |

### Step 1 — Clone

```bash
git clone https://github.com/abhishekcse025-cse/AI-Based-Cognitive-Gaming-and-Memory-Assistance-Platform-for-Elderly-Dementia-Patients-in-NER.git
cd AI-Based-Cognitive-Gaming-and-Memory-Assistance-Platform-for-Elderly-Dementia-Patients-in-NER
```

### Step 2 — Install dependencies

```bash
# Frontend
npm install

# Backend
pip install -r backend/requirements.txt
```

### Step 3 — Start both servers

**Windows — double-click `start.bat`**

**Mac / Linux:**
```bash
chmod +x start.sh && ./start.sh
```

**Or manually (two terminals):**
```bash
# Terminal 1 — Frontend (accessible on your LAN too)
npm run dev

# Terminal 2 — Backend
python backend/app.py   # Windows
python3 backend/app.py  # Mac/Linux
```

Open **http://localhost:5173** — or from another device on the same WiFi: **http://YOUR-IP:5173**

---

## ☁️ Deploy to the Internet (Vercel + Render)

### Architecture

```
Browser / Mobile
      ↓
 Vercel (React SPA)  ──→  Render.com (Flask API)  ──→  SQLite DB
```

---

### Step A — Deploy Backend to Render.com (FREE)

1. Go to **https://render.com** → Sign up / Log in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Configure:

| Field | Value |
|-------|-------|
| **Name** | `cogniva-api` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn app:app --bind 0.0.0.0:$PORT` |
| **Instance Type** | Free |

5. Click **"Create Web Service"**
6. Wait ~2 minutes → Render gives you a URL like:
   ```
   https://cogniva-api.onrender.com
   ```
   Test it: `https://cogniva-api.onrender.com/api/health` → should return `{"status":"ok"}`

---

### Step B — Deploy Frontend to Vercel (FREE)

1. Go to **https://vercel.com** → Sign up / Log in with GitHub
2. Click **"Add New Project"** → Import your GitHub repo
3. Configure:

| Field | Value |
|-------|-------|
| **Framework Preset** | `Vite` |
| **Root Directory** | `.` (leave default) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

4. Add **Environment Variable**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://cogniva-api.onrender.com/api` ← your Render URL |

5. Click **"Deploy"**
6. Vercel gives you a URL like: `https://cogniva-abc123.vercel.app`

> 🎉 Share that Vercel URL — anyone can open the app on any device anywhere in the world!

---

## 📁 Project Structure

```
cogniva-frontend/
├── backend/
│   ├── app.py              # Flask REST API
│   ├── requirements.txt    # flask, flask-cors, gunicorn
│   ├── Procfile            # Render.com start command
│   └── cogniva.db          # SQLite database (auto-created)
├── src/
│   ├── components/
│   │   ├── patient/        # Home screen, action cards, bottom nav
│   │   ├── mira/           # MIRA floating assistant
│   │   ├── accessibility/  # Settings panel (font/contrast/language)
│   │   └── layout/         # AppShell, PatientLayout
│   ├── context/
│   │   ├── AccessibilityContext.tsx
│   │   ├── LanguageContext.tsx   # en / hi / as dictionary
│   │   └── MiraContext.tsx
│   ├── games/
│   │   ├── MemoryMatch.tsx       # AI adaptive card-matching
│   │   ├── DailySequence.tsx     # Daily routine recall
│   │   └── GameShared.tsx
│   ├── screens/
│   │   ├── GameHub.tsx
│   │   ├── CaregiverDashboard.tsx
│   │   └── PlaceholderScreens.tsx
│   └── services/
│       └── syncService.ts        # Offline-first sync bridge
├── vercel.json             # Vercel SPA routing + caching
├── start.bat               # Windows one-click launcher
├── start.sh                # Mac/Linux one-click launcher
└── vite.config.ts          # Vite + PWA + network host
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/sync` | Sync game sessions |
| GET | `/api/analytics` | Moving average trends + attention flag |

---

## ♿ Accessibility

- Minimum **64px touch targets** throughout
- **Text size control** — Small / Default / Large / Extra-Large  
- **High contrast mode**
- **Reduced motion** toggle (respects OS `prefers-reduced-motion`)
- **Multi-language** — English / हिंदी / অসমীয়া

## 🔒 Caregiver Access

Hold the discreet 🔒 lock icon (top-right, 25% opacity) for **1.5 seconds** → opens the Caregiver Analytics Dashboard.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite 8 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Charts | Recharts |
| PWA | vite-plugin-pwa (Workbox) |
| Backend | Python Flask 3 + gunicorn |
| Database | SQLite (WAL mode) |
| Hosting | Vercel (frontend) + Render.com (backend) |

---

*Built with ❤️ for elderly patients in North East India.*
