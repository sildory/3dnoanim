import * as THREE from 'three';

/**
 * СЦЕНА 1: АКВАТОРИЯ ТОКИЙСКОГО ЗАЛИВА И ДНО ДАЙКОКУ (0:00 - 0:06 | Кадры 0 - 359)
 * Полная процедурная 3D-симуляция штормовой гавани, моста Yokohama Bay Bridge,
 * криминалистических буев и затопленного автомобиля.
 */
export class Scene1Bay {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'Scene1_Bay';
    this.scene.add(this.group);

    // Временные параметры для симуляции физики волн
    this.waveParams = {
      speed1: 1.8,
      speed2: 1.2,
      scale1: 0.08,
      scale2: 0.04,
      height1: 0.65,
      height2: 0.45
    };

    // Инициализация всех подсистем сцены
    this.initWater();
    this.initYokohamaBayBridge();
    this.initIndustrialPort();
    this.initSunkenCar();
    this.initForensicBuoys();
    this.initSearchlight();
  }

  // =========================================================================
  // 1. ПРОЦЕДУРНАЯ ПОВЕРХНОСТЬ ШТОРМОВОГО ОКЕАНА
  // =========================================================================
  initWater() {
    this.waterWidth = 260;
    this.waterDepth = 260;
    this.waterSegments = 140;

    this.waterGeometry = new THREE.PlaneGeometry(
      this.waterWidth,
      this.waterDepth,
      this.waterSegments,
      this.waterSegments
    );
    this.waterGeometry.rotateX(-Math.PI / 2);

    // Сохраняем исходные координаты для деформации волнами
    this.baseWaterVertices = this.waterGeometry.attributes.position.clone();

    // Шейдерный PBR-материал ночной воды с темной глубиной и зеркальным отражением
    this.waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x030d1a,
      roughness: 0.12,
      metalness: 0.88,
      flatShading: true,
      transparent: true,
      opacity: 0.88
    });

    this.waterMesh = new THREE.Mesh(this.waterGeometry, this.waterMaterial);
    this.waterMesh.position.set(0, 0, 0);
    this.group.add(this.waterMesh);

    // Дополнительное темное морское дно (толща воды)
    const seabedGeo = new THREE.PlaneGeometry(300, 300);
    seabedGeo.rotateX(-Math.PI / 2);
    const seabedMat = new THREE.MeshBasicMaterial({ color: 0x010408 });
    const seabed = new THREE.Mesh(seabedGeo, seabedMat);
    seabed.position.y = -18.0;
    this.group.add(seabed);
  }

  // Честный расчет высоты волны в любой точке (x, z) для физики плавающих объектов
  getWaveHeight(x, z, time) {
    const w1 = Math.sin(x * this.waveParams.scale1 + time * this.waveParams.speed1) *
               Math.cos(z * this.waveParams.scale1 * 0.7 + time * this.waveParams.speed1 * 0.8) *
               this.waveParams.height1;

    const w2 = Math.cos(x * this.waveParams.scale2 * 1.3 - time * this.waveParams.speed2) *
               Math.sin(z * this.waveParams.scale2 + time * this.waveParams.speed2 * 1.1) *
               this.waveParams.height2;

    const chop = Math.sin((x + z) * 0.14 + time * 2.4) * 0.18;
    return w1 + w2 + chop;
  }

  // =========================================================================
  // 2. ВАНТОВЫЙ МОСТ YOKOHAMA BAY BRIDGE (МОНУМЕНТАЛЬНАЯ 3D-АРХИТЕКТУРА)
  // =========================================================================
  initYokohamaBayBridge() {
    this.bridgeGroup = new THREE.Group();
    this.bridgeGroup.position.set(0, 0, -90);

    const steelDark = new THREE.MeshStandardMaterial({
      color: 0x111c2e,
      roughness: 0.45,
      metalness: 0.7
    });

    const steelGirders = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.8
    });

    const concreteBase = new THREE.MeshStandardMaterial({
      color: 0x0b111c,
      roughness: 0.8,
      metalness: 0.2
    });

    // Опоры-пилоны (Два спаренных гигантских H-образных пилона)
    const pylonXPositions = [-42, 42];
    this.bridgeBeaconLights = [];

    pylonXPositions.forEach((posX) => {
      // 1. Бетонный подводный кессон
      const caissonGeo = new THREE.BoxGeometry(14, 22, 22);
      const caisson = new THREE.Mesh(caissonGeo, concreteBase);
      caisson.position.set(posX, 2, 0);
      this.bridgeGroup.add(caisson);

      // 2. Две вертикальные колонны пилона (до высоты 68м)
      const colWidth = 3.2;
      const colHeight = 65;
      const colGeo = new THREE.BoxGeometry(colWidth, colHeight, 3.8);

      const leftCol = new THREE.Mesh(colGeo, steelDark);
      leftCol.position.set(posX - 4.5, 34, 0);
      leftCol.rotation.z = -0.025;
      this.bridgeGroup.add(leftCol);

      const rightCol = new THREE.Mesh(colGeo, steelDark);
      rightCol.position.set(posX + 4.5, 34, 0);
      rightCol.rotation.z = 0.025;
      this.bridgeGroup.add(rightCol);

      // 3. Поперечные фермы жесткости пилона (X-образные перемычки)
      for (let y = 18; y <= 60; y += 14) {
        const crossGeo = new THREE.BoxGeometry(9.6, 1.8, 2.2);
        const cross = new THREE.Mesh(crossGeo, steelGirders);
        cross.position.set(posX, y, 0);
        this.bridgeGroup.add(cross);
      }

      // 4. Огонь предупреждения авиации на вершине пилона (красный строб)
      const beaconGeo = new THREE.SphereGeometry(0.8, 12, 12);
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(posX, 66.5, 0);
      this.bridgeGroup.add(beacon);

      const beaconLight = new THREE.PointLight(0xef4444, 4.0, 45);
      beaconLight.position.copy(beacon.position);
      this.bridgeGroup.add(beaconLight);

      this.bridgeBeaconLights.push(beaconLight);
    });

    // 5. Двухъярусное полотно автострады (Shuto Expressway Wangan Route B)
    const deckLength = 280;
    const upperDeckGeo = new THREE.BoxGeometry(deckLength, 2.6, 18);
    const upperDeck = new THREE.Mesh(upperDeckGeo, steelGirders);
    upperDeck.position.set(0, 16.5, 0);
    this.bridgeGroup.add(upperDeck);

    const lowerDeckGeo = new THREE.BoxGeometry(deckLength, 1.8, 16);
    const lowerDeck = new THREE.Mesh(lowerDeckGeo, steelDark);
    lowerDeck.position.set(0, 10.5, 0);
    this.bridgeGroup.add(lowerDeck);

    // Решетчатые вертикальные фермы между ярусами
    for (let x = -deckLength / 2; x <= deckLength / 2; x += 8) {
      const strutGeo = new THREE.BoxGeometry(0.8, 5.0, 16.2);
      const strut = new THREE.Mesh(strutGeo, steelDark);
      strut.position.set(x, 13.5, 0);
      this.bridgeGroup.add(strut);
    }

    // 6. Натяжная вантовая система (96 стальных тросов в форме полувеера)
    const cableMat = new THREE.LineBasicMaterial({
      color: 0x64748b,
      transparent: true,
      opacity: 0.55
    });

    const cableCoords = [];

    pylonXPositions.forEach((pylonX) => {
      const towerTopY = 62;
      // Внутренние и внешние вантовые тросы
      for (let i = 1; i <= 24; i++) {
        const anchorDist = i * 4.8;
        const cableYAnchor = 17.5;

        // Центральный пролет (к середине моста)
        const sign = pylonX < 0 ? 1 : -1;
        cableCoords.push(
          pylonX, towerTopY - (i * 0.8), 0,
          pylonX + sign * anchorDist, cableYAnchor, 7.5
        );
        cableCoords.push(
          pylonX, towerTopY - (i * 0.8), 0,
          pylonX + sign * anchorDist, cableYAnchor, -7.5
        );

        // Боковой пролет (к берегу)
        cableCoords.push(
          pylonX, towerTopY - (i * 0.8), 0,
          pylonX - sign * anchorDist, cableYAnchor, 7.5
        );
        cableCoords.push(
          pylonX, towerTopY - (i * 0.8), 0,
          pylonX - sign * anchorDist, cableYAnchor, -7.5
        );
      }
    });

    const cableGeo = new THREE.BufferGeometry();
    cableGeo.setAttribute('position', new THREE.Float32BufferAttribute(cableCoords, 3));
    const cableSystem = new THREE.LineSegments(cableGeo, cableMat);
    this.bridgeGroup.add(cableSystem);

    this.group.add(this.bridgeGroup);
  }

  // =========================================================================
  // 3. ИНДУСТРИАЛЬНЫЙ ГОРИЗОНТ: СУХОГРУЗ «АКАЦУКИ» И ПОРТАЛЬНЫЕ КРАНЫ
  // =========================================================================
  initIndustrialPort() {
    this.portGroup = new THREE.Group();
    this.portGroup.position.set(0, 0, -130);

    const darkHull = new THREE.MeshStandardMaterial({
      color: 0x090d14,
      roughness: 0.7,
      metalness: 0.5
    });

    const craneMetal = new THREE.MeshStandardMaterial({
      color: 0x1a2436,
      roughness: 0.5,
      metalness: 0.6
    });

    // 1. Брошенный сухогруз «Акацуки» в штормовом тумане
    this.shipGroup = new THREE.Group();
    this.shipGroup.position.set(-65, 0, 15);
    this.shipGroup.rotation.y = 0.35;

    // Корпус сухогруза
    const hullGeo = new THREE.BoxGeometry(68, 12, 14);
    const hull = new THREE.Mesh(hullGeo, darkHull);
    hull.position.set(0, 4, 0);
    this.shipGroup.add(hull);

    // Носовой скос
    const bowGeo = new THREE.ConeGeometry(7, 12, 4);
    const bow = new THREE.Mesh(bowGeo, darkHull);
    bow.rotation.z = -Math.PI / 2;
    bow.rotation.y = Math.PI / 4;
    bow.position.set(37, 4, 0);
    this.shipGroup.add(bow);

    // Кормовая надстройка с капитанским мостиком
    const bridgeGeo = new THREE.BoxGeometry(16, 14, 12);
    const bridge = new THREE.Mesh(bridgeGeo, darkHull);
    bridge.position.set(-20, 14, 0);
    this.shipGroup.add(bridge);

    // Обесточенная радиолокационная мачта с мигающим аварийным огнем
    const mastGeo = new THREE.CylinderGeometry(0.3, 0.5, 15);
    const mast = new THREE.Mesh(mastGeo, craneMetal);
    mast.position.set(-20, 26, 0);
    this.shipGroup.add(mast);

    this.shipDistressBeacon = new THREE.PointLight(0xef4444, 2.5, 30);
    this.shipDistressBeacon.position.set(-20, 33, 0);
    this.shipGroup.add(this.shipDistressBeacon);

    // Контейнерные штабели на палубе
    const colors = [0x7f1d1d, 0x1e3a8a, 0x0f172a, 0x854d0e];
    for (let cx = -8; cx <= 24; cx += 8) {
      for (let cy = 0; cy < 3; cy++) {
        const cGeo = new THREE.BoxGeometry(7, 3, 11);
        const cMat = new THREE.MeshStandardMaterial({
          color: colors[(cx + cy * 3) % colors.length],
          roughness: 0.6
        });
        const cBox = new THREE.Mesh(cGeo, cMat);
        cBox.position.set(cx, 11 + cy * 3.1, 0);
        this.shipGroup.add(cBox);
      }
    }
    this.portGroup.add(this.shipGroup);

    // 2. Портальные контейнерные краны терминала Дайкоку (Gantry Cranes)
    const cranePositions = [55, 80, 105];
    cranePositions.forEach((cx) => {
      const crane = new THREE.Group();
      crane.position.set(cx, 0, -5);

      // Опоры крана
      const legGeo = new THREE.BoxGeometry(1.6, 38, 1.6);
      const leg1 = new THREE.Mesh(legGeo, craneMetal);
      leg1.position.set(-6, 19, -6);
      crane.add(leg1);

      const leg2 = new THREE.Mesh(legGeo, craneMetal);
      leg2.position.set(6, 19, -6);
      crane.add(leg2);

      const leg3 = new THREE.Mesh(legGeo, craneMetal);
      leg3.position.set(-6, 19, 6);
      crane.add(leg3);

      const leg4 = new THREE.Mesh(legGeo, craneMetal);
      leg4.position.set(6, 19, 6);
      crane.add(leg4);

      // Горизонтальная стрела
      const boomGeo = new THREE.BoxGeometry(50, 2.8, 3.8);
      const boom = new THREE.Mesh(boomGeo, craneMetal);
      boom.position.set(-10, 36, 0);
      crane.add(boom);

      // Кабина оператора
      const cabGeo = new THREE.BoxGeometry(4, 4, 4);
      const cab = new THREE.Mesh(cabGeo, darkHull);
      cab.position.set(0, 34, 0);
      crane.add(cab);

      // Сигнальный оранжевый фонарь
      const craneLight = new THREE.PointLight(0xf59e0b, 1.8, 25);
      craneLight.position.set(-30, 37, 0);
      crane.add(craneLight);

      this.portGroup.add(crane);
    });

    // 3. Нефтехимическая факельная вышка со всполохами огня
    this.flareGroup = new THREE.Group();
    this.flareGroup.position.set(135, 0, -25);

    const stackGeo = new THREE.CylinderGeometry(0.8, 1.6, 52, 12);
    const stack = new THREE.Mesh(stackGeo, darkHull);
    stack.position.y = 26;
    this.flareGroup.add(stack);

    this.flareLight = new THREE.PointLight(0xf97316, 6.0, 90);
    this.flareLight.position.set(0, 53, 0);
    this.flareGroup.add(this.flareLight);

    const flameGeo = new THREE.ConeGeometry(1.6, 4.5, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xfed7aa });
    this.flameMesh = new THREE.Mesh(flameGeo, flameMat);
    this.flameMesh.position.set(0, 54, 0);
    this.flareGroup.add(this.flameMesh);

    this.portGroup.add(this.flareGroup);
    this.group.add(this.portGroup);
  }

  // =========================================================================
  // 4. ЗАТОПЛЕННЫЙ СЕДАН СИНДИКАТА НА ДНЕ ГАВАНИ
  // =========================================================================
  initSunkenCar() {
    this.carGroup = new THREE.Group();
    // Расположение на дне: глубина -12 метров, под ракурсом камеры
    this.carGroup.position.set(2, -10.5, 12);
    this.carGroup.rotation.set(0.18, -0.45, -0.12); // Автомобиль лежит накренившись в иле

    const carPaint = new THREE.MeshStandardMaterial({
      color: 0x05070a,
      roughness: 0.25,
      metalness: 0.9
    });

    const carGlass = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.65
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.2,
      metalness: 0.95
    });

    // 1. Нижняя часть кузова (Шасси седана)
    const chassisGeo = new THREE.BoxGeometry(4.8, 0.9, 2.0);
    const chassis = new THREE.Mesh(chassisGeo, carPaint);
    chassis.position.y = 0.6;
    this.carGroup.add(chassis);

    // 2. Салон и крыша (Greenhouse)
    const cabinGeo = new THREE.BoxGeometry(2.5, 0.8, 1.7);
    const cabin = new THREE.Mesh(cabinGeo, carGlass);
    cabin.position.set(-0.2, 1.35, 0);
    this.carGroup.add(cabin);

    const roofGeo = new THREE.BoxGeometry(2.4, 0.08, 1.65);
    const roof = new THREE.Mesh(roofGeo, carPaint);
    roof.position.set(-0.2, 1.77, 0);
    this.carGroup.add(roof);

    // 3. Колеса в донном иле
    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.32, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x020305, roughness: 0.9 });

    const wheelOffsets = [
      [-1.5, 0.42, -1.0], [1.5, 0.42, -1.0],
      [-1.5, 0.42, 1.0],  [1.5, 0.42, 1.0]
    ];
    wheelOffsets.forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(wx, wy, wz);
      this.carGroup.add(wheel);
    });

    // 4. Приоткрытая крышка багажника (улика синдиката)
    const trunkGeo = new THREE.BoxGeometry(1.2, 0.08, 1.7);
    const trunk = new THREE.Mesh(trunkGeo, carPaint);
    trunk.position.set(-1.8, 1.15, 0);
    trunk.rotation.z = -0.38; // Приоткрыт
    this.carGroup.add(trunk);

    // 5. Замкнутые стоп-сигналы, горящие в мутной толще воды
    const tailGeo = new THREE.BoxGeometry(0.12, 0.28, 0.6);
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff1e1e });
    const tailL = new THREE.Mesh(tailGeo, tailMat);
    tailL.position.set(-2.4, 0.75, -0.65);
    this.carGroup.add(tailL);

    const tailR = new THREE.Mesh(tailGeo, tailMat);
    tailR.position.set(-2.4, 0.75, 0.65);
    this.carGroup.add(tailR);

    // Алое подводное рассеянное свечение
    this.underwaterRedGlow = new THREE.PointLight(0xef4444, 7.5, 18);
    this.underwaterRedGlow.position.set(-3.2, 0.8, 0);
    this.carGroup.add(this.underwaterRedGlow);

    // 6. Подводные пузыри воздуха, всплывающие из салона
    this.bubbleCount = 90;
    this.bubbleGeo = new THREE.BufferGeometry();
    const bubblePositions = new Float32Array(this.bubbleCount * 3);
    this.bubbleSpeeds = new Float32Array(this.bubbleCount);

    for (let b = 0; b < this.bubbleCount; b++) {
      bubblePositions[b * 3]     = THREE.MathUtils.randFloat(-1.2, 0.8);
      bubblePositions[b * 3 + 1] = THREE.MathUtils.randFloat(1.0, 11.5);
      bubblePositions[b * 3 + 2] = THREE.MathUtils.randFloat(-0.7, 0.7);
      this.bubbleSpeeds[b] = THREE.MathUtils.randFloat(0.04, 0.09);
    }
    this.bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePositions, 3));

    const bubbleMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.24,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    this.bubbleParticles = new THREE.Points(this.bubbleGeo, bubbleMat);
    this.carGroup.add(this.bubbleParticles);

    this.group.add(this.carGroup);
  }

  // =========================================================================
  // 5. КРИМИНАЛИСТИЧЕСКИЕ ГИДРОАКУСТИЧЕСКИЕ БУИ (FORENSIC BUOYS)
  // =========================================================================
  initForensicBuoys() {
    this.buoys = [];
    const buoyConfigs = [
      { x: -14, z: 18, color: 0x38bdf8, label: 'БУЙ #01' },
      { x: 12,  z: 8,  color: 0xfacc15, label: 'БУЙ #02' },
      { x: -4,  z: 32, color: 0xef4444, label: 'БУЙ #03' }
    ];

    const buoyBodyMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4,
      metalness: 0.6
    });

    buoyConfigs.forEach((cfg) => {
      const bGroup = new THREE.Group();
      bGroup.position.set(cfg.x, 0, cfg.z);

      // Поплавок буя
      const floatGeo = new THREE.CylinderGeometry(1.2, 0.9, 1.4, 16);
      const floatMesh = new THREE.Mesh(floatGeo, buoyBodyMat);
      floatMesh.position.y = 0.2;
      bGroup.add(floatMesh);

      // Яркий идентификационный пояс
      const bandGeo = new THREE.CylinderGeometry(1.22, 1.22, 0.35, 16);
      const bandMat = new THREE.MeshBasicMaterial({ color: cfg.color });
      const band = new THREE.Mesh(bandGeo, bandMat);
      band.position.y = 0.35;
      bGroup.add(band);

      // Решетчатая мачта
      const mastGeo = new THREE.CylinderGeometry(0.08, 0.15, 2.6, 8);
      const mast = new THREE.Mesh(mastGeo, buoyBodyMat);
      mast.position.y = 1.8;
      bGroup.add(mast);

      // Стробоскоп на верхушке мачты
      const flashGeo = new THREE.SphereGeometry(0.25, 8, 8);
      const flashMat = new THREE.MeshBasicMaterial({ color: cfg.color });
      const flashSphere = new THREE.Mesh(flashGeo, flashMat);
      flashSphere.position.y = 3.1;
      bGroup.add(flashSphere);

      const buoyLight = new THREE.PointLight(cfg.color, 4.0, 22);
      buoyLight.position.set(0, 3.2, 0);
      bGroup.add(buoyLight);

      // Якорный трос в морскую пучину
      const chainCoords = [0, -0.5, 0, 0, -16, 0];
      const chainGeo = new THREE.BufferGeometry();
      chainGeo.setAttribute('position', new THREE.Float32BufferAttribute(chainCoords, 3));
      const chainMat = new THREE.LineBasicMaterial({ color: 0x334155 });
      const chain = new THREE.Line(chainGeo, chainMat);
      bGroup.add(chain);

      this.group.add(bGroup);

      this.buoys.push({
        group: bGroup,
        baseX: cfg.x,
        baseZ: cfg.z,
        light: buoyLight,
        seed: Math.random() * 10
      });
    });
  }

  // =========================================================================
  // 6. ВОЛЮМЕТРИЧЕСКИЙ ПРОЖЕКТОР БЕРЕГОВОЙ ОХРАНЫ
  // =========================================================================
  initSearchlight() {
    this.searchlightGroup = new THREE.Group();
    // Источник на воображаемом патрульном катере слева за кадром
    this.searchlightGroup.position.set(-28, 14, 25);

    // Волюметрический конус света (полупрозрачный аддитивный градиент)
    const coneLength = 55;
    const coneRadius = 7.5;
    const coneGeo = new THREE.ConeGeometry(coneRadius, coneLength, 32, 1, true);
    coneGeo.translate(0, -coneLength / 2, 0);
    coneGeo.rotateX(-Math.PI / 2);

    // Кастомный градиентный материал луча
    const coneMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uColor: { value: new THREE.Color(0xa5f3fc) }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying float vDepth;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          vDepth = -position.z; // Глубина вдоль длины луча
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying float vDepth;
        void main() {
          vec3 viewDir = normalize(vViewPosition);
          float rim = 1.0 - abs(dot(viewDir, vNormal));
          float falloff = clamp(1.0 - (vDepth / 55.0), 0.0, 1.0);
          float alpha = pow(rim, 2.0) * falloff * 0.45;
          gl_FragColor = vec4(uColor, alpha);
        }
      `
    });

    this.searchlightBeam = new THREE.Mesh(coneGeo, coneMat);
    this.searchlightGroup.add(this.searchlightBeam);

    // Направленный спотлайт для реального освещения поверхности воды
    this.spotLight = new THREE.SpotLight(0xcffafe, 18.0, 75, Math.PI / 7, 0.65, 1.2);
    this.spotLight.position.set(0, 0, 0);
    this.searchlightGroup.add(this.spotLight);

    // Точка прицеливания прожектора
    this.searchTarget = new THREE.Object3D();
    this.searchTarget.position.set(0, -2, 12);
    this.group.add(this.searchTarget);

    this.spotLight.target = this.searchTarget;

    this.group.add(this.searchlightGroup);
  }

  // =========================================================================
  // ЦИКЛ АНИМАЦИИ КАДРА (ВЫЗЫВАЕТСЯ ДИРЕКТОРОМ)
  // =========================================================================
  update(frame) {
    const time = frame * 0.016;

    // 1. Деформация океана штормовыми волнами Герстнера
    const pos = this.waterGeometry.attributes.position;
    const base = this.baseWaterVertices;
    const count = pos.count;

    for (let i = 0; i < count; i++) {
      const x = base.getX(i);
      const z = base.getZ(i);
      const y = this.getWaveHeight(x, z, time);
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
    this.waterGeometry.computeVertexNormals();

    // 2. Физика гидроакустических буев (плавучесть и наклон по нормали волны)
    this.buoys.forEach((b) => {
      const h = this.getWaveHeight(b.baseX, b.baseZ, time);
      b.group.position.y = h;

      // Наклон от поперечной волны
      const hX = this.getWaveHeight(b.baseX + 0.5, b.baseZ, time);
      const hZ = this.getWaveHeight(b.baseX, b.baseZ + 0.5, time);
      b.group.rotation.z = (h - hX) * 0.6;
      b.group.rotation.x = (hZ - h) * 0.6;

      // Синхронный стробоскопический импульс буя (двойной щелчок вспышки)
      const strobeCycle = (frame + b.seed * 30) % 60;
      const isStrobe = strobeCycle < 4 || (strobeCycle > 8 && strobeCycle < 12);
      b.light.intensity = isStrobe ? 8.5 : 0.4;
    });

    // 3. Сканирующая траектория прожектора береговой охраны
    const sweepAngle = Math.sin(frame * 0.022) * 16.0;
    const sweepDepth = 12 + Math.cos(frame * 0.018) * 8.0;
    this.searchTarget.position.set(sweepAngle, -1.0, sweepDepth);
    this.searchlightBeam.lookAt(this.searchTarget.position);

    // 4. Подводная анимация затопленного автомобиля: пульсация фонарей и пузыри
    const underwaterPulse = Math.sin(frame * 0.12) * 1.5 + 6.0;
    this.underwaterRedGlow.intensity = underwaterPulse;

    // Всплытие пузырей
    const bPos = this.bubbleGeo.attributes.position.array;
    for (let b = 0; b < this.bubbleCount; b++) {
      const idx = b * 3;
      bPos[idx + 1] += this.bubbleSpeeds[b];
      bPos[idx]     += Math.sin(frame * 0.05 + b) * 0.012;

      // Если пузырь достиг границы воды (-0.2м) — возвращаем ко дну автомобиля
      if (bPos[idx + 1] > 11.2) {
        bPos[idx + 1] = THREE.MathUtils.randFloat(1.0, 2.5);
        bPos[idx]     = THREE.MathUtils.randFloat(-1.2, 0.8);
      }
    }
    this.bubbleGeo.attributes.position.needsUpdate = true;

    // 5. Мигание маяков моста и бедствия сухогруза «Акацуки»
    const bridgeFlash = Math.floor(frame / 30) % 2 === 0;
    this.bridgeBeaconLights.forEach((l) => {
      l.intensity = bridgeFlash ? 4.5 : 0.2;
    });

    const distressFlash = frame % 45 < 6;
    this.shipDistressBeacon.intensity = distressFlash ? 5.0 : 0.0;

    // 6. Дрожание пламени факела нефтезавода
    const flareNoise = Math.sin(frame * 0.4) * Math.cos(frame * 0.9);
    this.flareLight.intensity = 5.5 + flareNoise * 2.2;
    this.flameMesh.scale.set(
      1.0 + flareNoise * 0.2,
      1.0 + flareNoise * 0.35,
      1.0 + flareNoise * 0.2
    );

    // Качание сухогруза на волнах
    this.shipGroup.rotation.z = Math.sin(time * 0.8) * 0.025;
    this.shipGroup.rotation.x = Math.cos(time * 0.6) * 0.018;
  }
}
