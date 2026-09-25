import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/**
 * КИНЕМАТОГРАФИЧЕСКИЙ ШЕЙДЕР ОБЪЕКТИВА И ПЛЕНКИ 35-ММ
 * Включает: физическую виньетку, хроматическую аберрацию линз,
 * органическое пленочное зерно и цветовой грейдинг.
 */
const CinematicOpticsShader = {
  name: 'CinematicOpticsShader',
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uVignetteIntensity: { value: 0.75 },
    uVignetteRoundness: { value: 0.85 },
    uAberration: { value: 0.0028 },
    uGrainIntensity: { value: 0.038 },
    uSaturation: { value: 1.08 },
    uContrast: { value: 1.05 }
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
    uniform float uVignetteIntensity;
    uniform float uVignetteRoundness;
    uniform float uAberration;
    uniform float uGrainIntensity;
    uniform float uSaturation;
    uniform float uContrast;
    varying vec2 vUv;

    // Быстрый высокочастотный псевдослучайный шум для зерна Kodak 35mm
    float filmNoise(vec2 uv, float t) {
      vec2 p = uv + fract(sin(t * 127.1 + uv.x * 311.7 + uv.y * 74.7) * 43758.5453);
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
    }

    void main() {
      vec2 uv = vUv;
      vec2 coordFromCenter = uv - 0.5;
      float distFromCenter = length(coordFromCenter);

      // 1. Хроматическая аберрация по краям линзы (Lens Dispersion)
      float ab = uAberration * (1.0 + distFromCenter * 2.4);
      float r = texture2D(tDiffuse, uv + coordFromCenter * ab).r;
      float g = texture2D(tDiffuse, uv).g;
      float b = texture2D(tDiffuse, uv - coordFromCenter * ab).b;
      vec3 color = vec3(r, g, b);

      // 2. Кинематографический контраст и насыщенность
      // Насыщенность (Luminance Rec.709)
      float lum = dot(color, vec3(0.2126, 0.7152, 0.0722));
      color = mix(vec3(lum), color, uSaturation);

      // Контраст (S-кривая)
      color = (color - 0.5) * uContrast + 0.5;

      // 3. Физическая виньетка объектива (Falloff)
      float vFactor = smoothstep(uVignetteRoundness, 0.25, distFromCenter);
      color *= mix(1.0, vFactor, uVignetteIntensity);

      // 4. Пленочное зерно (Film Grain)
      float grain = filmNoise(uv * 2.0, uTime) * uGrainIntensity;
      color += grain;

      gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
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

    // Честный 16-битный плавающий HDR RenderTarget.
    // Без него цвета ярче 1.0 обрезаются, а Bloom превращается в серое пятно.
    const hdrRenderTarget = new THREE.WebGLRenderTarget(this.width, this.height, {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      stencilBuffer: false,
      depthBuffer: true
    });

    this.composer = new EffectComposer(this.renderer, hdrRenderTarget);

    // 1. Базовый проход геометрии
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    // 2. Голливудский мягкий Bloom для неонов, фонарей и бликов инструментов
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.width, this.height),
      0.85,  // Интенсивность свечения
      0.45,  // Радиус рассеивания
      0.40   // Порог: светятся только яркие источники
    );
    this.composer.addPass(this.bloomPass);

    // 3. Тональная компрессия ACES Filmic и перевод в sRGB цветовое пространство
    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);

    // 4. Финальный оптический шейдер кинокамеры (аберрация, зерно, виньетка)
    this.opticsPass = new ShaderPass(CinematicOpticsShader);
    this.composer.addPass(this.opticsPass);
  }

  render(frame, isLightning = false) {
    this.opticsPass.uniforms.uTime.value = frame * 0.016;

    // Вспышка света временно снижает виньетку
    if (isLightning) {
      this.opticsPass.uniforms.uVignetteIntensity.value = 0.2;
    } else {
      this.opticsPass.uniforms.uVignetteIntensity.value = 0.75;
    }

    this.composer.render();
  }

  setSize(w, h) {
    this.width = w;
    this.height = h;
    this.composer.setSize(w, h);
  }
}
