import * as THREE from 'three';
import { LanternItem, LanternStore } from '../state/lantern-store';
import { createLotusLanternMesh } from '../graphics/models/lotus-lantern';
import { createStarLanternMesh } from '../graphics/models/star-lantern';

export class FlowSimulation {
  private scene: THREE.Scene;
  private lanternStore: LanternStore;
  private meshMap: Map<string, THREE.Group> = new Map();
  public interactiveMeshes: THREE.Object3D[] = [];

  constructor(scene: THREE.Scene, lanternStore: LanternStore) {
    this.scene = scene;
    this.lanternStore = lanternStore;

    // Load initial lanterns
    this.lanternStore.getAll().forEach((item) => {
      this.spawnLanternMesh(item);
    });

    // Listen to new lanterns added
    this.lanternStore.onLanternAdded((item) => {
      this.spawnLanternMesh(item);
    });
  }

  private spawnLanternMesh(item: LanternItem): THREE.Group {
    const mesh = item.type === 'lotus' ? createLotusLanternMesh() : createStarLanternMesh();
    mesh.position.set(item.x, item.y, item.z);

    // Random slight initial rotation
    mesh.rotation.y = item.phase;

    // Scale to appropriate natural size in the scene
    const baseScale = item.type === 'lotus' ? 0.85 : 0.75;
    mesh.scale.set(baseScale, baseScale, baseScale);

    // Tag userData for Raycasting identification
    mesh.userData = { lanternId: item.id, item };

    this.scene.add(mesh);
    this.meshMap.set(item.id, mesh);
    this.interactiveMeshes.push(mesh);

    return mesh;
  }

  public update(time: number, dt: number, speedMultiplier = 1.0): void {
    const items = this.lanternStore.getAll();

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const mesh = this.meshMap.get(item.id);
      if (!mesh) continue;

      if (item.type === 'lotus') {
        // 1. Water River Current Drift (-Z direction towards horizon)
        item.z -= item.speed * dt * 0.9 * speedMultiplier;
        item.x += Math.sin(time * 0.6 + item.phase) * 0.015 * speedMultiplier;

        // 2. Harmonic Water Bobbing
        item.y = 0.12 + Math.sin(time * 1.8 + item.phase) * item.bobbingAmp;

        // 3. Gentle Angular Rolling
        mesh.rotation.z = Math.sin(time * 1.2 + item.phase) * 0.04;
        mesh.rotation.x = Math.cos(time * 1.0 + item.phase) * 0.03;

        // Reset if drifted too far into distance
        if (item.z < -85) {
          item.z = 20 + Math.random() * 5;
          item.x = (Math.random() - 0.5) * 30;
        }
      } else {
        // Star Lantern: Ascends into the night sky
        item.y += (0.6 + item.speed * 0.3) * dt * speedMultiplier;
        item.z -= 0.8 * dt * speedMultiplier;
        item.x += Math.sin(time * 0.7 + item.phase) * 0.02 * speedMultiplier;

        mesh.rotation.y += 0.015 * speedMultiplier;
        mesh.rotation.z = Math.sin(time * 0.8 + item.phase) * 0.08;

        // Reset if flown into deep sky
        if (item.y > 65 || item.z < -95) {
          item.y = 2.0;
          item.z = 10 + Math.random() * 5;
          item.x = (Math.random() - 0.5) * 20;
        }
      }

      mesh.position.set(item.x, item.y, item.z);

      // Flickering flame effect
      const flame = mesh.getObjectByName('flame');
      if (flame) {
        const flicker = 1.0 + Math.sin(time * 12.0 + item.phase * 5.0) * 0.18;
        flame.scale.set(flicker, flicker, flicker);
      }
    }
  }

  public getMeshCount(): number {
    return this.meshMap.size;
  }
}
