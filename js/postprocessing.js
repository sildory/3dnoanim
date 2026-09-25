import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// Кастомный голливудский шейдер: преломление капель дождя на линзе, анаморфотный блик, зерно и аберрация
const YokohamaCinematicShader = {
  name: 'YokohamaCinematicShader',
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uRainAmount: { value: 0.65 },
    uVignette: { value: 0.85 },
    uGrainIntensity: { value: 0.045 },
    uAberration: { value: 0.0035 },
    uLightningFlash: { value: 0.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uRainAmount;
    uniform float uVignette;
    uniform float uGrainIntensity;
    uniform float uAberration;
    uniform float uLightningFlash;
    varying vec2 vUv;

    // Быстрый хэш для генерации 35мм плёночного зерна
    float hash(vec2 p) {
      vec3 p3  = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }

    // Имитация преломления капли воды на стекле объектива
    vec2 getDropletOffset(vec2 uv, float t) {
      vec2 st = uv * vec2(16.0, 9.0);
      vec2 id = floor(st);
      vec2 gv = fract(st) - 0.5;

      float n = hash(id);
      float dropSpeed = 0.18 + n * 0.35;
      float yOffset = fract(t * dropSpeed + n);
      
      vec2 dropPos = vec2(sin(n * 6.28) * 0.25, -yOffset + 0.5);
      float dist = length(gv - dropPos);

      float r = 0.08 + n * 0.12;
      if (dist < r) {
        vec2 normal = (gv - dropPos) / r;
        return normal * 0.045 * (1.0 - dist / r);
      }
      return vec2(0.0);
    }

    void main() {
      vec2 uv = vUv;

      // 1. Оптическое преломление дождя на линзе камеры
      vec2 dropDistort = getDropletOffset(uv, uTime) * uRainAmount;
      vec2 sceneUv = uv + dropDistort;

      // 2. Хроматическая аберрация (смещение каналов RGB по краям кадра)
      vec2 toCenter = sceneUv - 0.5;
      float d = length(toCenter);
      float ab = uAberration * (1.0 + d * 2.2) + (uLightningFlash * 0.008);

      float r = texture2D(tDiffuse, sceneUv + toCenter * ab).r;
      float g = texture2D(tDiffuse, sceneUv).g;
      float b = texture2D(tDiffuse, sceneUv - toCenter * ab).b;
      vec3 color = vec3(r, g, b);

      // 3. Анаморфотный кино-блик в средних тонах (Cold Noir Color Grade)
      color = mix(color, vec3(color.r * 0.85, color.g * 1.05, color.b * 1.25), 0.28);

      // 4. Оптическая виньетка объектива 35-мм
      float vig = 1.0 - smoothstep(0.3, 0.95, d);
      color *= mix(1.0, vig, uVignette);

      // 5. Киноплёночное зерно (35mm Film Grain)
      float grain = (hash(uv * 1000.0 + fract(uTime * 43.12)) - 0.5) * uGrainIntensity;
      color += grain;

      // 6. Заливка кадра при вспышке молнии
      if (uLightningFlash > 0.0) {
        color = mix(color, vec3(0.9, 0.95, 1.0), uLightningFlash * 0.85);
      }

      gl_FragColor = vec4(color, 1.0);
    }
  `
};

export class NoirPostProcessing {
  constructor(renderer, scene, camera, width, height) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.width = width;
    this.height = height;

    this.composer = new EffectComposer(this.renderer);

    // 1. Базовый проход рендера сцены
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // 2. Голливудский UnrealBloom (мягкое неоновое свечение ночного города)
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.width, this.height),
      0.95,  // strength
      0.55,  // radius
      0.18   // threshold
    );
    this.composer.addPass(this.bloomPass);

    // 3. Кастомный анаморфотный шейдер капель дождя и кинематографии
    this.cinematicPass = new ShaderPass(YokohamaCinematicShader);
    this.composer.addPass(this.cinematicPass);

    // 4. Финальный выходной цветовой проход (sRGB / Tone Mapping)
    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  render(frame, isLightning = false) {
    this.cinematicPass.uniforms.uTime.value = frame * 0.016;
    this.cinematicPass.uniforms.uLightningFlash.value = isLightning ? 0.95 : 0.0;
    this.composer.render();
  }

  setSize(w, h) {
    this.width = w;
    this.height = h;
    this.composer.setSize(w, h);
  }
}
