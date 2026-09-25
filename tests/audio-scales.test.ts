import { describe, it, expect } from 'vitest';
import {
  PENTATONIC_SCALE,
  getRandomPentatonicNote,
  getNoteFromPosition,
} from '../src/audio/pentatonic-scales';

describe('Thang Âm Ngũ Cung Việt Nam (Pentatonic Scales)', () => {
  it('phải có đủ 15 nốt trải đều qua 3 quãng tám (Quãng 3, 4, 5)', () => {
    expect(PENTATONIC_SCALE.length).toBe(15);

    const octaves = PENTATONIC_SCALE.map((n) => n.octave);
    expect(octaves.filter((o) => o === 3).length).toBe(5);
    expect(octaves.filter((o) => o === 4).length).toBe(5);
    expect(octaves.filter((o) => o === 5).length).toBe(5);
  });

  it('phải mang đầy đủ tên gọi ngũ cung truyền thống (Hò, Xự, Xang, Xê, Cống)', () => {
    const names = PENTATONIC_SCALE.map((n) => n.vietnameseName);
    expect(names.some((name) => name.includes('Hò'))).toBe(true);
    expect(names.some((name) => name.includes('Xự'))).toBe(true);
    expect(names.some((name) => name.includes('Xang'))).toBe(true);
    expect(names.some((name) => name.includes('Xê'))).toBe(true);
    expect(names.some((name) => name.includes('Cống'))).toBe(true);
  });

  it('nốt A4 (Cống) phải chuẩn tần số 440 Hz theo chuẩn quốc tế', () => {
    const noteA4 = PENTATONIC_SCALE.find((n) => n.name === 'A4');
    expect(noteA4).toBeDefined();
    expect(noteA4?.frequency).toBe(440.0);
  });

  it('tần số các nốt phải tăng dần theo độ cao âm vực', () => {
    for (let i = 0; i < PENTATONIC_SCALE.length - 1; i++) {
      expect(PENTATONIC_SCALE[i].frequency).toBeLessThan(PENTATONIC_SCALE[i + 1].frequency);
    }
  });

  it('hàm getRandomPentatonicNote phải lọc đúng quãng tám khi được chỉ định', () => {
    const noteOctave4 = getRandomPentatonicNote(4);
    expect(noteOctave4.octave).toBe(4);

    const noteOctave5 = getRandomPentatonicNote(5);
    expect(noteOctave5.octave).toBe(5);
  });

  it('hàm getNoteFromPosition phải ánh xạ mượt mà từ tọa độ màn hình sang nốt nhạc', () => {
    const leftNote = getNoteFromPosition(0.0);
    const rightNote = getNoteFromPosition(1.0);

    expect(leftNote.frequency).toBeLessThan(rightNote.frequency);
    expect(leftNote.octave).toBeGreaterThanOrEqual(4);
  });
});
