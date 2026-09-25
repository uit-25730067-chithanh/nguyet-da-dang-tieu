import * as THREE from 'three';

export function createLotusLanternMesh(): THREE.Group {
  const group = new THREE.Group();

  // 1. Lotus Base / Leaves (Lá sen xanh sẫm làm đế nổi)
  const leafGeo = new THREE.CylinderGeometry(1.2, 0.9, 0.08, 16);
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x1b4332,
    roughness: 0.8,
    metalness: 0.1,
  });
  const leafMesh = new THREE.Mesh(leafGeo, leafMat);
  leafMesh.position.y = 0.02;
  group.add(leafMesh);

  // 2. Lotus Petals (Cánh sen hồng phai xếp tầng)
  const petalCount = 8;
  const petalMat = new THREE.MeshStandardMaterial({
    color: 0xff85a1,
    emissive: 0xff3366,
    emissiveIntensity: 0.35,
    roughness: 0.4,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
  });

  // Reusable curved petal geometry
  const petalGeo = new THREE.ConeGeometry(0.45, 1.1, 5);
  petalGeo.scale(1.2, 1.0, 0.3); // Flatten to make it look like a petal

  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2;
    const petal = new THREE.Mesh(petalGeo, petalMat);

    petal.position.set(Math.cos(angle) * 0.7, 0.45, Math.sin(angle) * 0.7);
    petal.rotation.y = -angle + Math.PI / 2;
    petal.rotation.z = 0.35; // Flared outwards
    group.add(petal);
  }

  // Inner petal layer (Tầng cánh sen trong nhỏ hơn)
  for (let i = 0; i < petalCount; i++) {
    const angle = ((i + 0.5) / petalCount) * Math.PI * 2;
    const innerPetal = new THREE.Mesh(petalGeo, petalMat);
    innerPetal.scale.set(0.75, 0.75, 0.75);

    innerPetal.position.set(Math.cos(angle) * 0.45, 0.4, Math.sin(angle) * 0.4);
    innerPetal.rotation.y = -angle + Math.PI / 2;
    innerPetal.rotation.z = 0.2;
    group.add(innerPetal);
  }

  // 3. Candle (Ngọn nến hổ phách ở tâm)
  const candleGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.5, 12);
  const candleMat = new THREE.MeshStandardMaterial({
    color: 0xfff3b0,
    roughness: 0.3,
  });
  const candleMesh = new THREE.Mesh(candleGeo, candleMat);
  candleMesh.position.y = 0.3;
  group.add(candleMesh);

  // 4. Candle Flame (Ngọn lửa bập bùng)
  const flameGeo = new THREE.ConeGeometry(0.1, 0.35, 8);
  const flameMat = new THREE.MeshBasicMaterial({
    color: 0xffe600,
  });
  const flameMesh = new THREE.Mesh(flameGeo, flameMat);
  flameMesh.position.y = 0.65;
  flameMesh.name = 'flame';
  group.add(flameMesh);

// Shared radial glow texture for candle flames
let sharedCandleAura: THREE.CanvasTexture | null = null;
function getCandleAura(): THREE.CanvasTexture {
  if (!sharedCandleAura) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0.0, 'rgba(255, 255, 220, 1.0)');
      gradient.addColorStop(0.25, 'rgba(255, 180, 50, 0.75)');
      gradient.addColorStop(0.65, 'rgba(255, 100, 20, 0.2)');
      gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    sharedCandleAura = new THREE.CanvasTexture(canvas);
    sharedCandleAura.needsUpdate = true;
  }
  return sharedCandleAura;
}

  // 5. Warm candlelight glow aura (Sprite tỏa vầng hào quang ấm áp)
  const auraMat = new THREE.SpriteMaterial({
    map: getCandleAura(),
    color: 0xffaa44,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const auraSprite = new THREE.Sprite(auraMat);
  auraSprite.scale.set(1.6, 1.6, 1.6);
  auraSprite.position.y = 0.72;
  group.add(auraSprite);

  // Slightly enlarge lantern for crisp visibility from camera
  group.scale.set(1.2, 1.2, 1.2);

  return group;
}
