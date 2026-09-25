/**
 * Hỗ Trợ Điều Khiển Bằng Bàn Phím (Keyboard Navigation & Accessibility)
 */

export interface KeyboardActions {
  onOpenLotusWish: () => void;
  onOpenStarWish: () => void;
  onTriggerAutoLanterns: () => void;
  onToggleAudio: () => void;
  onCloseModal: () => void;
}

export function setupKeyboardNavigation(actions: KeyboardActions): void {
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    // If user is currently typing in an input or textarea, do not trigger global shortcuts
    const activeEl = document.activeElement;
    const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

    if (e.key === 'Escape') {
      actions.onCloseModal();
      return;
    }

    if (isTyping) return;

    if (e.key === ' ' || e.key === '1') {
      e.preventDefault();
      actions.onOpenLotusWish();
    } else if (e.key === '2') {
      e.preventDefault();
      actions.onOpenStarWish();
    } else if (e.key === '3') {
      e.preventDefault();
      actions.onTriggerAutoLanterns();
    } else if (e.key.toLowerCase() === 'm') {
      e.preventDefault();
      actions.onToggleAudio();
    }
  });
}
