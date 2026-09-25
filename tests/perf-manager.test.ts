import { describe, it, expect, vi } from 'vitest';
import { PerfManager } from '../src/graphics/perf-manager';

describe('Quản Lý Hiệu Năng & Cấu Hình Đồ Họa (Performance Manager)', () => {
  it('phải khởi tạo ở cấu hình HIGH theo mặc định', () => {
    const perf = new PerfManager();
    expect(perf.getTier()).toBe('high');
    expect(perf.getContextLost()).toBe(false);
  });

  it('phải chuyển đổi trạng thái khi setTier thủ công', () => {
    const perf = new PerfManager();
    const callback = vi.fn();
    perf.onTierChange(callback);

    perf.setTier('medium');
    expect(perf.getTier()).toBe('medium');
    expect(callback).toHaveBeenCalledWith('medium');

    perf.setTier('low');
    expect(perf.getTier()).toBe('low');
    expect(callback).toHaveBeenCalledWith('low');
  });

  it('phải ghi nhận trạng thái context lost chính xác', () => {
    const perf = new PerfManager();
    perf.setContextLost(true);
    expect(perf.getContextLost()).toBe(true);

    perf.setContextLost(false);
    expect(perf.getContextLost()).toBe(false);
  });
});
