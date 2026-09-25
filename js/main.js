import * as THREE from 'three';
import { YokohamaEnvironment } from './environment.js';
import { NoirPostProcessing } from './postprocessing.js';
import { NoirDirector } from './director.js';

// Импорт всех 5 киносцен
import { Scene1Bay } from './scenes/scene1_bay.js';
import { Scene2Docks } from './scenes/scene2_docks.js';
import { Scene3Neon } from './scenes/scene3_neon.js';
import { Scene4Forensics } from './scenes/scene4_forensics.js';
import { Scene5Osanbashi } from './scenes/scene5_osanbashi.js';

/**
 * ГЛАВНЫЙ КОНТРОЛЛЕР 3D-ФИЛЬМА «ИОКОГАМА // ХРОНИКА ОСОБОГО ОТДЕЛА»
 */
class YokohamaNoirMasterEngine {
  constructor() {
    this.width = 1920;
    this.height = 1080;
    this.totalFrames = 1800; // 30 секунд при 60 FPS
    this.currentFrame = 0;
    this.isPlaying = false;
    this.isHeadlessCapture = false;

    // 1. Инициализация WebGL Рендерера Three.js
    this.canvas = document.getElementById('webgl-stage');
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false, // Антиалиасинг берет на себя пост-процессинг
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // 2. Главная сцена и кинокамера
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, this.width / this.height, 0.1, 1000);

    // 3. Подключение штормовой погоды (12 000 частиц дождя, туман, ветер)
    this.environment = new YokohamaEnvironment(this.scene);

    // 4. Кинематографический пост-процессинг (Bloom, Rain on Lens, 35mm Grain)
    this.postProcessing = new NoirPostProcessing(
      this.renderer,
      this.scene,
      this.camera,
      this.width,
      this.height
    );

    // 5. Режиссер таймлайна и камеры
    this.director = new NoirDirector(this.camera);

    // 6. Инициализация всех 5 сцен
    console.log('[THREE] Загрузка 3D-эпизодов Иокогамы...');
    this.scene1 = new Scene1Bay(this.scene);
    this.scene2 = new Scene2Docks(this.scene);
    this.scene3 = new Scene3Neon(this.scene);
    this.scene4 = new Scene4Forensics(this.scene);
    this.scene5 = new Scene5Osanbashi(this.scene);

    // Регистрация сцен в директоре
    this.director.registerScene('scene1', this.scene1);
    this.director.registerScene('scene2', this.scene2);
    this.director.registerScene('scene3', this.scene3);
    this.director.registerScene('scene4', this.scene4);
    this.director.registerScene('scene5', this.scene5);

    // Первичная отрисовка нулевого кадра
    this.renderFrame(0);

    // Регистрация глобальных точек входа для Puppeteer
    window.renderFrame = (frameIndex) => {
      this.isHeadlessCapture = true;
      this.renderFrame(frameIndex);
    };
    window.__ENGINE_READY__ = true;
    window.__NOIR_ENGINE__ = this;

    // Настройка локального интерактивного управления
    this.initKeyboardControls();
    this.startLivePlaybackLoop();

    console.log('[THREE] Все 5 сцен успешно подключены. Фильм готов к рендеру.');
  }

  // =========================================================================
  // ОСНОВНОЙ КОНВЕЙЕР РЕНДЕРА КАДРА (ВЫЗЫВАЕТСЯ ПОКАДРОВО ИЛИ В LIVE-РЕЖИМЕ)
  // =========================================================================
  renderFrame(frameIndex) {
    this.currentFrame = THREE.MathUtils.clamp(frameIndex, 0, this.totalFrames - 1);
    const f = this.currentFrame;

    // 1. Управление видимостью сцен для максимальной производительности
    this.scene1.group.visible = (f >= 0 && f < 360);
    this.scene2.group.visible = (f >= 360 && f < 720);
    this.scene3.group.visible = (f >= 720 && f < 1080);
    this.scene4.group.visible = (f >= 1080 && f < 1440);
    this.scene5.group.visible = (f >= 1440 && f < 1800);

    // 2. В 4-й сцене (закрытая комната экспертизы) штормовой дождь отключается
    const isInteriorScene = (f >= 1080 && f < 1440);
    this.environment.rainSystem.visible = !isInteriorScene;
    this.environment.splashSystem.visible = !isInteriorScene;

    // 3. Проверка на кадры удара молнии
    const isLightning = this.director.isLightningFrame(f);

    // 4. Обновление физики дождя, брызг и света молний
    this.environment.update(f, isLightning);

    // 5. Обновление режиссуры, траектории камеры, активной сцены и HUD
    this.director.update(f);

    // 6. Отрисовка через шейдерный пост-процессинг (Bloom, Rain, Grain)
    this.postProcessing.render(f, isLightning);
  }

  // =========================================================================
  // ЛОКАЛЬНЫЙ ИНТЕРАКТИВНЫЙ ПЛЕЕР ДЛЯ ПРЕДПРОСМОТРА В ОБЫЧНОМ БРАУЗЕРЕ
  // =========================================================================
  startLivePlaybackLoop() {
    let lastTime = performance.now();
    const frameDuration = 1000 / 60; // 16.66 мс на кадр (60 FPS)

    const loop = (currentTime) => {
      requestAnimationFrame(loop);

      // Если запущен захват Puppeteer — отключаем свободный цикл
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
      // Пробел — Старт/Пауза
      if (e.code === 'Space') {
        e.preventDefault();
        this.isPlaying = !this.isPlaying;
        console.log(`[ПЛЕЕР] ${this.isPlaying ? 'ВОСПРОИЗВЕДЕНИЕ' : 'ПАУЗА'} | Кадр: ${this.currentFrame}`);
      }

      // Стрелка вправо — на 1 кадр вперед
      if (e.code === 'ArrowRight') {
        this.isPlaying = false;
        this.renderFrame(this.currentFrame + 1);
      }

      // Стрелка влево — на 1 кадр назад
      if (e.code === 'ArrowLeft') {
        this.isPlaying = false;
        this.renderFrame(this.currentFrame - 1);
      }

      // Цифры 1 - 5: быстрый переход к соответствующей сцене
      if (e.key === '1') { this.isPlaying = false; this.renderFrame(0); }
      if (e.key === '2') { this.isPlaying = false; this.renderFrame(360); }
      if (e.key === '3') { this.isPlaying = false; this.renderFrame(720); }
      if (e.key === '4') { this.isPlaying = false; this.renderFrame(1080); }
      if (e.key === '5') { this.isPlaying = false; this.renderFrame(1440); }
    });
  }
}

// Запуск 3D-движка
const noirEngine = new YokohamaNoirMasterEngine(); 
