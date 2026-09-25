import * as THREE from 'three';

/**
 * УНИВЕРСАЛЬНЫЙ КИНЕМАТОГРАФИЧЕСКИЙ ДВИЖОК ОКРУЖЕНИЯ
 * Лос-Анджелес (Золотой час / Сансет) <--> Майами (Неоновая ночь / Джаз)
 */
export class CinematicEnvironment {
  constructor(scene) {
    this.scene = scene;

    // 1. Адаптивный атмосферный туман (начало в палитре LA Sunset)
    this.fogColorLA = new THREE.Color(0x28120b);     // Теплый терракотовый смог ЛА
    this.fogColorMiami = new THREE.Color(0x060914);  // Глубокий ночной океан Майами
    this.scene.fog = new THREE.FogExp2(this.fogColorLA.getHex(), 0.012);

    // 2. Процедурный небесный купол (Sky Dome) на шейдере
    this.initSkyDome();

    // 3. Кинематографическая 3-точечная система света с мягкими тенями
    this.initLightingRig();

    // 4. Кинематографическая атмосферная взвесь (Dust Motes & Ocean Haze)
    this.initAtmosphericParticles();

    // 5. Заглушки для обратной совместимости с существующим кодом
    this.rainSystem = new THREE.Group();
    this.splashSystem = new THREE.Group();
    this.scene.add(this.rainSystem);
    this.scene.add(this.splashSystem);
  }

