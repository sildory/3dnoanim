import * as THREE from 'three';
import { YokohamaEnvironment } from './environment.js';
import { NoirPostProcessing } from './postprocessing.js';
import { NoirDirector } from './director.js';

// Импорт текущих сцен
import { Scene1Bay } from './scenes/scene1_bay.js';
import { Scene2Docks } from './scenes/scene2_docks.js';
import { Scene3Neon } from './scenes/scene3_neon.js';
import { Scene4Forensics } from './scenes/scene4_forensics.js';
import { Scene5Osanbashi } from './scenes/scene5_osanbashi.js';

/**
 * ГЛАВНЫЙ ГРАФИЧЕСКИЙ ДВИЖОК CINEMATIC 3D
 */
class Cinema3DEngine {
  constructor() {
    this.width = 1920;
    this.height = 1080;
    this.totalFrames = 1800; // 30 секунд при 60 FPS
    this.currentFrame = 0;
    this.isPlaying = false;
    this.isHeadlessCapture = false;

    // 1. Инициализация WebGL Canvas
    this.canvas = document.getElementById('webgl-stage');

    const contextAttributes = {
      alpha: false,
      antialias: false,
      depth: true,
      stencil: false,
      failIfMajorPerformanceCaveat: false,
      powerPreference: 'high-performance'
    };

    const gl = this.canvas.getContext('webgl2', contextAttributes) ||
               this.canvas.getContext('webgl', contextAttributes);

    if (!gl) {
      throw new Error('Критическая ошибка: невозможно инициализировать WebGL контекст.');
    }

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      context: gl,
      antialias: false,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false,
      stencil: false,
      depth: true
    });

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(1);

    // Включаем честные мягкие тени (Soft Shadows)
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Кинематографический тонокорректор ACES Filmic
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // 2. Главная сцена и кинокамера (эквивалент 35-мм объектива)
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, this.width / this.height, 0.1, 1000);

    // 3. Процедурная карта IBL (Image-Based Lighting)
    // Благодаря ей металлические инструменты, хром и мокрые поверхности
    // получают реалистичные отражения горизонта и неба вместо черной пустоты
    this.initProceduralIBL();

    // 4. Окружение
    this.environment = new YokohamaEnvironment(this.scene);

    // 5. HDR Пост-процессинг
    this.postProcessing = new NoirPostProcessing(
      this.renderer,
      this.scene,
      this.camera,
      this.width,
      this.height
    );

    // 6. Режиссер таймлайна
    this.director = new NoirDirector(this.camera);

    // 7. Подключение сцен
    console.log('[ENGINE] Инициализация 3D сцен...');
    this.scene1 = new Scene1Bay(this.scene);
    this.scene2 = new Scene2Docks(this.scene);
    this.scene3 = new Scene3Neon(this.scene);
    this.scene4 = new Scene4Forensics(this.scene);
    this.scene5 = new Scene5Osanbashi(this.scene);

    this.director.registerScene('scene1', this.scene1);
    this.director.registerScene('scene2', this.scene2);
    this.director.registerScene('scene3', this.scene3);
    this.director.registerScene('scene4', this.scene4);
    this.director.registerScene('scene5', this.scene5);

    // Первичный прогревочный рендер нулевого кадра
    this.renderFrame(0);

    // Точка входа для бескомпромиссного покадрового рендера через Puppeteer в Actions
    window.renderFrame = (frameIndex) => {
      this.isHeadlessCapture = true;
      this.renderFrame(frameIndex);
    };
    window.__ENGINE_READY__ = true;
    window.__NOIR_ENGINE__ = this;

    // Локальный предпросмотр (если проект открывается локально)
    this.initKeyboardControls();
    this.startLivePlaybackLoop();

    console.log('[ENGINE] Графическое ядро успешно инициализировано в HDR режиме.');
  }

  /**
   * Генерация студийного HDR-купола освещения на лету.
   * Не требует загрузки тяжелых внешних .hdr файлов (нет риска сбоя сети в GitHub Actions).
   */
  initProceduralIBL() {
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Кинематографический градиент: зенит, теплый горизонт и глубокая земля
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0.0, '#0a1424');  // Глубокое ночное небо
    grad.addColorStop(0.42, '#1e293b'); // Сумрачный купол
    grad.addColorStop(0.50, '#d97706'); // Теплая янтарная полоса горизонта
    grad.addColorStop(0.56, '#0f172a'); // Силуэт города у земли
    grad.addColorStop(1.0, '#020408');  // Нижняя полусфера (асфальт)

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;

    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    this.scene.environment = envMap;

    texture.dispose();
    pmremGenerator.dispose();
  }

  // =========================================================================
  // ОСНОВНОЙ КОНВЕЙЕР РЕНДЕРА ОДНОГО КАДРА
  // =========================================================================
  renderFrame(frameIndex) {
    this.currentFrame = THREE.MathUtils.clamp(frameIndex, 0, this.totalFrames - 1);
    const f = this.currentFrame;

    // 1. Управление видимостью сцен для экономии ресурсов
    this.scene1.group.visible = (f >= 0 && f < 360);
    this.scene2.group.visible = (f >= 360 && f < 720);
    this.scene3.group.visible = (f >= 720 && f < 1080);
    this.scene4.group.visible = (f >= 1080 && f < 1440);
    this.scene5.group.visible = (f >= 1440 && f < 1800);

    const isInteriorScene = (f >= 1080 && f < 1440);
    if (this.environment.rainSystem) {
      this.environment.rainSystem.visible = !isInteriorScene;
    }
    if (this.environment.splashSystem) {
      this.environment.splashSystem.visible = !isInteriorScene;
    }

    // 2. Свет молнии / вспышек
    const isLightning = this.director.isLightningFrame ? this.director.isLightningFrame(f) : false;

    // 3. Обновление физики окружения
    this.environment.update(f, isLightning);

    // 4. Обновление директивы камеры и активной сцены
    this.director.update(f);

    // 5. Отрисовка кадра через HDR композер
    this.postProcessing.render(f, isLightning);
  }

  // =========================================================================
  // ЛОКАЛЬНЫЙ РЕЖИМ ПРЕДПРОСМОТРА
  // =========================================================================
  startLivePlaybackLoop() {
    let lastTime = performance.now();
    const frameDuration = 1000 / 60;

    const loop = (currentTime) => {
      requestAnimationFrame(loop);
      if (this.isHeadlessCapture) return;

      if (this.isPlaying) {
        const delta = currentTime - lastTime;
        if (delta >= frameDuration) {
          lastTime = currentTime - (delta % frameDuration);
          this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
          this.renderFrame(this.currentFrame);
        }
      }
    };
    requestAnimationFrame(loop);
  }

  initKeyboardControls() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.isPlaying = !this.isPlaying;
      }
      if (e.code === 'ArrowRight') {
        this.isPlaying = false;
        this.renderFrame(this.currentFrame + 1);
      }
      if (e.code === 'ArrowLeft') {
        this.isPlaying = false;
        this.renderFrame(this.currentFrame - 1);
      }
    });
  }
}

// Запуск
new Cinema3DEngine(); 
