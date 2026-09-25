export const waterFragmentShader = `
uniform vec3 uDeepWaterColor;
uniform vec3 uShallowWaterColor;
uniform vec3 uMoonPosition;
uniform vec3 uMoonLightColor;
uniform float uTime;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vViewPosition;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);

  // Direction to the moon
  vec3 lightDir = normalize(uMoonPosition - vWorldPosition);

  // Fresnel reflectance: more reflective at grazing angles
  float fresnel = 0.05 + 0.95 * pow(1.0 - max(0.0, dot(normal, viewDir)), 4.0);

  // Moonlight specular path on the water
  vec3 halfDir = normalize(lightDir + viewDir);
  float specAngle = max(0.0, dot(normal, halfDir));
  float specular = pow(specAngle, 64.0);

  // Specular trail elongation along the river
  float trailMask = smoothstep(25.0, 0.0, abs(vWorldPosition.x));
  vec3 moonReflection = uMoonLightColor * (specular * 2.5 * trailMask);

  // Deep water gradient
  vec3 waterBase = mix(uDeepWaterColor, uShallowWaterColor, fresnel * 0.4);

  // Soft ambient lunar shimmer
  float shimmer = sin(vWorldPosition.x * 2.0 + uTime * 2.0) * sin(vWorldPosition.z * 2.0 + uTime * 1.5) * 0.03;
  waterBase += uMoonLightColor * max(0.0, shimmer);

  vec3 finalColor = waterBase + moonReflection;

  gl_FragColor = vec4(finalColor, 0.92);
}
`;
