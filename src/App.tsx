import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { AppShell } from './components/layout/AppShell';
import { PatientLayout } from './components/layout/PatientLayout';
import { PatientHomeScreen } from './components/patient/PatientHomeScreen';
import { GameHub } from './screens/GameHub';
import { MemoryMatch } from './games/MemoryMatch';
import { DailySequence } from './games/DailySequence';
import { CaregiverDashboard } from './screens/CaregiverDashboard';
import { MyDay, Reminders, Memories, Settings } from './screens/PlaceholderScreens';

/**
 * COGNIVA Application — Phase 1 + 2 + 3 + 4
 *
 * Routes:
 *   /                        → Patient Home Screen
 *   /my-day                  → My Day (placeholder)
 *   /reminders               → Reminders (placeholder)
 *   /memories                → Memories (placeholder)
 *   /settings                → Settings (placeholder)
 *   /games                   → Game Hub
 *   /games/memory-match      → Memory Match
 *   /games/daily-sequence    → Daily Sequence
 *   /caregiver               → Caregiver Analytics Dashboard
 *   /dashboard               → Caregiver Dashboard (alias — wired from "Family" card)
 */
export default function App() {
  return (
    <BrowserRouter>
      <AccessibilityProvider>
        <AppShell>
          <Routes>
            {/* ── Patient Home ────────────────────────────────────────────── */}
            <Route
              path="/"
              element={
                <PatientLayout activeTab="home">
                  <PatientHomeScreen />
                </PatientLayout>
              }
            />

            {/* ── Placeholder screens ─────────────────────────────────────── */}
            <Route path="/my-day"    element={<MyDay />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/memories"  element={<Memories />} />
            <Route path="/settings"  element={<Settings />} />

            {/* ── Game Hub ─────────────────────────────────────────────────── */}
            <Route path="/games" element={<GameHub />} />

            {/* ── Individual games — full-screen, no bottom nav ───────────── */}
            <Route path="/games/memory-match"   element={<MemoryMatch />} />
            <Route path="/games/daily-sequence" element={<DailySequence />} />

            {/* ── Caregiver Dashboard ─────────────────────────────────────── */}
            <Route path="/caregiver"  element={<CaregiverDashboard />} />
            <Route path="/dashboard"  element={<CaregiverDashboard />} />
          </Routes>
        </AppShell>
      </AccessibilityProvider>
    </BrowserRouter>
  );
}