  // =========================================================================
  // 1. ШЕЙДЕРНЫЙ НЕБЕСНЫЙ КУПОЛ (SKY DOME)
  // =========================================================================
  initSkyDome() {
    const skyGeo = new THREE.SphereGeometry(450, 32, 24);

    this.skyUniforms = {
      uColorZenith: { value: new THREE.Color(0x181432) },   // Сумеречный фиолетовый
      uColorHorizon: { value: new THREE.Color(0xf97316) },  // Закатный калифорнийский апельсин
      uColorGround: { value: new THREE.Color(0x120804) }    // Темный теплый асфальт
    };

    const skyMat = new THREE.ShaderMaterial({
      uniforms: this.skyUniforms,
      side: THREE.BackSide,
      depthWrite: false,
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColorZenith;
        uniform vec3 uColorHorizon;
        uniform vec3 uColorGround;
        varying vec3 vWorldPosition;

        void main() {
          float h = normalize(vWorldPosition).y;
          vec3 col;
          if (h > 0.0) {
            // Плавный переход от горизонта к зениту
            col = mix(uColorHorizon, uColorZenith, pow(h, 0.45));
          } else {
            // Переход к горизонту земли
            col = mix(uColorHorizon, uColorGround, pow(-h, 0.7));
          }
          gl_FragColor = vec4(col, 1.0);
        }
      `
    });

    this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyMesh);
  }

  // =========================================================================
  // 2. СВЕТОВАЯ СИСТЕМА: КЛЮЧЕВОЙ, КОНТРОВОЙ И ЗАПОЛНЯЮЩИЙ СВЕТ С ТЕНЯМИ
  // =========================================================================
  initLightingRig() {
    // 1. Базовый заполняющий свет (Ambient)
    this.ambientLight = new THREE.AmbientLight(0x38201a, 0.75);
    this.scene.add(this.ambientLight);

    // 2. Ключевой свет (Солнце в ЛА / Луна в Майами) с генерацией теней
    this.keyLight = new THREE.DirectionalLight(0xffb74d, 3.2);
    this.keyLight.position.set(42, 22, -35); // Низкий закатный угол ЛА
    this.keyLight.castShadow = true;

    // Настройка разрешения и резкости теней
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 160;
    this.keyLight.shadow.camera.left = -35;
    this.keyLight.shadow.camera.right = 35;
    this.keyLight.shadow.camera.top = 35;
    this.keyLight.shadow.camera.bottom = -35;
    this.keyLight.shadow.bias = -0.0004;
    this.keyLight.shadow.normalBias = 0.02;

    this.scene.add(this.keyLight);

    // 3. Контровой кинематографический свет (Rim Light) для отделения силуэтов
    this.rimLight = new THREE.DirectionalLight(0xec4899, 1.8);
    this.rimLight.position.set(-35, 18, 25);
    this.scene.add(this.rimLight);

    // 4. Мягкий рассеянный свет неба (Hemisphere)
    this.hemiLight = new THREE.HemisphereLight(0xffedd5, 0x1e1208, 0.85);
    this.scene.add(this.hemiLight);

    // 5. Импульсный свет (для сценических вспышек или сольных акцентов)
    this.accentSpot = new THREE.PointLight(0x06b6d4, 0.0, 45);
    this.accentSpot.position.set(0, 12, 0);
    this.scene.add(this.accentSpot);
  }

  // =========================================================================
  // 3. СИСТЕМА КИНЕМАТОГРАФИЧЕСКОЙ ВЗВЕСИ (ЧАСТИЦЫ В ЛУЧАХ СВЕТА)
  // =========================================================================
  initAtmosphericParticles() {
    this.moteCount = 3500;
    this.moteGeo = new THREE.BufferGeometry();

    const positions = new Float32Array(this.moteCount * 3);
    this.moteVelocities = [];

    this.moteBounds = {
      x: 70,
      yMin: 0.2,
      yMax: 28,
      z: 70
    };

    for (let i = 0; i < this.moteCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * this.moteBounds.x;
      positions[i * 3 + 1] = THREE.MathUtils.randFloat(this.moteBounds.yMin, this.moteBounds.yMax);
      positions[i * 3 + 2] = (Math.random() - 0.5) * this.moteBounds.z;

      this.moteVelocities.push({
        x: (Math.random() - 0.5) * 0.015,
        y: THREE.MathUtils.randFloat(-0.006, 0.012), // Медленное парение
        z: (Math.random() - 0.5) * 0.015,
        phase: Math.random() * Math.PI * 2
      });
    }

    this.moteGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.moteMaterial = new THREE.PointsMaterial({
      color: 0xfde047, // Золотисто-янтарный для ЛА
      size: 0.18,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.moteParticles = new THREE.Points(this.moteGeo, this.moteMaterial);
    this.scene.add(this.moteParticles);
  }

  // =========================================================================
  // ПОКАДРОВОЕ ОБНОВЛЕНИЕ АТМОСФЕРЫ И СВЕТА
  // =========================================================================
  update(frame, isFlash = false) {
    const time = frame * 0.016;

    // Расчет перехода между Лос-Анджелесом (0-900) и Майами (900-1800)
    // Кадры 840 - 960 формируют плавный кинематографический кросс-фейд
    const transition = THREE.MathUtils.clamp((frame - 840) / 120, 0.0, 1.0);

    // 1. Адаптация палитры небесного купола
    // Зенит: LA фиолетовый сумеречный -> Miami бархатный ультрамарин
    this.skyUniforms.uColorZenith.value.lerpColors(
      new THREE.Color(0x181432),
      new THREE.Color(0x030614),
      transition
    );

    // Горизонт: LA пылающий закат -> Miami неоновый циан и маджента
    this.skyUniforms.uColorHorizon.value.lerpColors(
      new THREE.Color(0xf97316),
      new THREE.Color(0x06b6d4),
      transition
    );

    // Земля: теплый асфальт -> влажный ночной глянец
    this.skyUniforms.uColorGround.value.lerpColors(
      new THREE.Color(0x150905),
      new THREE.Color(0x02040a),
      transition
    );

    // 2. Адаптация тумана
    this.scene.fog.color.lerpColors(this.fogColorLA, this.fogColorMiami, transition);
    this.scene.fog.density = THREE.MathUtils.lerp(0.011, 0.015, transition);

    // 3. Адаптация ключевого света (Солнце LA <--> Океанская Луна Miami)
    if (transition < 0.5) {
      // Режим Лос-Анджелес
      this.keyLight.color.setHex(0xffb74d); // Теплое закатное солнце
      this.keyLight.intensity = 3.2;
      this.keyLight.position.set(45, 20 + Math.sin(frame * 0.002) * 2, -35);

      this.rimLight.color.setHex(0xf43f5e); // Розовый закатный отблеск
      this.rimLight.intensity = 1.4;

      this.ambientLight.color.setHex(0x38201a);
      this.ambientLight.intensity = 0.75;

      this.moteMaterial.color.setHex(0xfde047); // Золотые пылинки
      this.moteMaterial.opacity = 0.5;
    } else {
      // Режим Майами
      this.keyLight.color.setHex(0x38bdf8); // Холодный лунный свет над океаном
      this.keyLight.intensity = 2.4;
      this.keyLight.position.set(-35, 38, 25);

      this.rimLight.color.setHex(0xec4899); // Горячий неоновый контур джаз-клуба
      this.rimLight.intensity = 2.8;

      this.ambientLight.color.setHex(0x0c1226);
      this.ambientLight.intensity = 0.85;

      this.moteMaterial.color.setHex(0x38bdf8); // Прохладная влажная взвесь
      this.moteMaterial.opacity = 0.35;
    }

    // 4. Физика парения атмосферных частиц в воздухе
    const pos = this.moteGeo.attributes.position.array;
    for (let i = 0; i < this.moteCount; i++) {
      const idx = i * 3;
      const v = this.moteVelocities[i];

      pos[idx]     += v.x + Math.sin(time * 0.8 + v.phase) * 0.008;
      pos[idx + 1] += v.y;
      pos[idx + 2] += v.z + Math.cos(time * 0.7 + v.phase) * 0.008;

      // Цикличный возврат частиц в границы видимости
      if (pos[idx + 1] < this.moteBounds.yMin) pos[idx + 1] = this.moteBounds.yMax;
      if (pos[idx + 1] > this.moteBounds.yMax) pos[idx + 1] = this.moteBounds.yMin;
      if (Math.abs(pos[idx]) > this.moteBounds.x / 2) pos[idx] *= -0.95;
      if (Math.abs(pos[idx + 2]) > this.moteBounds.z / 2) pos[idx + 2] *= -0.95;
    }
    this.moteGeo.attributes.position.needsUpdate = true;

    // 5. Обработка вспышек софитов / акцентного света
    if (isFlash) {
      this.accentSpot.intensity = 18.0;
    } else {
      this.accentSpot.intensity = 0.0;
    }
  }
}

// Псевдоним для обратной совместимости импортов
export const YokohamaEnvironment = CinematicEnvironment; 
