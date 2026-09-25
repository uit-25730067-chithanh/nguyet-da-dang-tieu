import { PentatonicSynthesizer } from './synth';
import { getRandomPentatonicNote, PENTATONIC_SCALE } from './pentatonic-scales';

export class AmbientSequencer {
  private synth: PentatonicSynthesizer;
  private isRunning = false;
  private timer?: number;

  constructor(synth: PentatonicSynthesizer) {
    this.synth = synth;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.scheduleNextNote();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.timer) {
      window.clearTimeout(this.timer);
    }
  }

  private scheduleNextNote(): void {
    if (!this.isRunning) return;

    // Random interval between 3.2s and 6.0s for meditative calm pacing
    const delay = 3200 + Math.random() * 2800;

    this.timer = window.setTimeout(() => {
      this.playGenerativeNote();
      this.scheduleNextNote();
    }, delay);
  }

  private playGenerativeNote(): void {
    if (this.synth.getIsMuted()) return;

    const action = Math.random();

    if (action < 0.6) {
      // 60% Chance: Bell / Pluck note in Octave 4 or 5
      const note = getRandomPentatonicNote(Math.random() > 0.5 ? 4 : 5);
      this.synth.playPluck(note.frequency, 0.45);
    } else if (action < 0.85) {
      // 25% Chance: Warm flute tone in Octave 4
      const note = getRandomPentatonicNote(4);
      this.synth.playFluteTone(note.frequency, 2.8, 0.3);
    } else {
      // 15% Chance: Two-note harmonic chord (e.g. Hò + Xê / C + G)
      const baseNote = getRandomPentatonicNote(4);
      const harmonyNote = PENTATONIC_SCALE.find(
        (n) => n.octave === 5 && n.name.startsWith(baseNote.name.substring(0, 1))
      ) || getRandomPentatonicNote(5);

      this.synth.playPluck(baseNote.frequency, 0.4);
      setTimeout(() => {
        this.synth.playPluck(harmonyNote.frequency, 0.35);
      }, 180);
    }
  }
}
