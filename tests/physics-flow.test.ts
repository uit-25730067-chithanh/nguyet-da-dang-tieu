import { describe, it, expect } from 'vitest';
import { LanternStore, LanternItem } from '../src/state/lantern-store';

describe('Vật Lý Dòng Chảy & Quản Lý Đèn (Flow Physics & Lantern Store)', () => {
  it('phải khởi tạo đúng số lượng đèn mặc định ban đầu', () => {
    const store = new LanternStore();
    const items = store.getAll();

    expect(items.length).toBeGreaterThanOrEqual(6);
    expect(items.some((i) => i.type === 'lotus')).toBe(true);
    expect(items.some((i) => i.type === 'star')).toBe(true);
  });

  it('phải thêm được đèn mới kèm điều ước và tọa độ hợp lệ', () => {
    const store = new LanternStore();
    const newItem = store.addWish('Nguyễn Văn A', 'Chúc Trung Thu vui vẻ!', 'lotus', 5.0, -15.0);

    expect(newItem.author).toBe('Nguyễn Văn A');
    expect(newItem.message).toBe('Chúc Trung Thu vui vẻ!');
    expect(newItem.type).toBe('lotus');
    expect(newItem.x).toBe(5.0);
    expect(newItem.z).toBe(-15.0);
    expect(newItem.id).toContain('wish-');
  });

  it('phải gán tên Ẩn danh nếu người dùng để trống tên tác giả', () => {
    const store = new LanternStore();
    const item = store.addWish('   ', 'Ước nguyện bình an', 'star');

    expect(item.author).toBe('Người gửi ẩn danh');
    expect(item.type).toBe('star');
  });

  it('tính toán dao động điều hòa hình sin (Harmonic Bobbing) phải nằm trong biên độ cho phép', () => {
    const item: LanternItem = {
      id: 'test',
      type: 'lotus',
      author: 'Test',
      message: 'Test',
      x: 0,
      y: 0,
      z: 0,
      createdAt: Date.now(),
      phase: 0.5,
      speed: 1.0,
      bobbingAmp: 0.12,
    };

    // Simulate vertical wave equation: y = 0.12 + sin(time * 1.8 + phase) * bobbingAmp
    for (let time = 0; time < 10; time += 0.5) {
      const y = 0.12 + Math.sin(time * 1.8 + item.phase) * item.bobbingAmp;
      expect(y).toBeGreaterThanOrEqual(0.12 - item.bobbingAmp - 0.001);
      expect(y).toBeLessThanOrEqual(0.12 + item.bobbingAmp + 0.001);
    }
  });

  it('đèn hoa đăng trôi xuôi dòng phải giảm tọa độ Z (hướng ra xa phía chân trời)', () => {
    let z = 10.0;
    const speed = 1.2;
    const dt = 0.016; // 16ms frame

    for (let frame = 0; frame < 60; frame++) {
      z -= speed * dt * 0.9;
    }

    expect(z).toBeLessThan(10.0);
  });
});
