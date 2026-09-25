import * as THREE from 'three';
import { YokohamaEnvironment } from './environment.js';
import { NoirPostProcessing } from './postprocessing.js';
import { NoirDirector } from './director.js';

class NoirEngineApplication {
  constructor() {
    this.width = 1920;
    this.height = 1080;

    // 1. Инициализация аппаратного/программного WebGL рендерера
    this.canvas = document.getElementById('webgl-stage');
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // 2. Главная 3D-сцена и кинокамера с анаморфотным FOV
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, this.width / this.height, 0.1, 1000);

    // 3. Подключение погодного штормового окружения
    this.environment = new YokohamaEnvironment(this.scene);

    // 4. Подключение композитора пост-эффектов (Bloom, Rain, Grain)
    this.postProcessing = new NoirPostProcessing(
      this.renderer,
      this.scene,
      this.camera,
      this.width,
      this.height
    );

    // 5. Режиссер таймлайна и камеры
    this.director = new NoirDirector(this.camera);

    // Заглушка-сетка для предпросмотра до подключения файлов сцен
    this.createTemporaryStageGrid();

    // Регистрация глобальной точки рендера для Puppeteer
    window.renderFrame = (frameIndex) => this.renderFrame(frameIndex);
    window.__NOIR_ENGINE__ = this;
    window.__ENGINE_READY__ = true;

    console.log('[THREE] 3D-ядро Yokohama Noir успешно запущено.');
  }

  createTemporaryStageGrid() {
    // Временная визуализация мокрой поверхности гавани
    const groundGeo = new THREE.PlaneGeometry(300, 300);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x050b14,
      roughness: 0.15,
      metalness: 0.85
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    this.scene.add(ground);
  }

  renderFrame(frameIndex) {
    const isLightning = this.director.isLightningFrame(frameIndex);

    // 1. Обновление погодных систем и света молний
    this.environment.update(frameIndex, isLightning);

    // 2. Обновление режиссуры, положения 3D-камеры и HUD протокола
    this.director.update(frameIndex);

    // 3. Отрисовка кадра через шейдерный пост-процессинг
    this.postProcessing.render(frameIndex, isLightning);
  }
}

// Запуск приложения
const app = new NoirEngineApplication();
