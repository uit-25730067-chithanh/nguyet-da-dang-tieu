import * as THREE from 'three';
import { moonVertexShader } from './shaders/moon.vert';
import { moonFragmentShader } from './shaders/moon.frag';
import { waterVertexShader } from './shaders/water.vert';
import { waterFragmentShader } from './shaders/water.frag';
import { ParticleSystem } from './particles';
import { PerfManager } from './perf-manager';

export class SceneManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public perfManager: PerfManager;

  private moonMesh!: THREE.Mesh;
  private moonShaderMaterial!: THREE.ShaderMaterial;
  private waterMesh!: THREE.Mesh;
  private waterShaderMaterial!: THREE.ShaderMaterial;
  private particles!: ParticleSystem;

  private isRunning = false;
  private clock = new THREE.Clock();
  private updateCallbacks: ((time: number, dt: number) => void)[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.perfManager = new PerfManager();

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060814);
    this.scene.fog = new THREE.FogExp2(0x080c1e, 0.008);

    // 2. Camera setup
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 1000);
    this.camera.position.set(0, 6.5, 24);
    this.camera.lookAt(0, 3.0, -40);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // 4. Handle WebGL context loss
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      console.warn('[SceneManager] WebGL Context Lost! Switching to defensive mode.');
      this.perfManager.setContextLost(true);
      this.stop();
    });

    canvas.addEventListener('webglcontextrestored', () => {
      console.log('[SceneManager] WebGL Context Restored! Reinitializing...');
      this.perfManager.setContextLost(false);
      this.initObjects();
      this.start();
    });

    // 5. Initialize lighting & objects
    this.initLighting();
    this.initObjects();

    // 6. Listen to performance changes
    this.perfManager.onTierChange((tier) => {
      this.particles.setQuality(tier);
      if (tier === 'low') {
        this.renderer.setPixelRatio(1.0);
      } else {
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      }
    });

    // 7. Window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private initLighting(): void {
    // Subtle ambient light (deep midnight blue)
    const ambient = new THREE.AmbientLight(0x0d1733, 1.2);
    this.scene.add(ambient);

    // Directional moonlight (warm silver-gold coming from the moon in distance)
    const moonLight = new THREE.DirectionalLight(0xffeaad, 1.8);
    moonLight.position.set(0, 40, -110);
    moonLight.target.position.set(0, 0, 0);
    this.scene.add(moonLight);
    this.scene.add(moonLight.target);
  }

  private initObjects(): void {
    // A. Full Moon with Atmospheric GLSL Shader
    const moonRadius = 9.5;
    const moonGeo = new THREE.SphereGeometry(moonRadius, 48, 48);

    this.moonShaderMaterial = new THREE.ShaderMaterial({
      vertexShader: moonVertexShader,
      fragmentShader: moonFragmentShader,
      uniforms: {
        uColor: { value: new THREE.Color(0xfff6cf) },
        uGlowColor: { value: new THREE.Color(0xffd15c) },
        uTime: { value: 0 },
      },
    });

    this.moonMesh = new THREE.Mesh(moonGeo, this.moonShaderMaterial);
    // Placed far on the horizon, slightly above the mountains
    this.moonMesh.position.set(0, 32, -120);
    this.scene.add(this.moonMesh);

    // B. River Water Surface with Specular Moonlight Shader
    const waterGeo = new THREE.PlaneGeometry(140, 220, 96, 96);
    this.waterShaderMaterial = new THREE.ShaderMaterial({
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
      uniforms: {
        uDeepWaterColor: { value: new THREE.Color(0x040714) },
        uShallowWaterColor: { value: new THREE.Color(0x0a1638) },
        uMoonPosition: { value: this.moonMesh.position },
        uMoonLightColor: { value: new THREE.Color(0xffe082) },
        uTime: { value: 0 },
      },
      transparent: true,
      depthWrite: true,
    });

    this.waterMesh = new THREE.Mesh(waterGeo, this.waterShaderMaterial);
    this.waterMesh.rotation.x = -Math.PI / 2;
    this.waterMesh.position.set(0, 0, -20);
    this.scene.add(this.waterMesh);

    // C. Particle System: Stars & Fireflies
    this.particles = new ParticleSystem(1600, 160);
    this.scene.add(this.particles.starsMesh);
    this.scene.add(this.particles.firefliesMesh);
  }

  private onWindowResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  public onUpdate(callback: (time: number, dt: number) => void): void {
    this.updateCallbacks.push(callback);
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.clock.start();
    this.animate();
  }

  public stop(): void {
    this.isRunning = false;
  }

  private animate = (): void => {
    if (!this.isRunning) return;

    requestAnimationFrame(this.animate);

    const dt = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Update shaders
    if (this.waterShaderMaterial) {
      this.waterShaderMaterial.uniforms.uTime.value = elapsedTime;
    }
    if (this.moonShaderMaterial) {
      this.moonShaderMaterial.uniforms.uTime.value = elapsedTime;
      // Very slow subtle lunar rotation
      this.moonMesh.rotation.y = elapsedTime * 0.015;
    }

    // 2. Update fireflies & stars
    if (this.particles) {
      this.particles.update(elapsedTime, dt);
    }

    // 3. Update external subscribers (Physics, Lanterns)
    for (const callback of this.updateCallbacks) {
      callback(elapsedTime, dt);
    }

    // 4. Update performance monitor
    this.perfManager.update();

    // 5. Render
    this.renderer.render(this.scene, this.camera);
  };
}
