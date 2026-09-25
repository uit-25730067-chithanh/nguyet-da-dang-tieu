/**
 * Nguyệt Dạ Đăng Tiêu — Lõi Khởi Động
 * Tết Trung Thu 2026 • uit-25730067-chithanh
 */

console.log('🌕 Nguyệt Dạ Đăng Tiêu (The Moonlit Lantern Sanctuary) initializing...');

// Basic DOM initialization test
const splashOverlay = document.getElementById('splash-overlay');
const btnEnter = document.getElementById('btn-enter');

if (btnEnter && splashOverlay) {
  btnEnter.addEventListener('click', () => {
    splashOverlay.style.opacity = '0';
    setTimeout(() => {
      splashOverlay.classList.add('hidden');
    }, 800);
  });
}
