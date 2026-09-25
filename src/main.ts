/**
 * Nguyet Da Dang Tieu — Core Entrypoint
 * Mid-Autumn Festival Interactive Sanctuary
 */

import { SceneManager } from './graphics/scene-manager';
import { LanternStore } from './state/lantern-store';
import { FlowSimulation } from './physics/flow-simulation';
import { LanternRaycaster } from './interaction/raycaster';
import { WishUI } from './ui/wish-modal';
import { PentatonicSynthesizer } from './audio/synth';
import { AmbientSequencer } from './audio/ambient-sequencer';
import { getNoteFromPosition, getRandomPentatonicNote } from './audio/pentatonic-scales';
import { isWebGLAvailable } from './graphics/renderer-switcher';
import { FallbackCanvas } from './graphics/fallback-canvas';
import { ReducedMotionManager } from './a11y/reduced-motion';
import { setupKeyboardNavigation } from './a11y/keyboard-nav';

console.log('🌕 Nguyệt Dạ Đăng Tiêu (The Moonlit Lantern Sanctuary) initializing...');

const webglCanvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
const fallbackCanvas = document.getElementById('fallback-canvas') as HTMLCanvasElement;
const splashOverlay = document.getElementById('splash-overlay');
const btnEnter = document.getElementById('btn-enter');

const btnOpenWish = document.getElementById('btn-open-wish');
const btnLaunchStar = document.getElementById('btn-launch-star');
const btnAutoLanterns = document.getElementById('btn-auto-lanterns');
const btnAudioToggle = document.getElementById('btn-audio-toggle');
const audioIcon = document.getElementById('audio-icon');

let sceneManager: SceneManager | null = null;
let fallbackRenderer: FallbackCanvas | null = null;
let lanternStore: LanternStore | null = null;
let flowSimulation: FlowSimulation | null = null;
let raycaster: LanternRaycaster | null = null;
let wishUI: WishUI | null = null;
let synth: PentatonicSynthesizer | null = null;
let sequencer: AmbientSequencer | null = null;
let motionManager: ReducedMotionManager | null = null;

// 1. Initialize State & Audio & A11y
lanternStore = new LanternStore();
synth = new PentatonicSynthesizer();
sequencer = new AmbientSequencer(synth);
wishUI = new WishUI();
motionManager = new ReducedMotionManager();

// 2. Select Renderer (WebGL 3D vs 2.5D Fallback)
const hasWebGL = isWebGLAvailable();

if (hasWebGL && webglCanvas) {
  try {
    sceneManager = new SceneManager(webglCanvas);
    flowSimulation = new FlowSimulation(sceneManager.scene, lanternStore);

    // Register render update loop with accessibility motion scaling
    sceneManager.onUpdate((time, dt) => {
      const motionScale = motionManager?.getMotionMultiplier() || 1.0;
      flowSimulation?.update(time, dt, motionScale);
    });

    raycaster = new LanternRaycaster(sceneManager.camera, webglCanvas);

    raycaster.setTargets(
      flowSimulation.interactiveMeshes,
      (item, screenX, screenY) => {
        const note = getRandomPentatonicNote(5);
        synth?.playPluck(note.frequency, 0.45);
        wishUI?.showPopover(item, screenX, screenY);
      },
      (worldX) => {
        const note = getNoteFromPosition((worldX + 25) / 50);
        synth?.playPluck(note.frequency, 0.3);
      }
    );

    sceneManager.start();
    console.log('✨ 3D WebGL Engine initialized successfully.');
  } catch (err) {
    console.warn('[Main] WebGL init failed, falling back to 2.5D canvas:', err);
    initFallbackMode();
  }
} else {
  console.log('[Main] WebGL not supported on this device. Activating Fallback 2.5D Canvas.');
  initFallbackMode();
}

function initFallbackMode(): void {
  if (webglCanvas) webglCanvas.classList.add('hidden');
  if (fallbackCanvas && lanternStore) {
    fallbackCanvas.classList.remove('hidden');
    fallbackRenderer = new FallbackCanvas(fallbackCanvas, lanternStore);
    fallbackRenderer.start();
  }
}

// 3. Wire Wish Submissions
wishUI.onSubmit((author, message, type, coords) => {
  lanternStore?.addWish(author, message, type, coords?.x, coords?.z);

  const normX = coords ? (coords.x + 25) / 50 : Math.random();
  const note = getNoteFromPosition(Math.max(0, Math.min(1, normX)));
  synth?.playPluck(note.frequency, 0.6);
});

// 4. Wire Toolbar Buttons
btnOpenWish?.addEventListener('click', () => {
  wishUI?.openModal('lotus');
});

btnLaunchStar?.addEventListener('click', () => {
  wishUI?.openModal('star');
});

const triggerAutoLanterns = () => {
  const extraWishes = [
    'Trăng rằm soi bóng dòng sông 🌕',
    'Đèn sen lấp lánh muôn điều ước 🪷',
    'Chúc gia đình đoàn viên sum vầy 🥮',
    'Mùa thu thanh bình và ấm áp ✨',
    'Nụ cười rạng rỡ như trăng rằm 🏮',
  ];
  extraWishes.forEach((msg, idx) => {
    setTimeout(() => {
      const x = (Math.random() - 0.5) * 26;
      lanternStore?.addWish(
        'Ước Nguyện Đêm Rằm',
        msg,
        idx % 2 === 0 ? 'lotus' : 'star',
        x,
        8 + Math.random() * 6
      );

      const note = getNoteFromPosition((x + 20) / 40);
      synth?.playPluck(note.frequency, 0.4);
    }, idx * 220);
  });
};

btnAutoLanterns?.addEventListener('click', triggerAutoLanterns);

// Audio Toggle
const toggleAudio = async () => {
  await synth?.resume();
  const isMuted = synth?.toggleMute();
  if (audioIcon) {
    audioIcon.textContent = isMuted ? '🔇' : '🔊';
  }
};

btnAudioToggle?.addEventListener('click', toggleAudio);

// 5. Setup Full Keyboard Navigation
setupKeyboardNavigation({
  onOpenLotusWish: () => wishUI?.openModal('lotus'),
  onOpenStarWish: () => wishUI?.openModal('star'),
  onTriggerAutoLanterns: triggerAutoLanterns,
  onToggleAudio: toggleAudio,
  onCloseModal: () => {
    wishUI?.closeModal();
    wishUI?.hidePopover();
  },
});

// 6. Splash Screen Dismiss & Audio Unlock
if (btnEnter && splashOverlay) {
  btnEnter.addEventListener('click', async () => {
    await synth?.resume();
    sequencer?.start();
    if (audioIcon) {
      audioIcon.textContent = '🔊';
    }

    const welcomeNote = getRandomPentatonicNote(4);
    synth?.playPluck(welcomeNote.frequency, 0.65);

    splashOverlay.style.opacity = '0';
    setTimeout(() => {
      splashOverlay.classList.add('hidden');
    }, 800);
  });
}
