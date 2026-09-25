import * as THREE from 'three';

export class YokohamaEnvironment {
  constructor(scene) {
    this.scene = scene;

    // Глубокий чернильно-синий туман Токийского залива
    this.scene.fog = new THREE.FogExp2(0x02050e, 0.014);

    // 12 000 частиц косого штормового 3D-дождя
    this.rainCount = 12000;
    this.rainGeometry = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(this.rainCount * 6); // По 2 вершины на отрезок капли
    const rainVelocities = new Float32Array(this.rainCount);

    this.rainBounds = {
      xMin: -120, xMax: 120,
      yMin: -5,   yMax: 90,
      zMin: -120, zMax: 120
    };

    const windAngle = 0.28; // Смещение ветра тайфуна
    const dropLength = 2.4;

    for (let i = 0; i < this.rainCount; i++) {
      const idx = i * 6;
      const x = THREE.MathUtils.randFloat(this.rainBounds.xMin, this.rainBounds.xMax);
      const y = THREE.MathUtils.randFloat(this.rainBounds.yMin, this.rainBounds.yMax);
      const z = THREE.MathUtils.randFloat(this.rainBounds.zMin, this.rainBounds.zMax);

      rainPositions[idx]     = x;
      rainPositions[idx + 1] = y;
      rainPositions[idx + 2] = z;

      rainPositions[idx + 3] = x + Math.sin(windAngle) * dropLength;
      rainPositions[idx + 4] = y - Math.cos(windAngle) * dropLength;
      rainPositions[idx + 5] = z;

      rainVelocities[i] = THREE.MathUtils.randFloat(1.8, 3.2);
    }

    this.rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

    this.rainMaterial = new THREE.LineBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.rainSystem = new THREE.LineSegments(this.rainGeometry, this.rainMaterial);
    this.scene.add(this.rainSystem);

    this.rainVelocities = rainVelocities;

    // 3D-брызги о землю (Splash Particles)
    this.splashCount = 800;
    this.splashGeometry = new THREE.BufferGeometry();
    const splashPositions = new Float32Array(this.splashCount * 3);
    const splashLifes = new Float32Array(this.splashCount);

    for (let i = 0; i < this.splashCount; i++) {
      splashPositions[i * 3]     = THREE.MathUtils.randFloat(-40, 40);
      splashPositions[i * 3 + 1] = 0.05;
      splashPositions[i * 3 + 2] = THREE.MathUtils.randFloat(-40, 40);
      splashLifes[i] = Math.random();
    }

    this.splashGeometry.setAttribute('position', new THREE.BufferAttribute(splashPositions, 3));
    this.splashMaterial = new THREE.PointsMaterial({
      color: 0xbfdbfe,
      size: 0.22,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.splashSystem = new THREE.Points(this.splashGeometry, this.splashMaterial);
    this.scene.add(this.splashSystem);
    this.splashLifes = splashLifes;

    // Освещение штормовой ночи
    this.ambientLight = new THREE.AmbientLight(0x0a1324, 1.2);
    this.scene.add(this.ambientLight);

    // Холодный контровой свет доков
    this.moonLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
    this.moonLight.position.set(40, 60, -50);
    this.scene.add(this.moonLight);

    // Мощный источник вспышки молнии
    this.lightningLight = new THREE.DirectionalLight(0xf0fdf4, 0.0);
    this.lightningLight.position.set(10, 100, 20);
    this.scene.add(this.lightningLight);
  }

  // Обновление физики погоды для каждого кадра
  update(frame, isLightning = false) {
    const pos = this.rainGeometry.attributes.position.array;
    const count = this.rainCount;
    const windX = 0.45;
    const dropLen = 2.4;

    for (let i = 0; i < count; i++) {
      const idx = i * 6;
      const spd = this.rainVelocities[i];

      pos[idx + 1] -= spd;
      pos[idx]     += windX * (spd * 0.35);

      // Если капля упала ниже земли — переносим её наверх
      if (pos[idx + 1] < this.rainBounds.yMin) {
        pos[idx + 1] = this.rainBounds.yMax;
        pos[idx]     = THREE.MathUtils.randFloat(this.rainBounds.xMin, this.rainBounds.xMax);
        pos[idx + 2] = THREE.MathUtils.randFloat(this.rainBounds.zMin, this.rainBounds.zMax);
      }

      pos[idx + 4] = pos[idx + 1] - dropLen;
      pos[idx + 3] = pos[idx] + 0.32;
      pos[idx + 5] = pos[idx + 2];
    }
    this.rainGeometry.attributes.position.needsUpdate = true;

    // Анимация брызг
    const sPos = this.splashGeometry.attributes.position.array;
    for (let i = 0; i < this.splashCount; i++) {
      this.splashLifes[i] += 0.045;
      if (this.splashLifes[i] > 1.0) {
        this.splashLifes[i] = 0;
        sPos[i * 3]     = THREE.MathUtils.randFloat(-50, 50);
        sPos[i * 3 + 1] = 0.05 + Math.random() * 0.2;
        sPos[i * 3 + 2] = THREE.MathUtils.randFloat(-50, 50);
      }
    }
    this.splashGeometry.attributes.position.needsUpdate = true;

    // Вспышка молнии
    if (isLightning) {
      this.lightningLight.intensity = 18.0;
      this.ambientLight.intensity = 4.5;
      this.scene.fog.density = 0.006;
    } else {
      this.lightningLight.intensity = 0.0;
      this.ambientLight.intensity = 1.2;
      this.scene.fog.density = 0.014;
    }
  }
      }
