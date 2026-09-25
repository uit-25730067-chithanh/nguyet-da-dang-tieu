/**
 * 2.5D Fallback Canvas 2D Renderer
 * Ensures full interactive experience even without WebGL or upon WebGL context loss.
 */

import { LanternStore, LanternItem } from '../state/lantern-store';

export class FallbackCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private lanternStore: LanternStore;
  private isRunning = false;
  private animId?: number;
  private stars: Array<{ x: number; y: number; r: number; phase: number }> = [];

  constructor(canvas: HTMLCanvasElement, lanternStore: LanternStore) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D context not available');
    this.ctx = context;
    this.lanternStore = lanternStore;
    this.resize();
    window.addEventListener('resize', this.resize.bind(this));
    this.initStars();
  }

  private resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.scale(dpr, dpr);
  }

  private initStars(): void {
    for (let i = 0; i < 120; i++) {
      this.stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * (window.innerHeight * 0.55),
        r: 0.8 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animId) cancelAnimationFrame(this.animId);
  }

  private animate = (): void => {
    if (!this.isRunning) return;
    this.render();
    this.animId = requestAnimationFrame(this.animate);
  };

  private render(): void {
    const ctx = this.ctx;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const time = performance.now() * 0.001;

    ctx.clearRect(0, 0, w, h);

    // 1. Night Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
    skyGrad.addColorStop(0, '#060814');
    skyGrad.addColorStop(1, '#0e1633');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.65);

    // 2. Stars
    ctx.fillStyle = '#fff9db';
    this.stars.forEach((star) => {
      ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(time * 1.5 + star.phase));
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // 3. Full Moon & Halo
    const moonX = w * 0.5, moonY = h * 0.26, moonRadius = Math.min(w, h) * 0.09;
    const haloGrad = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.8, moonX, moonY, moonRadius * 2.8);
    haloGrad.addColorStop(0, 'rgba(255, 235, 160, 0.45)');
    haloGrad.addColorStop(0.5, 'rgba(255, 209, 92, 0.15)');
    haloGrad.addColorStop(1, 'rgba(6, 8, 20, 0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius * 2.8, 0, Math.PI * 2);
    ctx.fill();

    const moonGrad = ctx.createRadialGradient(moonX - moonRadius * 0.25, moonY - moonRadius * 0.25, 2, moonX, moonY, moonRadius);
    moonGrad.addColorStop(0, '#ffffff');
    moonGrad.addColorStop(0.85, '#fff2b2');
    moonGrad.addColorStop(1, '#ffd15c');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fill();

    // 4. River Water Surface & Moonlight Trail
    const riverY = h * 0.58;
    const waterGrad = ctx.createLinearGradient(0, riverY, 0, h);
    waterGrad.addColorStop(0, '#0a142e');
    waterGrad.addColorStop(1, '#040714');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, riverY, w, h - riverY);

    const trailGrad = ctx.createRadialGradient(moonX, riverY + 40, 10, moonX, riverY + 120, w * 0.35);
    trailGrad.addColorStop(0, 'rgba(255, 235, 170, 0.35)');
    trailGrad.addColorStop(1, 'rgba(10, 20, 46, 0)');
    ctx.fillStyle = trailGrad;
    ctx.fillRect(moonX - w * 0.35, riverY, w * 0.7, h - riverY);

    // 5. Render Lanterns Floating
    const lanterns = this.lanternStore.getAll();
    lanterns.forEach((item: LanternItem, index: number) => {
      // Screen projection
      const screenX = w * 0.5 + item.x * (w * 0.018);
      const bobbing = Math.sin(time * 2.0 + item.phase) * 6;
      let screenY: number;

      if (item.type === 'lotus') {
        const depth = Math.max(0.1, 1.0 - (item.z + 50) / 100);
        screenY = riverY + 40 + (item.z + 40) * (h * 0.005) + bobbing;
        this.drawLotusLantern2D(ctx, screenX, screenY, depth, time + index);
      } else {
        screenY = Math.max(80, h * 0.5 - (item.y * 8) + bobbing);
        this.drawStarLantern2D(ctx, screenX, screenY, time + index);
      }
    });
  }

  private drawLotusLantern2D(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, time: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * 0.85, scale * 0.85);
    // Candle Glow & Halo
    const glow = ctx.createRadialGradient(0, -6, 2, 0, -6, 24);
    glow.addColorStop(0, 'rgba(255, 214, 102, 0.9)');
    glow.addColorStop(1, 'rgba(255, 157, 46, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, -6, 24, 0, Math.PI * 2);
    ctx.fill();
    // Lotus Petals
    ctx.fillStyle = '#ff758f';
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI - Math.PI / 2;
      ctx.beginPath();
      ctx.ellipse(Math.cos(angle) * 12, Math.sin(angle) * 6, 8, 4, angle, 0, Math.PI * 2);
      ctx.fill();
    }
    // Flame
    const flicker = 1.0 + Math.sin(time * 10) * 0.2;
    ctx.fillStyle = '#ffe600';
    ctx.beginPath();
    ctx.arc(0, -8, 3.5 * flicker, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawStarLantern2D(ctx: CanvasRenderingContext2D, x: number, y: number, time: number): void {
    ctx.save();
    ctx.translate(x, y);
    const flicker = 1.0 + Math.sin(time * 8) * 0.15;

    // Star Aura
    const aura = ctx.createRadialGradient(0, 0, 2, 0, 0, 26);
    aura.addColorStop(0, 'rgba(255, 77, 109, 0.7)');
    aura.addColorStop(1, 'rgba(230, 57, 70, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();

    // 5-point Star
    ctx.fillStyle = '#e63946';
    ctx.strokeStyle = '#ffd15c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const r = i % 2 === 0 ? 14 * flicker : 6.5;
      if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
      else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}
