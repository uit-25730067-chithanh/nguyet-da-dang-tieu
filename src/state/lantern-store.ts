/**
 * Lantern & Wish Store - State Management
 */

export interface LanternItem {
  id: string;
  type: 'lotus' | 'star';
  author: string;
  message: string;
  x: number;
  y: number;
  z: number;
  createdAt: number;
  phase: number;
  speed: number;
  bobbingAmp: number;
}

export class LanternStore {
  private lanterns: LanternItem[] = [];
  private onLanternAddedCallbacks: ((item: LanternItem) => void)[] = [];

  constructor() {
    this.initDefaultWishes();
    this.loadUserSavedWishes();
  }

  private initDefaultWishes(): void {
    const defaultWishes: Array<{ author: string; message: string; type: 'lotus' | 'star' }> = [
      { author: 'Chị Hằng', message: 'Chúc các bạn nhỏ một mùa trăng rằm ngập tràn niềm vui và tiếng cười! 🌕', type: 'lotus' },
      { author: 'Chú Cuội', message: 'Ước cho mọi nhà luôn no ấm, đoàn viên và hạnh phúc sum vầy! 🥮', type: 'lotus' },
      { author: 'Thỏ Ngọc', message: 'Chúc các kỹ sư và coder luôn code mượt mà, không bao giờ gặp bug! 💻', type: 'star' },
      { author: 'Học Muội', message: 'Nguyện cầu gia đình luôn mạnh khỏe, bình an và nhiều may mắn! 🏮', type: 'lotus' },
      { author: 'Một Người Bạn', message: 'Tết Trung Thu ấm áp bên người thân và bạn bè thân yêu! ✨', type: 'lotus' },
      { author: 'Ẩn Danh', message: 'Ước mơ bay cao như đèn ông sao soi sáng mọi chặng đường! ⭐', type: 'star' },
    ];

    // Seed lanterns across the river
    defaultWishes.forEach((w, i) => {
      this.lanterns.push({
        id: `seed-${i}`,
        type: w.type,
        author: w.author,
        message: w.message,
        x: (Math.random() - 0.5) * 35,
        y: w.type === 'lotus' ? 0.1 : 3.0 + Math.random() * 8.0,
        z: -10 - i * 14 - Math.random() * 8,
        createdAt: Date.now() - i * 60000,
        phase: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 0.6,
        bobbingAmp: 0.08 + Math.random() * 0.04,
      });
    });
  }

  private loadUserSavedWishes(): void {
    try {
      const saved = localStorage.getItem('uit_lantern_wishes');
      if (saved) {
        const parsed: LanternItem[] = JSON.parse(saved);
        parsed.forEach((item) => {
          this.lanterns.push(item);
        });
      }
    } catch {
      // LocalStorage not available or quota exceeded
    }
  }

  public addWish(author: string, message: string, type: 'lotus' | 'star' = 'lotus', customX?: number, customZ?: number): LanternItem {
    const newItem: LanternItem = {
      id: `wish-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      author: author.trim() || 'Người gửi ẩn danh',
      message: message.trim(),
      x: customX !== undefined ? customX : (Math.random() - 0.5) * 16,
      y: type === 'lotus' ? 0.1 : 1.5,
      z: customZ !== undefined ? customZ : 12 + (Math.random() - 0.5) * 4,
      createdAt: Date.now(),
      phase: Math.random() * Math.PI * 2,
      speed: 0.9 + Math.random() * 0.4,
      bobbingAmp: 0.1,
    };

    this.lanterns.push(newItem);
    this.saveUserWish(newItem);

    this.onLanternAddedCallbacks.forEach((cb) => cb(newItem));
    return newItem;
  }

  private saveUserWish(item: LanternItem): void {
    try {
      const saved = localStorage.getItem('uit_lantern_wishes');
      const list: LanternItem[] = saved ? JSON.parse(saved) : [];
      list.push(item);
      localStorage.setItem('uit_lantern_wishes', JSON.stringify(list.slice(-20))); // Keep last 20
    } catch {
      // Ignore
    }
  }

  public getAll(): LanternItem[] {
    return this.lanterns;
  }

  public onLanternAdded(callback: (item: LanternItem) => void): void {
    this.onLanternAddedCallbacks.push(callback);
  }
}
