/**
 * Nguyệt Dạ Đăng Tiêu — Lõi Khởi Động
 * Tết Trung Thu 2026 • uit-25730067-chithanh
 */

import { SceneManager } from './graphics/scene-manager';
import { LanternStore } from './state/lantern-store';
import { FlowSimulation } from './physics/flow-simulation';
import { LanternRaycaster } from './interaction/raycaster';
import { WishUI } from './ui/wish-modal';

console.log('🌕 Nguyệt Dạ Đăng Tiêu (The Moonlit Lantern Sanctuary) initializing...');

const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
const splashOverlay = document.getElementById('splash-overlay');
const btnEnter = document.getElementById('btn-enter');

const btnOpenWish = document.getElementById('btn-open-wish');
const btnLaunchStar = document.getElementById('btn-launch-star');
const btnAutoLanterns = document.getElementById('btn-auto-lanterns');

let sceneManager: SceneManager | null = null;
let lanternStore: LanternStore | null = null;
let flowSimulation: FlowSimulation | null = null;
let raycaster: LanternRaycaster | null = null;
let wishUI: WishUI | null = null;

if (canvas) {
  // 1. Initialize 3D Engine
  sceneManager = new SceneManager(canvas);

  // 2. Initialize State Store & Physics
  lanternStore = new LanternStore();
  flowSimulation = new FlowSimulation(sceneManager.scene, lanternStore);

  // 3. Register render update loop
  sceneManager.onUpdate((time, dt) => {
    flowSimulation?.update(time, dt);
  });

  // 4. Initialize UI & Interaction
  wishUI = new WishUI();
  raycaster = new LanternRaycaster(sceneManager.camera, canvas);

  raycaster.setTargets(
    flowSimulation.interactiveMeshes,
    (item, screenX, screenY) => {
      wishUI?.showPopover(item, screenX, screenY);
    },
    (worldX, worldZ) => {
      wishUI?.openModal('lotus', { x: worldX, z: worldZ });
    }
  );

  // Handle wish submit
  wishUI.onSubmit((author, message, type, coords) => {
    lanternStore?.addWish(author, message, type, coords?.x, coords?.z);
  });

  // 5. Connect Toolbar Buttons
  btnOpenWish?.addEventListener('click', () => {
    wishUI?.openModal('lotus');
  });

  btnLaunchStar?.addEventListener('click', () => {
    wishUI?.openModal('star');
  });

  btnAutoLanterns?.addEventListener('click', () => {
    const extraWishes = [
      'Trăng rằm soi bóng dòng sông 🌕',
      'Đèn sen lấp lánh muôn điều ước 🪷',
      'Chúc gia đình đoàn viên sum vầy 🥮',
      'Mùa thu thanh bình và ấm áp ✨',
      'Nụ cười rạng rỡ như trăng rằm 🏮',
    ];
    extraWishes.forEach((msg, idx) => {
      setTimeout(() => {
        lanternStore?.addWish(
          'Ước Nguyện Đêm Rằm',
          msg,
          idx % 2 === 0 ? 'lotus' : 'star',
          (Math.random() - 0.5) * 24,
          8 + Math.random() * 6
        );
      }, idx * 250);
    });
  });

  sceneManager.start();
  console.log('✨ 3D Engine & Interaction System successfully running.');
}

// Splash Screen dismiss
if (btnEnter && splashOverlay) {
  btnEnter.addEventListener('click', () => {
    splashOverlay.style.opacity = '0';
    setTimeout(() => {
      splashOverlay.classList.add('hidden');
    }, 800);
  });
}
