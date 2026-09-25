import * as THREE from 'three';

export function createStarLanternMesh(): THREE.Group {
  const group = new THREE.Group();

  // Create 5-point star shape
  const starShape = new THREE.Shape();
  const points = 5;
  const outerRadius = 1.2;
  const innerRadius = 0.52;

  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) {
      starShape.moveTo(x, y);
    } else {
      starShape.lineTo(x, y);
    }
  }
  starShape.closePath();

  // Extrude star to give it bamboo frame depth
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.28,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.05,
    bevelThickness: 0.05,
  };
  const starGeo = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
  starGeo.center();

  // Red translucent cellophane paper material
  const starMat = new THREE.MeshStandardMaterial({
    color: 0xe63946,
    emissive: 0xff4d6d,
    emissiveIntensity: 0.45,
    roughness: 0.3,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide,
  });

  const starMesh = new THREE.Mesh(starGeo, starMat);
  group.add(starMesh);

  // Outer bamboo ring (Vòng tròn nan tre truyền thống giữ khung sao)
  const ringGeo = new THREE.TorusGeometry(0.85, 0.04, 8, 32);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xd4a373,
    roughness: 0.9,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  group.add(ringMesh);

  // Center candle core
  const coreGeo = new THREE.SphereGeometry(0.25, 12, 12);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xffd15c,
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  coreMesh.name = 'flame';
  group.add(coreMesh);

  // Bamboo stem handle (Cán tre nhỏ)
  const handleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8);
  const handleMesh = new THREE.Mesh(handleGeo, ringMat);
  handleMesh.position.y = -1.2;
  group.add(handleMesh);

  return group;
}
