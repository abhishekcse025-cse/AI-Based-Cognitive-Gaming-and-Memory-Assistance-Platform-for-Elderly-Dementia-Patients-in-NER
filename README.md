# Cognitive Care Companion (SIH26003)

A mobile-first React Native (Expo) cognitive gaming and memory assistance application engineered specifically for elderly dementia patients (ages 65–85) and their caregivers.

---

## 👵 Dementia-First Accessibility Design Language

The entire interface is built strictly around the physiological and cognitive constraints of elderly dementia users:

1. **High Contrast Only**: Pure dark text (`#1A1A1A`) on soft light backgrounds (`#FFFFFF` and `#F5F5F0`). No mid-gray on white, no pastel-on-pastel.
2. **Oversized Tap Targets (64x64dp minimum)**: Buttons and interactive cards measure between 76dp and 88dp in height with large touch bounding boxes ("TV remote for grandma" tactile affordance).
3. **One Primary Action per Screen**: Uncluttered screens that eliminate confusing multi-tier navigation.
4. **Large Typography**: Minimum 20sp for all body text, 28sp+ for primary headings, numbers, and action labels.
5. **Paired Icons + Text Labels**: Every interactive control pairs an icon with a prominent text label — never icon-only.
6. **Slow, Gentle Transitions (350ms)**: Soft fade animations prevent visual disorientation.
7. **Colorblind-Safe Indicators**: Success and error states pair distinct colors with unambiguous geometric icons (✓ / ✗) and pleasant acoustic cues (Web Audio synthesizer).
8. **Gentle Phrasing**: End-of-game evaluations always offer encouraging, dignifying language without discouraging words for poor performance.

---

## 📱 Screens & Architecture

```
                 ┌───────────────┐
                 │  LoginScreen  │
                 └───────┬───────┘
          ┌──────────────┴──────────────┐
          │ (Caregiver Portal)          │ (Start as Patient)
          ▼                             ▼
┌───────────────────┐          ┌───────────────────┐
│Caregiver Dashboard│          │ GameSelect Screen │
└───────────────────┘          └─────────┬─────────┘
                               ┌─────────┴─────────┐
                               ▼                   ▼
                      ┌─────────────────┐ ┌─────────────────┐
                      │  Memory Match   │ │ Daily Sequence  │
                      └────────┬────────┘ └────────┬────────┘
                               └─────────┬─────────┘
                                         ▼
                             ┌───────────────────────┐
                             │ Gentle Feedback Modal │
                             │  (Adaptive POST API)  │
                             └───────────────────────┘
```

### 1. Login Screen (`src/screens/LoginScreen.tsx`)
- **Patient Profile Selector**: Pre-configured profiles (`Margaret P-101`, `Arthur P-102`, `Dorothy P-103`). No passwords or typing required for the patient.
- **Massive START Button**: High affordance, single-tap launch.
- **Discreet Caregiver Portal Toggle**: Secure entry point at the top header leading to the Caregiver Dashboard.

### 2. Game Hub (`src/screens/GameSelectScreen.tsx`)
- High-contrast visual choice between Memory Match and Daily Steps.
- Live adaptive difficulty badges (`EASY`, `MEDIUM`, `HARD`).

### 3. Game 1: Memory Match (`src/screens/MemoryMatchScreen.tsx`)
- Card-flip matching game with gentle 350ms flip transitions.
- **Difficulty Progression**:
  - **Easy**: 4 cards (2 pairs), bright distinct colors (Red Apple 🍎 vs Yellow Sun ☀️).
  - **Medium**: 6 cards (3 pairs), distinct items (Blue Water 💧, Green Leaf 🍃, Orange Flower 🌼).
  - **Hard**: 8 cards (4 pairs), shapes with similar teal & cyan palettes to require careful shape discrimination.
- **Metrics Tracked**: `total_moves`, `errors_made`, `time_taken_seconds`, `completed`.
- Prominent **"End Game"** button sets `completed: false` and fires payload.

### 4. Game 2: Daily Sequencing (`src/screens/DailySequencingScreen.tsx`)
- Real-life sequential tasks designed with a motor-friendly **tap-to-place / tap-to-reorder slot system** (far less frustrating than drag-and-drop for tremor/arthritis patients):
  - **Easy (3 steps)**: "Making a Cup of Tea" (Cup → Tea Bag → Hot Water).
  - **Medium (4 steps)**: "Brushing Teeth" (Brush → Paste → Brush Teeth → Rinse).
  - **Hard (5 steps)**: "Getting Dressed" (Undergarments → Shirt → Pants → Socks → Shoes).
- Colorblind-safe (✓ / ✗) validation indicators and undo capability.
- **Metrics Tracked**: `total_moves`, `errors_made`, `time_taken_seconds`, `completed`.

### 5. Caregiver Dashboard (`src/screens/CaregiverDashboardScreen.tsx`)
- Patient overview with real-time level badges.
- **Difficulty Progression Chart**: Visual column chart showing difficulty progression (Easy=1, Medium=2, Hard=3) over sessions.
- **Session History Table**: Date/time, game type, difficulty, completion rate, moves, errors, and next difficulty.
- **Offline Sync Queue**: Shows attempts that encountered network issues, with a one-tap "Retry Sync" action.
- **One-Touch Backend Config**: Instant toggle between Local Mock API and live FastAPI server, plus editable `API_BASE_URL`.

---

## 🔌 Backend Integration (`POST /adaptive-difficulty`)

All difficulty transitions flow through a single typed API client (`src/api/adaptiveDifficulty.ts`). Screen components never hardcode level transitions directly.

### Request Payload Shape
```json
{
  "patient_id": "P-101",
  "game_type": "memory_match",
  "current_difficulty": "medium",
  "total_moves": 8,
  "errors_made": 2,
  "time_taken_seconds": 14.5,
  "completed": true
}
```

### Response Shape
```json
{
  "performance": "good",
  "next_difficulty": "hard"
}
```

### Instant Mock-to-Real Backend Switch
- In `.env` or `.env.example`:
  ```bash
  EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
  EXPO_PUBLIC_USE_MOCK_API=true
  ```
- To connect to the real FastAPI service:
  - Set `EXPO_PUBLIC_USE_MOCK_API=false` in `.env`, **OR**
  - Open the **Caregiver Portal** inside the app and toggle **"Use Mock API"** to OFF.
- If the network fails, the client automatically catches the error, maintains the current difficulty so the patient is not interrupted, and queues the attempt in the local offline queue for later sync.

---

## 🚀 How to Run the App

### Prerequisites
- Node.js (v18+) & npm

### Development Server
```bash
# 1. Open the project folder
cd cognitive-care-companion

# 2. Start Expo
npx expo start

# 3. Choose your testing target:
# Press 'w' to run in Web Browser
# Press 'a' to run in Android Emulator
# Press 'i' to run in iOS Simulator
# Or scan the QR code with the Expo Go app on a physical phone
```

### Web Export Build Check
```bash
npx expo export --platform web
```
