/**
 * Nguyệt Dạ Đăng Tiêu — Lõi Khởi Động
 * Tết Trung Thu 2026 • uit-25730067-chithanh
 */

import { SceneManager } from './graphics/scene-manager';

console.log('🌕 Nguyệt Dạ Đăng Tiêu (The Moonlit Lantern Sanctuary) initializing...');

const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
const splashOverlay = document.getElementById('splash-overlay');
const btnEnter = document.getElementById('btn-enter');

let sceneManager: SceneManager | null = null;

if (canvas) {
  sceneManager = new SceneManager(canvas);
  sceneManager.start();
  console.log('✨ 3D Scene Manager initialized and started.');
}

if (btnEnter && splashOverlay) {
  btnEnter.addEventListener('click', () => {
    splashOverlay.style.opacity = '0';
    setTimeout(() => {
      splashOverlay.classList.add('hidden');
    }, 800);
  });
}
