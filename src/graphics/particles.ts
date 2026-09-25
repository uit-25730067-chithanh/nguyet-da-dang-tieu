import * as THREE from 'three';

/**
 * Tạo CanvasTexture tròn có gradient phát sáng từ tâm ra ngoài (không bị viền vuông)
 */
function createCircularGlowTexture(
  colorCore: string,
  colorHalo: string,
  colorBloom: string,
  size = 64
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const center = size / 2;
    const radius = size / 2;

    const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
    gradient.addColorStop(0.0, colorCore);
    gradient.addColorStop(0.35, colorCore);
    gradient.addColorStop(0.65, colorHalo);
    gradient.addColorStop(0.85, colorBloom);
    gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export class ParticleSystem {
  public starsMesh: THREE.Points;
  public firefliesMesh: THREE.Points;
  private fireflyPositions: Float32Array;
  private fireflyVelocities: Float32Array;
  private fireflyPhases: Float32Array;
  private fireflyBaseColors: Float32Array;
  private fireflyCount: number;

  constructor(starCount = 1500, fireflyCount = 200) {
    this.fireflyCount = fireflyCount;

    // 1. Sky Stars Setup với texture tròn phát sáng mềm
    const starGeometry = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.85 + 0.15); // Nửa bán cầu trên
      const radius = 240 + Math.random() * 80;

      starPos[idx] = radius * Math.sin(phi) * Math.cos(theta);
      starPos[idx + 1] = radius * Math.cos(phi) + 15;
      starPos[idx + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const colorType = Math.random();
      if (colorType > 0.75) {
        starColors[idx] = 1.0; starColors[idx + 1] = 0.92; starColors[idx + 2] = 0.65; // Vàng ấm
      } else if (colorType < 0.2) {
        starColors[idx] = 0.75; starColors[idx + 1] = 0.88; starColors[idx + 2] = 1.0; // Xanh băng
      } else {
        starColors[idx] = 0.98; starColors[idx + 1] = 0.98; starColors[idx + 2] = 1.0; // Trắng sáng
      }
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starTexture = createCircularGlowTexture(
      'rgba(255, 255, 255, 1.0)',
      'rgba(240, 245, 255, 0.8)',
      'rgba(200, 220, 255, 0.2)',
      32
    );

    const starMaterial = new THREE.PointsMaterial({
      map: starTexture,
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.starsMesh = new THREE.Points(starGeometry, starMaterial);

    // 2. Fireflies (Đom đóm bờ sông): Đốm sáng vàng dạ quang rõ nét, lung linh
    const fireflyGeo = new THREE.BufferGeometry();
    this.fireflyPositions = new Float32Array(fireflyCount * 3);
    this.fireflyVelocities = new Float32Array(fireflyCount * 3);
    this.fireflyPhases = new Float32Array(fireflyCount);
    this.fireflyBaseColors = new Float32Array(fireflyCount * 3);
    const fireflyColors = new Float32Array(fireflyCount * 3);

    for (let i = 0; i < fireflyCount; i++) {
      const idx = i * 3;
      // Trải dài dọc sông từ xa đến gần tầm nhìn camera (Z: -45 đến +12, Camera ở Z=24)
      this.fireflyPositions[idx] = (Math.random() - 0.5) * 50;     // X: Lòng sông & ven bờ
      this.fireflyPositions[idx + 1] = 0.5 + Math.random() * 4.2;  // Y: Bay từ sát mặt nước lên tầm trung
      this.fireflyPositions[idx + 2] = -45 + Math.random() * 57;   // Z: Chiều sâu dòng sông

      this.fireflyVelocities[idx] = (Math.random() - 0.5) * 0.35;
      this.fireflyVelocities[idx + 1] = (Math.random() - 0.5) * 0.18;
      this.fireflyVelocities[idx + 2] = (Math.random() - 0.5) * 0.25;

      this.fireflyPhases[i] = Math.random() * Math.PI * 2;

      // Màu sắc đom đóm tự nhiên: Vàng chanh dạ quang pha hổ phách ấm
      const isWarm = Math.random() > 0.4;
      this.fireflyBaseColors[idx] = 1.0;
      this.fireflyBaseColors[idx + 1] = isWarm ? 0.92 : 0.98;
      this.fireflyBaseColors[idx + 2] = isWarm ? 0.42 : 0.58;

      fireflyColors[idx] = this.fireflyBaseColors[idx];
      fireflyColors[idx + 1] = this.fireflyBaseColors[idx + 1];
      fireflyColors[idx + 2] = this.fireflyBaseColors[idx + 2];
    }

    fireflyGeo.setAttribute('position', new THREE.BufferAttribute(this.fireflyPositions, 3));
    fireflyGeo.setAttribute('color', new THREE.BufferAttribute(fireflyColors, 3));

    // Texture tròn rực rỡ với lõi vàng sáng đặc và quầng sáng mềm
    const fireflyTexture = createCircularGlowTexture(
      'rgba(255, 255, 240, 1.0)', // Lõi trắng vàng chói sáng
      'rgba(255, 220, 50, 0.95)', // Quầng vàng dạ quang ấm
      'rgba(255, 160, 20, 0.45)', // Vầng tán sắc cam hổ phách
      128
    );

    const fireflyMaterial = new THREE.PointsMaterial({
      map: fireflyTexture,
      size: 1.4, // Kích thước cân đối hoàn hảo: sáng rõ, lấp lánh như ngọc, không bị lấn át hoa đăng
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.firefliesMesh = new THREE.Points(fireflyGeo, fireflyMaterial);
  }

  public update(time: number, dt: number): void {
    const positions = this.fireflyPositions;
    const velocities = this.fireflyVelocities;
    const colors = this.firefliesMesh.geometry.attributes.color.array as Float32Array;
    const baseColors = this.fireflyBaseColors;
    const count = this.fireflyCount;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;

      // Chuyển động lượn sóng tự nhiên bồng bềnh
      positions[idx] += velocities[idx] * dt + Math.sin(time * 0.8 + this.fireflyPhases[i]) * 0.02;
      positions[idx + 1] += velocities[idx + 1] * dt + Math.cos(time * 1.3 + this.fireflyPhases[i]) * 0.015;
      positions[idx + 2] += velocities[idx + 2] * dt + 0.05 * dt;

      // Giới hạn biên độ an toàn, lượn quanh sông
      if (positions[idx] > 26) positions[idx] = -26;
      if (positions[idx] < -26) positions[idx] = 26;
      if (positions[idx + 1] > 5.0) positions[idx + 1] = 0.6;
      if (positions[idx + 1] < 0.4) positions[idx + 1] = 2.2;
      if (positions[idx + 2] > 14) positions[idx + 2] = -45;
      if (positions[idx + 2] < -48) positions[idx + 2] = 12;

      // Từng con đom đóm nhấp nháy ĐỘC LẬP theo pha riêng (duy trì độ sáng cao 0.6 - 1.0)
      const pulse = 0.65 + 0.35 * Math.sin(time * 2.8 + this.fireflyPhases[i]);
      colors[idx] = baseColors[idx] * pulse;
      colors[idx + 1] = baseColors[idx + 1] * pulse;
      colors[idx + 2] = baseColors[idx + 2] * pulse;
    }

    this.firefliesMesh.geometry.attributes.position.needsUpdate = true;
    this.firefliesMesh.geometry.attributes.color.needsUpdate = true;
  }

  public setQuality(tier: 'high' | 'medium' | 'low'): void {
    // Đom đóm luôn hiển thị để giữ linh hồn đêm trăng, chỉ tinh chỉnh size
    this.firefliesMesh.visible = true;
    if (tier === 'low') {
      (this.starsMesh.material as THREE.PointsMaterial).size = 1.3;
      (this.firefliesMesh.material as THREE.PointsMaterial).size = 1.25;
    } else if (tier === 'medium') {
      (this.starsMesh.material as THREE.PointsMaterial).size = 1.5;
      (this.firefliesMesh.material as THREE.PointsMaterial).size = 1.35;
    } else {
      (this.starsMesh.material as THREE.PointsMaterial).size = 1.8;
      (this.firefliesMesh.material as THREE.PointsMaterial).size = 1.45;
    }
  }
}
