import { Platform, Vibration } from 'react-native';

// Audio feedback helper designed with gentle, non-startling sound frequencies.
// On Web, leverages the standard Web Audio API with zero external asset dependencies.
// On Native platforms, provides subtle vibration cues.

class SoundManager {
  private audioCtx: any = null;
  private enabled: boolean = true;

  setEnabled(val: boolean) {
    this.enabled = val;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  private getAudioContext() {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (!this.audioCtx) {
        const AudioCtxClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    }
    return null;
  }

  // Play a soft pleasant tone
  private playTone(frequency: number, durationSeconds: number, type: OscillatorType = 'sine', gainVal = 0.15) {
    if (!this.enabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationSeconds);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationSeconds);
    } catch {
      // Audio autoplay policy or unavailable
    }
  }

  // Tap button feedback: very short, gentle pop
  playTap() {
    if (!this.enabled) return;
    if (Platform.OS === 'web') {
      this.playTone(380, 0.08, 'sine', 0.1);
    } else {
      Vibration.vibrate(20);
    }
  }

  // Correct match / positive feedback: warm two-tone chime (Major 3rd)
  playSuccess() {
    if (!this.enabled) return;
    if (Platform.OS === 'web') {
      const ctx = this.getAudioContext();
      if (ctx) {
        this.playTone(523.25, 0.25, 'sine', 0.15); // C5
        setTimeout(() => {
          this.playTone(659.25, 0.35, 'sine', 0.15); // E5
        }, 120);
      }
    } else {
      Vibration.vibrate([0, 30, 40, 40]);
    }
  }

  // Mild mistake feedback: gentle, non-punishing low tone
  playMistake() {
    if (!this.enabled) return;
    if (Platform.OS === 'web') {
      this.playTone(220, 0.2, 'triangle', 0.12); // A3 gentle low note
    } else {
      Vibration.vibrate(45);
    }
  }

  // Game complete / level up celebration: 3 ascending harmonious notes
  playVictory() {
    if (!this.enabled) return;
    if (Platform.OS === 'web') {
      this.playTone(440, 0.2, 'sine', 0.15); // A4
      setTimeout(() => this.playTone(554.37, 0.2, 'sine', 0.15), 140); // C#5
      setTimeout(() => this.playTone(659.25, 0.4, 'sine', 0.18), 280); // E5
    } else {
      Vibration.vibrate([0, 40, 50, 60, 50, 80]);
    }
  }
}

export const soundManager = new SoundManager();
