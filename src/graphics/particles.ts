import * as THREE from 'three';

export class ParticleSystem {
  public starsMesh: THREE.Points;
  public firefliesMesh: THREE.Points;
  private fireflyPositions: Float32Array;
  private fireflyVelocities: Float32Array;
  private fireflyPhases: Float32Array;
  private fireflyCount: number;

  constructor(starCount = 1500, fireflyCount = 180) {
    this.fireflyCount = fireflyCount;

    // 1. Sky Stars Setup
    const starGeometry = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      // Distribute in a celestial dome
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.85 + 0.15); // Upper hemisphere
      const radius = 250 + Math.random() * 80;

      starPos[idx] = radius * Math.sin(phi) * Math.cos(theta);
      starPos[idx + 1] = radius * Math.cos(phi) + 15;
      starPos[idx + 2] = radius * Math.sin(phi) * Math.sin(theta);

      // Star color variation (pure white, soft yellow, celestial blue)
      const colorType = Math.random();
      if (colorType > 0.8) {
        starColors[idx] = 1.0; starColors[idx + 1] = 0.92; starColors[idx + 2] = 0.7; // Warm yellow
      } else if (colorType < 0.2) {
        starColors[idx] = 0.75; starColors[idx + 1] = 0.85; starColors[idx + 2] = 1.0; // Cool blue
      } else {
        starColors[idx] = 0.95; starColors[idx + 1] = 0.98; starColors[idx + 2] = 1.0; // White
      }
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 1.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    this.starsMesh = new THREE.Points(starGeometry, starMaterial);

    // 2. Fireflies (Đom đóm bờ sông) Setup
    const fireflyGeo = new THREE.BufferGeometry();
    this.fireflyPositions = new Float32Array(fireflyCount * 3);
    this.fireflyVelocities = new Float32Array(fireflyCount * 3);
    this.fireflyPhases = new Float32Array(fireflyCount);

    for (let i = 0; i < fireflyCount; i++) {
      const idx = i * 3;
      this.fireflyPositions[idx] = (Math.random() - 0.5) * 80;      // X: Across river
      this.fireflyPositions[idx + 1] = 0.5 + Math.random() * 8.0;   // Y: Above water
      this.fireflyPositions[idx + 2] = (Math.random() - 0.5) * 100; // Z: River length

      this.fireflyVelocities[idx] = (Math.random() - 0.5) * 0.3;
      this.fireflyVelocities[idx + 1] = (Math.random() - 0.5) * 0.15;
      this.fireflyVelocities[idx + 2] = (Math.random() - 0.5) * 0.3;

      this.fireflyPhases[i] = Math.random() * Math.PI * 2;
    }

    fireflyGeo.setAttribute('position', new THREE.BufferAttribute(this.fireflyPositions, 3));

    const fireflyMaterial = new THREE.PointsMaterial({
      color: 0xffd15c,
      size: 2.2,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    this.firefliesMesh = new THREE.Points(fireflyGeo, fireflyMaterial);
  }

  public update(time: number, dt: number): void {
    const positions = this.fireflyPositions;
    const velocities = this.fireflyVelocities;
    const count = this.fireflyCount;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;

      // Gentle brownian organic drift
      positions[idx] += velocities[idx] * dt + Math.sin(time * 0.8 + this.fireflyPhases[i]) * 0.02;
      positions[idx + 1] += velocities[idx + 1] * dt + Math.cos(time * 1.2 + this.fireflyPhases[i]) * 0.015;
      positions[idx + 2] += velocities[idx + 2] * dt + 0.05 * dt; // Flow slightly along river

      // Bounding box bounce & wrap
      if (positions[idx] > 40) positions[idx] = -40;
      if (positions[idx] < -40) positions[idx] = 40;
      if (positions[idx + 1] > 12) positions[idx + 1] = 1.0;
      if (positions[idx + 1] < 0.2) positions[idx + 1] = 2.0;
      if (positions[idx + 2] > 50) positions[idx + 2] = -50;
      if (positions[idx + 2] < -50) positions[idx + 2] = 50;
    }

    this.firefliesMesh.geometry.attributes.position.needsUpdate = true;

    // Twinkle fireflies opacity
    const mat = this.firefliesMesh.material as THREE.PointsMaterial;
    mat.opacity = 0.55 + Math.sin(time * 2.5) * 0.35;
  }

  public setQuality(tier: 'high' | 'medium' | 'low'): void {
    if (tier === 'low') {
      this.firefliesMesh.visible = false;
      (this.starsMesh.material as THREE.PointsMaterial).size = 1.2;
    } else if (tier === 'medium') {
      this.firefliesMesh.visible = true;
      (this.starsMesh.material as THREE.PointsMaterial).size = 1.4;
    } else {
      this.firefliesMesh.visible = true;
      (this.starsMesh.material as THREE.PointsMaterial).size = 1.6;
    }
  }
}
