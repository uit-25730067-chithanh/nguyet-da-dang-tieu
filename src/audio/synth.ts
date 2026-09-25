/**
 * Procedural Pentatonic Web Audio Synthesizer
 * Generates traditional plucked string, wind chime, and flute tones algorithmically.
 */

export class PentatonicSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private delayFilter: BiquadFilterNode | null = null;

  private isMuted = false;
  private currentVolume = 0.65;

  constructor() {
    // Lazy initialized on first user interaction to comply with Autoplay Policy
  }

  private initAudioContext(): void {
    if (this.ctx) return;

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    // 1. Master Dynamics Compressor (Limiter prevents audio crackling/clipping)
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

    // 2. Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.currentVolume, this.ctx.currentTime);

    // 3. Ambient Delay / Reverb Feedback Network
    this.delayNode = this.ctx.createDelay(1.0);
    this.delayNode.delayTime.setValueAtTime(0.42, this.ctx.currentTime);

    this.delayFeedback = this.ctx.createGain();
    this.delayFeedback.gain.setValueAtTime(0.38, this.ctx.currentTime);

    this.delayFilter = this.ctx.createBiquadFilter();
    this.delayFilter.type = 'lowpass';
    this.delayFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);

    // Audio Graph Routing:
    // Delay -> Filter -> Feedback -> Delay
    this.delayNode.connect(this.delayFilter);
    this.delayFilter.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);

    // Delay Bus -> Compressor
    this.delayFilter.connect(this.compressor);

    // Master -> Compressor -> Destination
    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.ctx.destination);
  }

  public async resume(): Promise<void> {
    this.initAudioContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
      console.log('🎵 Web Audio Context successfully resumed.');
    }
  }

  /**
   * Play Dan Tranh / Bell plucked note
   */
  public playPluck(frequency: number, volume = 0.5): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;

    // Primary Sine Oscillator (Warm fundamental tone)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(frequency, now);

    // Harmonic Triangle Oscillator (Metallic string shimmer)
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(frequency * 2.0, now);

    // Gain Envelope for Pluck (ADSR: Ultra-fast attack, exponential decay)
    const noteGain = this.ctx.createGain();
    noteGain.gain.setValueAtTime(0.001, now);
    noteGain.gain.linearRampToValueAtTime(volume * 0.7, now + 0.006);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

    // Connect oscillators
    osc1.connect(noteGain);
    osc2.connect(noteGain);

    // Send to Master and Delay Reverb bus
    noteGain.connect(this.masterGain);
    if (this.delayNode) {
      noteGain.connect(this.delayNode);
    }

    osc1.start(now);
    osc2.start(now);

    osc1.stop(now + 3.0);
    osc2.stop(now + 3.0);
  }

  /**
   * Play gentle bamboo flute tone
   */
  public playFluteTone(frequency: number, duration = 2.5, volume = 0.35): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, now);

    // Filter simulating bamboo resonance
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, now);
    filter.Q.setValueAtTime(2.0, now);

    const noteGain = this.ctx.createGain();
    noteGain.gain.setValueAtTime(0.001, now);
    // Soft flute attack
    noteGain.gain.linearRampToValueAtTime(volume * 0.5, now + 0.28);
    // Sustain & gentle decay
    noteGain.gain.setValueAtTime(volume * 0.5, now + duration - 0.4);
    noteGain.gain.linearRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(noteGain);

    noteGain.connect(this.masterGain);
    if (this.delayNode) {
      noteGain.connect(this.delayNode);
    }

    osc.start(now);
    osc.stop(now + duration + 0.1);
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : this.currentVolume;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }
}
