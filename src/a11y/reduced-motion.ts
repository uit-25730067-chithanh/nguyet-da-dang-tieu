/**
 * Hỗ Trợ Chế Độ Giảm Chuyển Động (Reduced Motion Accessibility)
 */

export class ReducedMotionManager {
  private mediaQuery: MediaQueryList;
  private isReduced = false;
  private onChangeCallbacks: ((reduced: boolean) => void)[] = [];

  constructor() {
    this.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.isReduced = this.mediaQuery.matches;

    this.mediaQuery.addEventListener('change', (e) => {
      this.isReduced = e.matches;
      console.log(`[A11y] Prefers-reduced-motion changed: ${this.isReduced}`);
      this.onChangeCallbacks.forEach((cb) => cb(this.isReduced));
    });
  }

  public getMotionMultiplier(): number {
    return this.isReduced ? 0.25 : 1.0;
  }

  public getIsReduced(): boolean {
    return this.isReduced;
  }

  public onChange(callback: (reduced: boolean) => void): void {
    this.onChangeCallbacks.push(callback);
  }
}
