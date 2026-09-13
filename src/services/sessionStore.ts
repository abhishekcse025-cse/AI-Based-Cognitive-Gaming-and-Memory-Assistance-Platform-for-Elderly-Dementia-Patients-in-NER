import {
  PatientProfile,
  GameSessionRecord,
  QueuedAttempt,
  DifficultyLevel,
  GameType,
  AdaptiveDifficultyRequest,
  AdaptiveDifficultyResponse,
} from '../types/api';

// Pre-configured patient profiles
export const INITIAL_PATIENTS: PatientProfile[] = [
  {
    id: 'P-101',
    name: 'Margaret Taylor',
    age: 78,
    avatarColor: '#1E40AF',
    currentMemoryDifficulty: 'easy',
    currentSequenceDifficulty: 'easy',
  },
  {
    id: 'P-102',
    name: 'Arthur Davis',
    age: 82,
    avatarColor: '#065F46',
    currentMemoryDifficulty: 'medium',
    currentSequenceDifficulty: 'easy',
  },
  {
    id: 'P-103',
    name: 'Dorothy Miller',
    age: 74,
    avatarColor: '#7C2D12',
    currentMemoryDifficulty: 'easy',
    currentSequenceDifficulty: 'medium',
  },
];

// Sample seed session history so Caregiver Dashboard has rich data out of the box
const INITIAL_SESSIONS: GameSessionRecord[] = [
  {
    id: 'sess-1',
    timestamp: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    patient_id: 'P-101',
    patient_name: 'Margaret Taylor',
    game_type: 'memory_match',
    difficulty: 'easy',
    total_moves: 6,
    errors_made: 1,
    time_taken_seconds: 22.4,
    completed: true,
    performance: 'good',
    next_difficulty: 'medium',
    synced_to_backend: true,
  },
  {
    id: 'sess-2',
    timestamp: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    patient_id: 'P-101',
    patient_name: 'Margaret Taylor',
    game_type: 'memory_match',
    difficulty: 'medium',
    total_moves: 14,
    errors_made: 4,
    time_taken_seconds: 38.1,
    completed: true,
    performance: 'average',
    next_difficulty: 'medium',
    synced_to_backend: true,
  },
  {
    id: 'sess-3',
    timestamp: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    patient_id: 'P-101',
    patient_name: 'Margaret Taylor',
    game_type: 'sequence',
    difficulty: 'easy',
    total_moves: 3,
    errors_made: 0,
    time_taken_seconds: 18.2,
    completed: true,
    performance: 'good',
    next_difficulty: 'medium',
    synced_to_backend: true,
  },
];

type Listener = () => void;

class SessionStore {
  private patients: PatientProfile[] = [...INITIAL_PATIENTS];
  private activePatientId: string = 'P-101';
  private sessions: GameSessionRecord[] = [...INITIAL_SESSIONS];
  private offlineQueue: QueuedAttempt[] = [];
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  getPatients(): PatientProfile[] {
    return this.patients;
  }

  getActivePatient(): PatientProfile {
    const found = this.patients.find((p) => p.id === this.activePatientId);
    return found || this.patients[0];
  }

  setActivePatient(patientId: string) {
    this.activePatientId = patientId;
    this.notify();
  }

  // Register or log in a custom player name
  addOrLoginPatient(name: string, patientId?: string): PatientProfile {
    const trimmedName = name.trim();
    if (!trimmedName) return this.getActivePatient();

    // Check if patient already exists by name or ID
    const existing = this.patients.find(
      (p) =>
        p.name.toLowerCase() === trimmedName.toLowerCase() ||
        (patientId && p.id.toLowerCase() === patientId.trim().toLowerCase())
    );

    if (existing) {
      this.activePatientId = existing.id;
      this.notify();
      return existing;
    }

    // Create new profile
    const newId = patientId && patientId.trim()
      ? patientId.trim()
      : `P-${100 + this.patients.length + 1}`;

    const avatarColors = ['#1E40AF', '#065F46', '#7C2D12', '#7E22CE', '#BE185D', '#0369A1'];
    const newPatient: PatientProfile = {
      id: newId,
      name: trimmedName,
      age: 75,
      avatarColor: avatarColors[this.patients.length % avatarColors.length],
      currentMemoryDifficulty: 'easy',
      currentSequenceDifficulty: 'easy',
    };

    this.patients.push(newPatient);
    this.activePatientId = newPatient.id;
    this.notify();
    return newPatient;
  }

  getCurrentDifficulty(gameType: GameType): DifficultyLevel {
    const patient = this.getActivePatient();
    return gameType === 'memory_match'
      ? patient.currentMemoryDifficulty
      : patient.currentSequenceDifficulty;
  }

  setDifficulty(patientId: string, gameType: GameType, difficulty: DifficultyLevel) {
    this.patients = this.patients.map((p) => {
      if (p.id === patientId) {
        if (gameType === 'memory_match') {
          return { ...p, currentMemoryDifficulty: difficulty };
        } else {
          return { ...p, currentSequenceDifficulty: difficulty };
        }
      }
      return p;
    });
    this.notify();
  }

  getSessions(patientId?: string): GameSessionRecord[] {
    if (patientId) {
      return this.sessions.filter((s) => s.patient_id === patientId);
    }
    return this.sessions;
  }

  recordSession(
    request: AdaptiveDifficultyRequest,
    response: AdaptiveDifficultyResponse,
    synced: boolean
  ): GameSessionRecord {
    const patient = this.patients.find((p) => p.id === request.patient_id);
    const newRecord: GameSessionRecord = {
      id: `sess-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      patient_id: request.patient_id,
      patient_name: patient ? patient.name : 'Unknown Patient',
      game_type: request.game_type,
      difficulty: request.current_difficulty,
      total_moves: request.total_moves,
      errors_made: request.errors_made,
      time_taken_seconds: request.time_taken_seconds,
      completed: request.completed,
      performance: response.performance,
      next_difficulty: response.next_difficulty,
      synced_to_backend: synced,
    };

    // Update difficulty for next time
    this.setDifficulty(request.patient_id, request.game_type, response.next_difficulty);

    this.sessions.unshift(newRecord);
    this.notify();
    return newRecord;
  }

  // Local Offline Queue
  addToQueue(payload: AdaptiveDifficultyRequest, errorReason?: string): QueuedAttempt {
    const queued: QueuedAttempt = {
      id: `queue-${Date.now()}`,
      payload,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      lastError: errorReason || 'Network request failed',
    };
    this.offlineQueue.push(queued);
    console.warn('[Queue] Attempt queued locally for later sync:', queued);
    this.notify();
    return queued;
  }

  getQueue(): QueuedAttempt[] {
    return this.offlineQueue;
  }

  removeFromQueue(id: string) {
    this.offlineQueue = this.offlineQueue.filter((q) => q.id !== id);
    this.notify();
  }

  clearQueue() {
    this.offlineQueue = [];
    this.notify();
  }
}

export const sessionStore = new SessionStore();
