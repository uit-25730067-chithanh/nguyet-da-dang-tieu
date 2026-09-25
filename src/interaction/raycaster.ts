import * as THREE from 'three';
import { LanternItem } from '../state/lantern-store';

export class LanternRaycaster {
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private camera: THREE.Camera;
  private canvas: HTMLCanvasElement;

  private onLanternSelectCallback?: (item: LanternItem, screenX: number, screenY: number) => void;
  private onWaterClickCallback?: (worldX: number, worldZ: number) => void;

  constructor(camera: THREE.Camera, canvas: HTMLCanvasElement) {
    this.camera = camera;
    this.canvas = canvas;

    this.initEvents();
  }

  private initEvents(): void {
    const handlePointer = (clientX: number, clientY: number) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    this.canvas.addEventListener('click', (e) => {
      handlePointer(e.clientX, e.clientY);
      this.performHitTest(e.clientX, e.clientY);
    });

    this.canvas.addEventListener('touchend', (e) => {
      if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        handlePointer(touch.clientX, touch.clientY);
        this.performHitTest(touch.clientX, touch.clientY);
      }
    });
  }

  public setTargets(
    interactiveMeshes: THREE.Object3D[],
    onSelect: (item: LanternItem, screenX: number, screenY: number) => void,
    onWaterClick?: (worldX: number, worldZ: number) => void
  ): void {
    this.interactiveMeshes = interactiveMeshes;
    this.onLanternSelectCallback = onSelect;
    this.onWaterClickCallback = onWaterClick;
  }

  private interactiveMeshes: THREE.Object3D[] = [];

  private performHitTest(screenX: number, screenY: number): void {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // 1. Check if clicked on any existing lantern
    const hits = this.raycaster.intersectObjects(this.interactiveMeshes, true);

    if (hits.length > 0) {
      // Find the root group that holds the userData
      let obj: THREE.Object3D | null = hits[0].object;
      while (obj && (!obj.userData || !obj.userData.item)) {
        obj = obj.parent;
      }

      if (obj && obj.userData && obj.userData.item) {
        const item: LanternItem = obj.userData.item;
        if (this.onLanternSelectCallback) {
          this.onLanternSelectCallback(item, screenX, screenY);
          return;
        }
      }
    }

    // 2. Otherwise calculate intersection with the horizontal water plane (Y = 0)
    const waterPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const targetPoint = new THREE.Vector3();
    const hitPlane = this.raycaster.ray.intersectPlane(waterPlane, targetPoint);

    if (hitPlane && this.onWaterClickCallback) {
      // Restrict within comfortable river bounds
      if (Math.abs(targetPoint.x) < 30 && targetPoint.z > -40 && targetPoint.z < 25) {
        this.onWaterClickCallback(targetPoint.x, targetPoint.z);
      }
    }
  }
}
