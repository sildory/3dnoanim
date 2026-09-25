import * as THREE from 'three';

/**
 * СЦЕНА 3: НЕОНОВЫЙ КАНЬОН // КАННАЙ И МИНАТО МИРАЙ (0:12 - 0:18 | Кадры 720 - 1079)
 * Вертикальный спуск кинокамеры между небоскребами, светящийся неон,
 * клубы пара из люка и седан детектива с работающими дворниками.
 */
export class Scene3Neon {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'Scene3_Neon';
    this.scene.add(this.group);

    // Инициализация подсистем сцены
    this.initStreetAndSidewalk();
    this.initUrbanBuildings();
    this.initLandmarkTowerSilhouette();
    this.initOverheadWireNetwork();
    this.initNeonSigns();
    this.initVendingMachine();
    this.initManholeSteam();
    this.initDetectiveSedan();
  }

  // =========================================================================
  // 1. УЛИЦА, ТРОТУАРЫ И ТАКТИЛЬНАЯ ПЛИТКА (KANNAI ALLEYWAY)
  // =========================================================================
  initStreetAndSidewalk() {
    this.streetGroup = new THREE.Group();

    // Проезжая часть с мокрым битумом
    const roadGeo = new THREE.PlaneGeometry(16, 90, 32, 32);
    roadGeo.rotateX(-Math.PI / 2);

    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x05070c,
      roughness: 0.12, // Зеркальные отражения неоновых вывесок
      metalness: 0.85
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    this.streetGroup.add(road);

    // Бордюры и тротуары слева и справа
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    const walkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35, metalness: 0.4 });

    [-7.5, 7.5].forEach((sideX) => {
      // Тротуар
      const walkGeo = new THREE.BoxGeometry(4.0, 0.25, 90);
      const walk = new THREE.Mesh(walkGeo, walkMat);
      walk.position.set(sideX, 0.125, 0);
      this.streetGroup.add(walk);

      // Гранитный бордюр
      const curbGeo = new THREE.BoxGeometry(0.3, 0.28, 90);
      const curb = new THREE.Mesh(curbGeo, curbMat);
      const curbX = sideX > 0 ? sideX - 2.0 : sideX + 2.0;
      curb.position.set(curbX, 0.14, 0);
      this.streetGroup.add(curb);
    });

    // Японская желтая тактильная плитка для незрячих (Tenji Blocks) на тротуаре
    const tactileCanvas = document.createElement('canvas');
    tactileCanvas.width = 64;
    tactileCanvas.height = 64;
    const tctx = tactileCanvas.getContext('2d');
    tctx.fillStyle = '#ca8a04';
    tctx.fillRect(0, 0, 64, 64);
    tctx.fillStyle = '#eab308';
    for (let y = 8; y < 64; y += 16) {
      tctx.fillRect(0, y, 64, 6);
    }

    const tactileTex = new THREE.CanvasTexture(tactileCanvas);
    tactileTex.wrapS = THREE.RepeatWrapping;
    tactileTex.wrapT = THREE.RepeatWrapping;
    tactileTex.repeat.set(1, 40);

    const tactileGeo = new THREE.PlaneGeometry(0.5, 90);
    tactileGeo.rotateX(-Math.PI / 2);
    const tactileMat = new THREE.MeshStandardMaterial({ map: tactileTex, roughness: 0.4 });

    const tactileL = new THREE.Mesh(tactileGeo, tactileMat);
    tactileL.position.set(-6.8, 0.26, 0);
    this.streetGroup.add(tactileL);

    this.group.add(this.streetGroup);
  }

  // =========================================================================
  // 2. УРБАНИСТИЧЕСКИЕ ЗДАНИЯ, ОКНА, ПОЖАРНЫЕ ЛЕСТНИЦЫ И ВЕНТИЛЯЦИЯ
  // =========================================================================
  initUrbanBuildings() {
    this.buildingsGroup = new THREE.Group();

    // Генерация текстуры светящихся окон офисов и ночных квартир
    const createFacadeTexture = (seedColor) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#070b14';
      ctx.fillRect(0, 0, 512, 1024);

      // Сетка окон
      for (let y = 40; y < 1000; y += 75) {
        for (let x = 30; x < 490; x += 65) {
          const isLit = Math.random() > 0.65;
          if (isLit) {
            ctx.fillStyle = Math.random() > 0.4 ? seedColor : '#fef08a';
            ctx.fillRect(x, y, 42, 50);

            // Горизонтальные жалюзи в окне
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            for (let b = y + 8; b < y + 50; b += 10) {
              ctx.fillRect(x, b, 42, 2.5);
            }
          } else {
            ctx.fillStyle = '#020408';
            ctx.fillRect(x, y, 42, 50);
          }
        }
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      return tex;
    };

    const facadeMat1 = new THREE.MeshStandardMaterial({
      map: createFacadeTexture('#38bdf8'),
      roughness: 0.4,
      metalness: 0.6
    });

    const facadeMat2 = new THREE.MeshStandardMaterial({
      map: createFacadeTexture('#f43f5e'),
      roughness: 0.4,
      metalness: 0.6
    });

    this.fanBlades = [];

    // Конфигурация зданий левой и правой стороны переулка
    const buildingConfigs = [
      { x: -14, z: -25, w: 11, h: 48, d: 24, mat: facadeMat1 },
      { x: -14, z: 5,   w: 11, h: 42, d: 26, mat: facadeMat2 },
      { x: -14, z: 32,  w: 11, h: 52, d: 22, mat: facadeMat1 },
      { x: 14,  z: -28, w: 11, h: 44, d: 22, mat: facadeMat2 },
      { x: 14,  z: 0,   w: 11, h: 50, d: 24, mat: facadeMat1 },
      { x: 14,  z: 28,  w: 11, h: 46, d: 24, mat: facadeMat2 }
    ];

    buildingConfigs.forEach((cfg) => {
      const bGeo = new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d);
      const bMesh = new THREE.Mesh(bGeo, cfg.mat);
      bMesh.position.set(cfg.x, cfg.h / 2, cfg.z);
      this.buildingsGroup.add(bMesh);

      // Внешние блоки кондиционеров на стенах
      const acCount = 4;
      for (let i = 0; i < acCount; i++) {
        const acGroup = new THREE.Group();
        const signX = cfg.x > 0 ? -1 : 1;
        acGroup.position.set(
          cfg.x + (signX * (cfg.w / 2 + 0.45)),
          8 + i * 8 + Math.random() * 2,
          cfg.z - 6 + i * 4
        );

        const acBodyGeo = new THREE.BoxGeometry(0.7, 0.8, 1.1);
        const acBodyMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
        const acBody = new THREE.Mesh(acBodyGeo, acBodyMat);
        acGroup.add(acBody);

        // Вентилятор кондиционера
        const fanGeo = new THREE.BoxGeometry(0.04, 0.55, 0.08);
        const fanMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
        const fan = new THREE.Mesh(fanGeo, fanMat);
        fan.position.set(signX * 0.36, 0, 0);
        acGroup.add(fan);
        this.fanBlades.push(fan);

        this.buildingsGroup.add(acGroup);
      }

      // Металлическая пожарная лестница на центральном фасаде
      if (Math.abs(cfg.z) < 10) {
        const ladderMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.6, metalness: 0.8 });
        const signX = cfg.x > 0 ? -1 : 1;
        for (let floor = 4; floor < cfg.h - 6; floor += 5) {
          // Площадка
          const platGeo = new THREE.BoxGeometry(1.6, 0.1, 3.2);
          const plat = new THREE.Mesh(platGeo, ladderMat);
          plat.position.set(cfg.x + signX * (cfg.w / 2 + 0.9), floor, cfg.z);
          this.buildingsGroup.add(plat);

          // Ограждение площадки
          const railGeo = new THREE.BoxGeometry(1.6, 0.9, 0.05);
          const rail = new THREE.Mesh(railGeo, ladderMat);
          rail.position.set(cfg.x + signX * (cfg.w / 2 + 0.9), floor + 0.45, cfg.z + 1.6);
          this.buildingsGroup.add(rail);
        }
      }
    });

    this.group.add(this.buildingsGroup);
  }

  // =========================================================================
  // 3. СИЛУЭТ YOKOHAMA LANDMARK TOWER В ГЛУБИНЕ ТУМАНА
  // =========================================================================
  initLandmarkTowerSilhouette() {
    this.towerGroup = new THREE.Group();
    // Расположение вдали за улицей
    this.towerGroup.position.set(0, 0, -85);

    const darkTowerMat = new THREE.MeshStandardMaterial({
      color: 0x040812,
      roughness: 0.6,
      metalness: 0.8
    });

    // Нижняя ступень башни
    const baseGeo = new THREE.BoxGeometry(26, 45, 26);
    const base = new THREE.Mesh(baseGeo, darkTowerMat);
    base.position.y = 22.5;
    this.towerGroup.add(base);

    // Средняя сужающаяся секция Landmark Tower
    const midGeo = new THREE.BoxGeometry(21, 35, 21);
    const mid = new THREE.Mesh(midGeo, darkTowerMat);
    mid.position.y = 62.5;
    this.towerGroup.add(mid);

    // Верхний шпиль
    const spireGeo = new THREE.CylinderGeometry(0.8, 4.5, 30, 8);
    const spire = new THREE.Mesh(spireGeo, darkTowerMat);
    spire.position.y = 95;
    this.towerGroup.add(spire);

    // Авиационный импульсный маяк на вершине Landmark Tower
    this.towerBeacon = new THREE.PointLight(0xef4444, 5.0, 120);
    this.towerBeacon.position.set(0, 110, 0);
    this.towerGroup.add(this.towerBeacon);

    const beaconGeo = new THREE.SphereGeometry(1.2, 8, 8);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const beaconSphere = new THREE.Mesh(beaconGeo, beaconMat);
    beaconSphere.position.set(0, 110, 0);
    this.towerGroup.add(beaconSphere);

    this.group.add(this.towerGroup);
  }

  // =========================================================================
  // 4. ПАУТИНА ПРОВОДОВ И БЕТОННЫЕ СТОЛБЫ (電柱 DENCHUU)
  // =========================================================================
  initOverheadWireNetwork() {
    this.wireGroup = new THREE.Group();

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });

    // Два телекоммуникационных столба вдоль улицы
    const polePositions = [
      { x: -5.8, z: -10 },
      { x: 5.8,  z: 14 }
    ];

    polePositions.forEach((pos) => {
      // Бетонная опора
      const poleGeo = new THREE.CylinderGeometry(0.24, 0.32, 14, 16);
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(pos.x, 7, pos.z);
      this.wireGroup.add(pole);

      // Траверса с фарфоровыми изоляторами
      const armGeo = new THREE.BoxGeometry(2.4, 0.12, 0.12);
      const arm = new THREE.Mesh(armGeo, metalMat);
      arm.position.set(pos.x, 12.2, pos.z);
      this.wireGroup.add(arm);

      // Цилиндрический трансформатор на столбе
      const transGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.2, 12);
      const trans = new THREE.Mesh(transGeo, metalMat);
      trans.position.set(pos.x + 0.35, 10.5, pos.z);
      this.wireGroup.add(trans);
    });

    // Навесные провода с физическим провисанием (Catenary Curves)
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x090d14,
      transparent: true,
      opacity: 0.85
    });

    const createCatenaryWire = (p1, p2, sag) => {
      const points = [];
      const segs = 20;
      for (let s = 0; s <= segs; s++) {
        const t = s / segs;
        const x = THREE.MathUtils.lerp(p1.x, p2.x, t);
        const z = THREE.MathUtils.lerp(p1.z, p2.z, t);
        const yBase = THREE.MathUtils.lerp(p1.y, p2.y, t);
        const y = yBase - Math.sin(t * Math.PI) * sag;
        points.push(new THREE.Vector3(x, y, z));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      return new THREE.Line(geo, wireMat);
    };

    // Перекрестная паутина между зданиями и столбами
    this.wireGroup.add(createCatenaryWire(new THREE.Vector3(-8, 13, -20), new THREE.Vector3(-5.8, 12.2, -10), 0.8));
    this.wireGroup.add(createCatenaryWire(new THREE.Vector3(-5.8, 12.2, -10), new THREE.Vector3(5.8, 12.2, 14), 1.6));
    this.wireGroup.add(createCatenaryWire(new THREE.Vector3(8, 14, -12), new THREE.Vector3(-8, 15, 6), 1.4));
    this.wireGroup.add(createCatenaryWire(new THREE.Vector3(-5.8, 12.2, -10), new THREE.Vector3(-8, 16, 12), 1.1));
    this.wireGroup.add(createCatenaryWire(new THREE.Vector3(5.8, 12.2, 14), new THREE.Vector3(8, 14, 30), 1.2));

    this.group.add(this.wireGroup);
  }

  // =========================================================================
  // 5. ВЕРТИКАЛЬНЫЕ НЕОНОВЫЕ ВЫВЕСКИ (ЯПОНСКИЕ КАНДЗИ)
  // =========================================================================
  initNeonSigns() {
    this.neonGroup = new THREE.Group();
    this.neonFlickers = [];

    // Создание текстуры неоновой вертикальной вывески
    const createNeonSign = (kanjiList, enText, mainColor, hexColor, x, y, z, rotY) => {
      const sGroup = new THREE.Group();
      sGroup.position.set(x, y, z);
      sGroup.rotation.y = rotY;

      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      // Подложка короба
      ctx.fillStyle = '#05070d';
      ctx.fillRect(0, 0, 128, 512);

      // Рамка вывески
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, 116, 500);

      // Иероглифы Кандзи
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = mainColor;
      ctx.shadowBlur = 18;
      ctx.font = '900 64px "Noto Sans JP", monospace';
      ctx.textAlign = 'center';

      kanjiList.forEach((char, idx) => {
        ctx.fillText(char, 64, 85 + idx * 88);
      });

      // Английский подзаголовок внизу
      ctx.font = 'bold 20px monospace';
      ctx.fillStyle = mainColor;
      ctx.fillText(enText, 64, 480);

      const tex = new THREE.CanvasTexture(canvas);
      const signGeo = new THREE.BoxGeometry(0.2, 7.5, 1.8);
      const signMat = new THREE.MeshBasicMaterial({ map: tex });
      const signBox = new THREE.Mesh(signGeo, signMat);
      sGroup.add(signBox);

      // Локальный источник освещения, заливающий стену и улицу светом вывески
      const light = new THREE.PointLight(hexColor, 4.2, 22);
      light.position.set(0.4, 0, 0);
      sGroup.add(light);

      this.neonGroup.add(sGroup);

      this.neonFlickers.push({
        light: light,
        mat: signMat,
        baseIntensity: 4.2,
        seed: Math.random() * 20
      });
    };

    // 1. Маджонг клуб (Изумрудно-зеленый неон)
    createNeonSign(['麻', '雀', '荘'], 'MAHJONG', '#10b981', 0x10b981, -8.4, 11, -8, Math.PI / 2);

    // 2. Бар «Минато» (Горячий пурпур)
    createNeonSign(['ス', 'ナ', 'ッ', 'ク'], 'MINATO', '#ec4899', 0xec4899, 8.4, 12, -2, -Math.PI / 2);

    // 3. Рамэн 24H (Янтарный огонь)
    createNeonSign(['拉', '麺', '屋'], '24 HOUR', '#f59e0b', 0xf59e0b, -8.4, 9, 8, Math.PI / 2);

    // 4. Детективное агентство Каннай (Циановый электрический)
    createNeonSign(['探', '偵', '所'], 'ISHIKAWA', '#06b6d4', 0x06b6d4, 8.4, 10, 16, -Math.PI / 2);

    this.group.add(this.neonGroup);
  }

  // =========================================================================
  // 6. ЯПОНСКИЙ ТОРГОВЫЙ АВТОМАТ (自動販売機 JIDOHANBAIKI)
  // =========================================================================
  initVendingMachine() {
    this.vendingGroup = new THREE.Group();
    this.vendingGroup.position.set(-6.5, 0.25, -2);
    this.vendingGroup.rotation.y = Math.PI / 2;

    // Корпус автомата
    const bodyGeo = new THREE.BoxGeometry(1.6, 2.4, 1.1);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.2;
    this.vendingGroup.add(body);

    // Светящаяся витрина с напитками
    const displayCanvas = document.createElement('canvas');
    displayCanvas.width = 256;
    displayCanvas.height = 256;
    const dctx = displayCanvas.getContext('2d');

    dctx.fillStyle = '#0284c7';
    dctx.fillRect(0, 0, 256, 256);

    // Ряды банок с кофе и чаем
    for (let r = 20; r < 200; r += 60) {
      for (let c = 20; c < 240; c += 40) {
        dctx.fillStyle = c % 80 === 0 ? '#ef4444' : '#facc15';
        dctx.fillRect(c, r, 24, 42);
      }
    }

    dctx.fillStyle = '#ffffff';
    dctx.font = 'bold 24px monospace';
    dctx.fillText('COLD / HOT', 55, 235);

    const displayTex = new THREE.CanvasTexture(displayCanvas);
    const displayGeo = new THREE.PlaneGeometry(1.35, 1.35);
    const displayMat = new THREE.MeshBasicMaterial({ map: displayTex });
    const display = new THREE.Mesh(displayGeo, displayMat);
    display.position.set(0, 1.45, 0.56);
    this.vendingGroup.add(display);

    // Мягкий свет витрины на тротуар
    const vendLight = new THREE.PointLight(0xbae6fd, 3.2, 8);
    vendLight.position.set(0, 1.2, 0.85);
    this.vendingGroup.add(vendLight);

    this.group.add(this.vendingGroup);
  }

  // =========================================================================
  // 7. СИСТЕМА ОБЪЕМНОГО ПАРА ИЗ КАНАЛИЗАЦИОННОГО ЛЮКА
  // =========================================================================
  initManholeSteam() {
    this.steamGroup = new THREE.Group();
    this.steamGroup.position.set(-1.8, 0.02, 6);

    // Чугунный люк с рельефным рисунком Иокогамы
    const manholeGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.04, 24);
    const manholeMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.8,
      metalness: 0.85
    });
    const manhole = new THREE.Mesh(manholeGeo, manholeMat);
    this.steamGroup.add(manhole);

    // Отверстия для выхода пара
    const ventGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.06, 8);
    const ventMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    [-0.25, 0, 0.25].forEach((vx) => {
      const vent = new THREE.Mesh(ventGeo, ventMat);
      vent.position.set(vx, 0.01, 0);
      this.steamGroup.add(vent);
    });

    // 120 полупрозрачных частиц клубящегося горячего пара
    this.steamCount = 120;
    this.steamGeometry = new THREE.BufferGeometry();
    const steamPositions = new Float32Array(this.steamCount * 3);
    this.steamLifes = new Float32Array(this.steamCount);
    this.steamVels = [];

    for (let i = 0; i < this.steamCount; i++) {
      steamPositions[i * 3]     = (Math.random() - 0.5) * 0.4;
      steamPositions[i * 3 + 1] = Math.random() * 4.5;
      steamPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.4;

      this.steamLifes[i] = Math.random();
      this.steamVels.push({
        x: (Math.random() - 0.5) * 0.018,
        y: THREE.MathUtils.randFloat(0.035, 0.075),
        z: THREE.MathUtils.randFloat(0.01, 0.03) // Снос ветром
      });
    }

    this.steamGeometry.setAttribute('position', new THREE.BufferAttribute(steamPositions, 3));

    const steamMat = new THREE.PointsMaterial({
      color: 0xe2e8f0,
      size: 0.65,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.steamParticles = new THREE.Points(this.steamGeometry, steamMat);
    this.steamGroup.add(this.steamParticles);

    this.group.add(this.steamGroup);
  }

  // =========================================================================
  // 8. ЧЕРНЫЙ СЕДАН ДЕТЕКТИВА И РАБОТАЮЩИЕ ДВОРНИКИ (TOYOTA CROWN)
  // =========================================================================
  initDetectiveSedan() {
    this.sedanGroup = new THREE.Group();
    // Автомобиль стоит у тротуара переулка
    this.sedanGroup.position.set(2.4, 0, 2.5);
    this.sedanGroup.rotation.y = -0.05;

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x020408, // Глубокий черный глянец
      roughness: 0.15,
      metalness: 0.95
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.2,
      metalness: 0.98
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.75
    });

    // 1. Кузов седана
    const baseGeo = new THREE.BoxGeometry(2.1, 0.65, 5.2);
    const base = new THREE.Mesh(baseGeo, bodyMat);
    base.position.y = 0.55;
    this.sedanGroup.add(base);

    // Хромированные молдинги
    const trimGeo = new THREE.BoxGeometry(2.15, 0.06, 5.15);
    const trim = new THREE.Mesh(trimGeo, chromeMat);
    trim.position.y = 0.62;
    this.sedanGroup.add(trim);

    // Кабина с лобовым и задним скосом
    const cabinGeo = new THREE.BoxGeometry(1.85, 0.75, 2.6);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 1.25, -0.3);
    this.sedanGroup.add(cabin);

    const roofGeo = new THREE.BoxGeometry(1.8, 0.06, 2.5);
    const roof = new THREE.Mesh(roofGeo, bodyMat);
    roof.position.set(0, 1.63, -0.3);
    this.sedanGroup.add(roof);

    // Лобовое стекло (Windshield) с наклоном
    const windGeo = new THREE.PlaneGeometry(1.7, 0.85);
    const windMesh = new THREE.Mesh(windGeo, glassMat);
    windMesh.position.set(0, 1.22, 1.05);
    windMesh.rotation.x = Math.PI / 3.4;
    this.sedanGroup.add(windMesh);

    // 2. Анимированные стеклоочистители (Дворники)
    this.wipers = [];
    [-0.45, 0.35].forEach((wX) => {
      const wiperPivot = new THREE.Group();
      wiperPivot.position.set(wX, 0.92, 1.35);
      wiperPivot.rotation.x = Math.PI / 3.4;

      // Щетка стеклоочистителя
      const bladeGeo = new THREE.BoxGeometry(0.03, 0.65, 0.02);
      bladeGeo.translate(0, 0.32, 0); // Смещение оси вращения к основанию
      const bladeMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      wiperPivot.add(blade);

      this.sedanGroup.add(wiperPivot);
      this.wipers.push(wiperPivot);
    });

    // 3. Фары и волюметрические лучи сквозь штормовой дождь
    const headMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const hlGeo = new THREE.BoxGeometry(0.38, 0.2, 0.08);

    const hlL = new THREE.Mesh(hlGeo, headMat);
    hlL.position.set(-0.75, 0.65, 2.62);
    this.sedanGroup.add(hlL);

    const hlR = new THREE.Mesh(hlGeo, headMat);
    hlR.position.set(0.75, 0.65, 2.62);
    this.sedanGroup.add(hlR);

    // Световые конусы фар
    this.carLight = new THREE.SpotLight(0xfef9c3, 16.0, 48, Math.PI / 7, 0.6, 1.2);
    this.carLight.position.set(0, 0.65, 2.65);
    this.carTarget = new THREE.Object3D();
    this.carTarget.position.set(0, 0, 25);
    this.sedanGroup.add(this.carTarget);
    this.carLight.target = this.carTarget;
    this.sedanGroup.add(this.carLight);

    // Рубиновые задние габариты
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
    const tlGeo = new THREE.BoxGeometry(0.42, 0.18, 0.08);
    const tlL = new THREE.Mesh(tlGeo, tailMat);
    tlL.position.set(-0.75, 0.65, -2.62);
    this.sedanGroup.add(tlL);

    const tlR = new THREE.Mesh(tlGeo, tailMat);
    tlR.position.set(0.75, 0.65, -2.62);
    this.sedanGroup.add(tlR);

    this.group.add(this.sedanGroup);
  }

  // =========================================================================
  // ЦИКЛ АНИМАЦИИ КАДРА (ВЫЗЫВАЕТСЯ ДИРЕКТОРОМ)
  // =========================================================================
  update(frame) {
    const time = frame * 0.016;

    // 1. Анимация стеклоочистителей (дворников) седана с ускорением и паузой
    const wiperCycle = Math.sin(time * 6.5);
    const wiperAngle = THREE.MathUtils.clamp(wiperCycle * 1.35, -1.2, 0.0);
    this.wipers.forEach((w) => {
      w.rotation.z = wiperAngle;
    });

    // 2. Аутентичное микро-мерцание неоновых вывесок (стартеры ламп)
    this.neonFlickers.forEach((nf) => {
      const flickerNoise = Math.sin(frame * 0.8 + nf.seed) * Math.cos(frame * 1.7);
      const isDeadFlicker = Math.random() < 0.03; // Редкий сбой контакта
      if (isDeadFlicker) {
        nf.light.intensity = 0.2;
      } else {
        nf.light.intensity = nf.baseIntensity + flickerNoise * 0.9;
      }
    });

    // 3. Вращение лопастей кондиционеров на стенах
    this.fanBlades.forEach((blade) => {
      blade.rotation.x += 0.25;
    });

    // 4. Физика клубящегося пара из канализационного люка
    const sPos = this.steamGeometry.attributes.position.array;
    for (let i = 0; i < this.steamCount; i++) {
      const idx = i * 3;
      const v = this.steamVels[i];

      sPos[idx]     += v.x + Math.sin(time * 3.0 + i) * 0.008;
      sPos[idx + 1] += v.y;
      sPos[idx + 2] += v.z;

      // Если частица пара поднялась слишком высоко или рассеялась — возрождаем в люке
      if (sPos[idx + 1] > 5.2) {
        sPos[idx]     = (Math.random() - 0.5) * 0.35;
        sPos[idx + 1] = 0.05;
        sPos[idx + 2] = (Math.random() - 0.5) * 0.35;
      }
    }
    this.steamGeometry.attributes.position.needsUpdate = true;

    // 5. Импульсный маяк на верхушке Landmark Tower (раз в 40 кадров)
    const towerFlash = frame % 40 < 5;
    this.towerBeacon.intensity = towerFlash ? 8.0 : 0.4;
  }
                                                    } 
