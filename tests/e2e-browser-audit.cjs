const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = '/Users/tcdtist/.gemini/antigravity-ide/brain/9461c5a4-9cef-4150-a8fb-ab14b855eb5d/screenshots';

async function runBrowserAudit() {
  console.log('🚀 Starting Isolated Chrome E2E Visual & Interaction Audit...');

  const logs = [];
  const errors = [];

  // Launch isolated headless Chromium without touching user's Chrome
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // High-DPI Retina
  });

  const page = await context.newPage();

  page.on('console', (msg) => {
    logs.push(`[Console ${msg.type()}]: ${msg.text()}`);
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    errors.push(`[PageError]: ${err.message}`);
  });

  // 1. Navigate to local app
  console.log('🌐 Step 1: Navigating to http://localhost:3000/...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Take Screenshot 1: Splash Screen
  const shot1 = path.join(SCREENSHOT_DIR, '01_splash_screen.png');
  await page.screenshot({ path: shot1 });
  console.log(`📸 Screenshot 1 saved: ${shot1}`);

  // 2. Click Enter Button
  console.log('🖱️ Step 2: Clicking "#btn-enter" ("Bước Vào Đêm Rằm 🪷")...');
  await page.click('#btn-enter');
  await page.waitForTimeout(1200);

  // Take Screenshot 2: Main 3D Night Scene
  const shot2 = path.join(SCREENSHOT_DIR, '02_main_night_scene.png');
  await page.screenshot({ path: shot2 });
  console.log(`📸 Screenshot 2 saved: ${shot2}`);

  // Check FPS value
  const fpsText = await page.textContent('#fps-counter');
  console.log(`⚡ FPS Counter display: "${fpsText}"`);

  // 3. Click Open Wish Modal ("Thả Hoa Đăng")
  console.log('🖱️ Step 3: Clicking "#btn-open-wish" ("Thả Hoa Đăng")...');
  await page.click('#btn-open-wish');
  await page.waitForTimeout(500);

  // Take Screenshot 3: Empty Wish Modal
  const shot3 = path.join(SCREENSHOT_DIR, '03_wish_modal_empty.png');
  await page.screenshot({ path: shot3 });
  console.log(`📸 Screenshot 3 saved: ${shot3}`);

  // 4. Test Quick Wish Chip and Author input
  console.log('✍️ Step 4: Clicking chip "Code không bug 💻" & typing Author...');
  const chip = await page.locator('.wish-chip', { hasText: 'Code không bug' });
  await chip.click();
  await page.fill('#wish-author', 'Đặng Chí Thanh (25730067)');
  await page.waitForTimeout(300);

  // Take Screenshot 4: Filled Wish Modal
  const shot4 = path.join(SCREENSHOT_DIR, '04_wish_modal_filled.png');
  await page.screenshot({ path: shot4 });
  console.log(`📸 Screenshot 4 saved: ${shot4}`);

  // Submit wish
  console.log('🚀 Submitting wish form...');
  await page.click('#wish-form button[type="submit"]');
  await page.waitForTimeout(800);

  // 5. Test Star Lantern Modal
  console.log('🖱️ Step 5: Testing Star Lantern ("Thả Đèn Sao")...');
  await page.click('#btn-launch-star');
  await page.waitForTimeout(400);

  const shotStar = path.join(SCREENSHOT_DIR, '05_star_wish_modal.png');
  await page.screenshot({ path: shotStar });
  console.log(`📸 Screenshot Star saved: ${shotStar}`);

  // Close modal via Escape
  console.log('⌨️ Pressing "Escape" key to close modal...');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // 6. Test Auto Lanterns ("Vạn Hoa Đăng")
  console.log('✨ Step 6: Clicking "#btn-auto-lanterns" ("Vạn Hoa Đăng")...');
  await page.click('#btn-auto-lanterns');
  await page.waitForTimeout(2000);

  // 7. Click on river to trigger wish popover
  console.log('🖱️ Step 7: Clicking on river area to interact...');
  // Click on the lower-middle area of the canvas where lanterns drift
  await page.mouse.click(720, 650);
  await page.waitForTimeout(500);

  const shotRiver = path.join(SCREENSHOT_DIR, '06_lanterns_river.png');
  await page.screenshot({ path: shotRiver });
  console.log(`📸 Screenshot River saved: ${shotRiver}`);

  // 8. Test Audio Toggle Button
  console.log('🔊 Step 8: Testing Audio Toggle button...');
  const audioBefore = await page.textContent('#audio-icon');
  await page.click('#btn-audio-toggle');
  const audioAfter = await page.textContent('#audio-icon');
  console.log(`Audio icon changed from: "${audioBefore}" -> "${audioAfter}"`);

  // 9. Test Keyboard shortcuts: Space opens modal, Escape closes
  console.log('⌨️ Step 9: Testing Keyboard shortcut "Space" / "Escape"...');
  await page.keyboard.press('Space');
  await page.waitForTimeout(400);
  const modalVisibleAfterSpace = await page.isVisible('#wish-modal:not(.hidden)');
  console.log(`Modal opened by Space key? ${modalVisibleAfterSpace}`);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const modalVisibleAfterEsc = await page.isVisible('#wish-modal:not(.hidden)');
  console.log(`Modal closed by Escape key? ${!modalVisibleAfterEsc}`);

  // 10. Test Key 'm' for Audio toggle
  await page.keyboard.press('m');
  const audioAfterM = await page.textContent('#audio-icon');
  console.log(`Audio icon after pressing "M": "${audioAfterM}"`);

  await browser.close();

  console.log('\n=========================================');
  console.log('🎉 Browser E2E Visual & Interaction Audit Completed!');
  console.log(`Total Console Logs captured: ${logs.length}`);
  console.log(`Total Page Errors: ${errors.length}`);
  if (errors.length > 0) {
    console.error('Errors found:', errors);
  } else {
    console.log('✅ ZERO RUNTIME ERRORS OR CRASHES!');
  }
  console.log('=========================================\n');
}

runBrowserAudit().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
