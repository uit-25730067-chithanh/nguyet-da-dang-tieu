export const moonFragmentShader = `
uniform vec3 uColor;
uniform vec3 uGlowColor;
uniform float uTime;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vViewPosition;

// Simple pseudo-random hash
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// 2D Perlin-like Value Noise
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

// Fractional Brownian Motion for lunar craters/mares
float fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amp * noise(p);
    p *= 2.1;
    amp *= 0.5;
  }
  return value;
}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);

  // Surface crater texture via FBM noise
  float surfaceNoise = fbm(vUv * 8.0);
  vec3 baseColor = mix(uColor * 0.85, uColor * 1.05, surfaceNoise);

  // Subtle dark lunar seas (Maria)
  float mareMask = smoothstep(0.4, 0.7, fbm(vUv * 3.5 + vec2(1.2, 0.5)));
  baseColor = mix(baseColor, baseColor * 0.78, mareMask);

  // Atmospheric rim glow (Fresnel falloff)
  float rim = 1.0 - max(0.0, dot(normal, viewDir));
  float rimGlow = pow(rim, 2.0);

  vec3 finalColor = baseColor + uGlowColor * (rimGlow * 1.4);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;
