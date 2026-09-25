/**
 * Nguyệt Dạ Đăng Tiêu — Lõi Khởi Động
 * Tết Trung Thu 2026 • uit-25730067-chithanh
 */

import { SceneManager } from './graphics/scene-manager';
import { LanternStore } from './state/lantern-store';
import { FlowSimulation } from './physics/flow-simulation';
import { LanternRaycaster } from './interaction/raycaster';
import { WishUI } from './ui/wish-modal';
import { PentatonicSynthesizer } from './audio/synth';
import { AmbientSequencer } from './audio/ambient-sequencer';
import { getNoteFromPosition, getRandomPentatonicNote } from './audio/pentatonic-scales';

console.log('🌕 Nguyệt Dạ Đăng Tiêu (The Moonlit Lantern Sanctuary) initializing...');

const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
const splashOverlay = document.getElementById('splash-overlay');
const btnEnter = document.getElementById('btn-enter');

const btnOpenWish = document.getElementById('btn-open-wish');
const btnLaunchStar = document.getElementById('btn-launch-star');
const btnAutoLanterns = document.getElementById('btn-auto-lanterns');
const btnAudioToggle = document.getElementById('btn-audio-toggle');
const audioIcon = document.getElementById('audio-icon');

let sceneManager: SceneManager | null = null;
let lanternStore: LanternStore | null = null;
let flowSimulation: FlowSimulation | null = null;
let raycaster: LanternRaycaster | null = null;
let wishUI: WishUI | null = null;
let synth: PentatonicSynthesizer | null = null;
let sequencer: AmbientSequencer | null = null;

// Initialize Audio Synth
synth = new PentatonicSynthesizer();
sequencer = new AmbientSequencer(synth);

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
      // Play bell tone when clicking a lantern
      const note = getRandomPentatonicNote(5);
      synth?.playPluck(note.frequency, 0.45);
      wishUI?.showPopover(item, screenX, screenY);
    },
    (worldX, worldZ) => {
      wishUI?.openModal('lotus', { x: worldX, z: worldZ });
    }
  );

  // Handle wish submit
  wishUI.onSubmit((author, message, type, coords) => {
    lanternStore?.addWish(author, message, type, coords?.x, coords?.z);

    // Audio chime on lantern launch
    const normX = coords ? (coords.x + 25) / 50 : Math.random();
    const note = getNoteFromPosition(Math.max(0, Math.min(1, normX)));
    synth?.playPluck(note.frequency, 0.6);
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
        const x = (Math.random() - 0.5) * 26;
        lanternStore?.addWish(
          'Ước Nguyện Đêm Rằm',
          msg,
          idx % 2 === 0 ? 'lotus' : 'star',
          x,
          8 + Math.random() * 6
        );

        // Sound cascade
        const note = getNoteFromPosition((x + 20) / 40);
        synth?.playPluck(note.frequency, 0.4);
      }, idx * 220);
    });
  });

  // Audio Toggle Button
  btnAudioToggle?.addEventListener('click', async () => {
    await synth?.resume();
    const isMuted = synth?.toggleMute();
    if (audioIcon) {
      audioIcon.textContent = isMuted ? '🔇' : '🔊';
    }
  });

  sceneManager.start();
  console.log('✨ 3D Engine, Audio Synth & Interaction System running.');
}

// Splash Screen dismiss & Start Audio
if (btnEnter && splashOverlay) {
  btnEnter.addEventListener('click', async () => {
    await synth?.resume();
    sequencer?.start();
    if (audioIcon) {
      audioIcon.textContent = '🔊';
    }

    // Play greeting bell note
    const welcomeNote = getRandomPentatonicNote(4);
    synth?.playPluck(welcomeNote.frequency, 0.65);

    splashOverlay.style.opacity = '0';
    setTimeout(() => {
      splashOverlay.classList.add('hidden');
    }, 800);
  });
}
