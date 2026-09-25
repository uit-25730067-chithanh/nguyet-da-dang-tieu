/**
 * Bộ Quản Lý Hiệu Năng & Cấu Hình Đồ Họa (Performance & Quality Manager)
 * Đảm bảo 60 FPS mượt mà và tự động hạ cấp cấu hình khi cần thiết.
 */

export type QualityTier = 'high' | 'medium' | 'low';

export class PerfManager {
  private fpsHistory: number[] = [];
  private readonly windowSize = 60; // 60 frames sliding window (~1s)
  private lastTime = performance.now();
  private frames = 0;
  private currentTier: QualityTier = 'high';
  private onTierChangeCallbacks: ((tier: QualityTier) => void)[] = [];
  private fpsDisplayElement: HTMLElement | null = null;
  private isContextLost = false;

  constructor() {
    if (typeof document !== 'undefined') {
      this.fpsDisplayElement = document.getElementById('fps-counter');
    }
  }

  public update(): void {
    const now = performance.now();
    this.frames++;

    if (now - this.lastTime >= 500) {
      const fps = Math.round((this.frames * 1000) / (now - this.lastTime));
      this.fpsHistory.push(fps);
      if (this.fpsHistory.length > this.windowSize) {
        this.fpsHistory.shift();
      }

      this.frames = 0;
      this.lastTime = now;

      if (this.fpsDisplayElement) {
        this.fpsDisplayElement.textContent = `${fps} FPS`;
      }

      this.evaluateTier();
    }
  }

  private evaluateTier(): void {
    if (this.fpsHistory.length < 4) return;

    const avgFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;

    if (avgFps < 28 && this.currentTier !== 'low') {
      this.setTier('low');
    } else if (avgFps >= 28 && avgFps < 48 && this.currentTier === 'high') {
      this.setTier('medium');
    } else if (avgFps >= 55 && this.currentTier === 'low') {
      this.setTier('medium');
    }
  }

  public setTier(tier: QualityTier): void {
    if (this.currentTier === tier) return;
    this.currentTier = tier;
    console.log(`[PerfManager] Quality tier adapted to: ${tier.toUpperCase()}`);
    this.onTierChangeCallbacks.forEach((cb) => cb(tier));
  }

  public getTier(): QualityTier {
    return this.currentTier;
  }

  public onTierChange(callback: (tier: QualityTier) => void): void {
    this.onTierChangeCallbacks.push(callback);
  }

  public setContextLost(lost: boolean): void {
    this.isContextLost = lost;
  }

  public getContextLost(): boolean {
    return this.isContextLost;
  }
}
