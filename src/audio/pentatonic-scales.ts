/**
 * Thang Âm Ngũ Cung Việt Nam (Vietnamese Pentatonic Scale)
 * Hò (C), Xự (D), Xang (F), Xê (G), Cống (A)
 */

export interface PentatonicNote {
  name: string;
  vietnameseName: string;
  frequency: number;
  octave: number;
}

// Exact standard 440Hz tuning frequencies
export const PENTATONIC_SCALE: PentatonicNote[] = [
  // Quãng 3: Trầm ấm, dùng làm bè đệm (Drone / Bass pad)
  { name: 'C3', vietnameseName: 'Hò trầm', frequency: 130.81, octave: 3 },
  { name: 'D3', vietnameseName: 'Xự trầm', frequency: 146.83, octave: 3 },
  { name: 'F3', vietnameseName: 'Xang trầm', frequency: 174.61, octave: 3 },
  { name: 'G3', vietnameseName: 'Xê trầm', frequency: 196.0, octave: 3 },
  { name: 'A3', vietnameseName: 'Cống trầm', frequency: 220.0, octave: 3 },

  // Quãng 4: Giai điệu sáo trúc & đàn tranh
  { name: 'C4', vietnameseName: 'Hò', frequency: 261.63, octave: 4 },
  { name: 'D4', vietnameseName: 'Xự', frequency: 293.66, octave: 4 },
  { name: 'F4', vietnameseName: 'Xang', frequency: 349.23, octave: 4 },
  { name: 'G4', vietnameseName: 'Xê', frequency: 392.0, octave: 4 },
  { name: 'A4', vietnameseName: 'Cống', frequency: 440.0, octave: 4 },

  // Quãng 5: Tiếng chuông gió & nốt gảy thanh tao
  { name: 'C5', vietnameseName: 'Hò cao', frequency: 523.25, octave: 5 },
  { name: 'D5', vietnameseName: 'Xự cao', frequency: 587.33, octave: 5 },
  { name: 'F5', vietnameseName: 'Xang cao', frequency: 698.46, octave: 5 },
  { name: 'G5', vietnameseName: 'Xê cao', frequency: 783.99, octave: 5 },
  { name: 'A5', vietnameseName: 'Cống cao', frequency: 880.0, octave: 5 },
];

/**
 * Chọn ngẫu nhiên một nốt nhạc trong thang âm ngũ cung
 */
export function getRandomPentatonicNote(octaveFilter?: number): PentatonicNote {
  const pool = octaveFilter !== undefined
    ? PENTATONIC_SCALE.filter((n) => n.octave === octaveFilter)
    : PENTATONIC_SCALE;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

/**
 * Tính toán nốt nhạc tương ứng theo vị trí X trên mặt sông (Screen/River position to pitch)
 */
export function getNoteFromPosition(normalizedX: number): PentatonicNote {
  // normalizedX between 0 (left) and 1 (right)
  const octave4and5 = PENTATONIC_SCALE.filter((n) => n.octave >= 4);
  const index = Math.min(
    octave4and5.length - 1,
    Math.max(0, Math.floor(normalizedX * octave4and5.length))
  );
  return octave4and5[index];
}
