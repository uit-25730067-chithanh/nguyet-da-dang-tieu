export const waterVertexShader = `
uniform float uTime;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vViewPosition;

void main() {
  vUv = uv;
  vec3 pos = position;

  // Gentle flowing harmonic water ripples
  float wave1 = sin(pos.x * 0.15 + uTime * 0.9) * 0.18;
  float wave2 = cos(pos.y * 0.12 + uTime * 0.7) * 0.14;
  float wave3 = sin((pos.x + pos.y) * 0.08 + uTime * 0.5) * 0.1;
  pos.z += wave1 + wave2 + wave3;

  // Compute analytical normal approximation
  float dWdx = 0.15 * 0.18 * cos(pos.x * 0.15 + uTime * 0.9);
  float dWdy = -0.12 * 0.14 * sin(pos.y * 0.12 + uTime * 0.7);
  vec3 calculatedNormal = normalize(vec3(-dWdx, -dWdy, 1.0));

  vNormal = normalize(normalMatrix * calculatedNormal);

  vec4 worldPos = modelMatrix * vec4(pos, 1.0);
  vWorldPosition = worldPos.xyz;

  vec4 mvPosition = viewMatrix * worldPos;
  vViewPosition = -mvPosition.xyz;

  gl_Position = projectionMatrix * mvPosition;
}
`;
