import * as THREE from 'three';

/**
 * СЦЕНА 2: ПИРС ХОНМОКУ // МЕСТО ПРЕСТУПЛЕНИЯ (0:06 - 0:12 | Кадры 360 - 719)
 * Макро-кинематография на уровне земли: гильза 9мм, жетон детектива,
 * кровь в луже, развевающаяся лента и стробоскопы полиции.
 */
export class Scene2Docks {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'Scene2_Docks';
    this.scene.add(this.group);

    // Инициализация компонентов сцены
    this.initWetAsphalt();
    this.initPierBorder();
    this.initBulletCasing();
    this.initPoliceBadge();
    this.initBloodPuddle();
    this.initEvidenceMarkers();
    this.initFlutteringPoliceTape();
    this.initPolicePatrolCar();
    this.initCargoContainers();
    this.initPuddleRipples();
  }

  // =========================================================================
  // 1. МОКРЫЙ АСФАЛЬТ И ТЕРМИНАЛЬНЫЙ НАСТИЛ С ОТРАЖЕНИЯМИ
  // =========================================================================
  initWetAsphalt() {
    const asphaltGeo = new THREE.PlaneGeometry(90, 90, 80, 80);
    asphaltGeo.rotateX(-Math.PI / 2);

    // Процедурная текстура микрошероховатости и трещин асфальта
    const asphaltCanvas = document.createElement('canvas');
    asphaltCanvas.width = 512;
    asphaltCanvas.height = 512;
    const actx = asphaltCanvas.getContext('2d');

    actx.fillStyle = '#060a12';
    actx.fillRect(0, 0, 512, 512);

    // Зернистость битума
    for (let i = 0; i < 30000; i++) {
      const g = Math.floor(Math.random() * 28 + 10);
      actx.fillStyle = `rgb(${g},${g},${g + 4})`;
      actx.fillRect(Math.random() * 512, Math.random() * 512, 1.8, 1.8);
    }

    // Трещины на дорожном покрытии
    actx.strokeStyle = '#020408';
    actx.lineWidth = 2.0;
    for (let c = 0; c < 12; c++) {
      actx.beginPath();
      let cx = Math.random() * 512;
      let cy = Math.random() * 512;
      actx.moveTo(cx, cy);
      for (let s = 0; s < 6; s++) {
        cx += (Math.random() - 0.5) * 50;
        cy += (Math.random() - 0.5) * 50;
        actx.lineTo(cx, cy);
      }
      actx.stroke();
    }

    const asphaltTex = new THREE.CanvasTexture(asphaltCanvas);
    asphaltTex.wrapS = THREE.RepeatWrapping;
    asphaltTex.wrapT = THREE.RepeatWrapping;
    asphaltTex.repeat.set(8, 8);

    this.asphaltMat = new THREE.MeshStandardMaterial({
      map: asphaltTex,
      color: 0x070d18,
      roughness: 0.18, // Высокий зеркальный блеск от дождя
      metalness: 0.82
    });

    this.asphaltMesh = new THREE.Mesh(asphaltGeo, this.asphaltMat);
    this.asphaltMesh.position.set(0, 0, 0);
    this.group.add(this.asphaltMesh);
  }

  // =========================================================================
  // 2. КРОМКА ПИРСА С ЖЕЛТО-ЧЕРНОЙ РАЗМЕТКОЙ И КНЕХТОМ
  // =========================================================================
  initPierBorder() {
    // Бетонный брус кромки причала
    const curbGeo = new THREE.BoxGeometry(90, 0.45, 1.2);

    // Генерация диагональной предупреждающей разметки
    const hazardCanvas = document.createElement('canvas');
    hazardCanvas.width = 512;
    hazardCanvas.height = 64;
    const hctx = hazardCanvas.getContext('2d');

    hctx.fillStyle = '#111827';
    hctx.fillRect(0, 0, 512, 64);
    hctx.fillStyle = '#eab308';

    for (let x = -64; x < 512 + 64; x += 32) {
      hctx.beginPath();
      hctx.moveTo(x, 0);
      hctx.lineTo(x + 24, 0);
      hctx.lineTo(x - 8, 64);
      hctx.lineTo(x - 32, 64);
      hctx.closePath();
      hctx.fill();
    }

    const hazardTex = new THREE.CanvasTexture(hazardCanvas);
    hazardTex.wrapS = THREE.RepeatWrapping;
    hazardTex.repeat.set(12, 1);

    const curbMat = new THREE.MeshStandardMaterial({
      map: hazardTex,
      roughness: 0.35,
      metalness: 0.5
    });

    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.position.set(0, 0.22, -6.5);
    this.group.add(curb);

    // Массивный чугунный швартовный кнехт (Bollard)
    const bollardGroup = new THREE.Group();
    bollardGroup.position.set(-6.5, 0, -5.5);

    const bollardMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.6,
      metalness: 0.8
    });

    const baseGeo = new THREE.CylinderGeometry(0.55, 0.65, 0.4, 16);
    const base = new THREE.Mesh(baseGeo, bollardMat);
    base.position.y = 0.2;
    bollardGroup.add(base);

    const postGeo = new THREE.CylinderGeometry(0.38, 0.42, 1.1, 16);
    const post = new THREE.Mesh(postGeo, bollardMat);
    post.position.y = 0.85;
    bollardGroup.add(post);

    const crossGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.4, 12);
    crossGeo.rotateZ(Math.PI / 2);
    const cross = new THREE.Mesh(crossGeo, bollardMat);
    cross.position.y = 1.15;
    bollardGroup.add(cross);

    // Толстый мокрый швартовный канат, свисающий в воду
    const ropeCoords = [
      -6.5, 1.15, -5.5,
      -7.2, 0.4, -6.0,
      -8.0, -1.5, -7.5
    ];
    const ropeGeo = new THREE.BufferGeometry();
    ropeGeo.setAttribute('position', new THREE.Float32BufferAttribute(ropeCoords, 3));
    const ropeMat = new THREE.LineBasicMaterial({ color: 0x64748b, linewidth: 3 });
    const rope = new THREE.Line(ropeGeo, ropeMat);
    this.group.add(rope);

    this.group.add(bollardGroup);
  }

  // =========================================================================
  // 3. МАКРО-УЛИКА: ГИЛЬЗА 9X19MM PARABELLUM (ВЫСОКОТОЧНАЯ 3D-МОДЕЛЬ)
  // =========================================================================
  initBulletCasing() {
    this.bulletGroup = new THREE.Group();
    // Расположение строго в фокусе макро-камеры на мокром асфальте
    this.bulletGroup.position.set(-0.8, 0.045, 0.5);
    this.bulletGroup.rotation.set(0, 0.65, Math.PI / 2); // Лежит на боку

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // Полированная латунь
      roughness: 0.16,
      metalness: 0.96
    });

    const primerMat = new THREE.MeshStandardMaterial({
      color: 0xa1a1aa, // Никелированный капсюль
      roughness: 0.3,
      metalness: 0.9
    });

    // Основная цилиндрическая часть гильзы
    const bodyGeo = new THREE.CylinderGeometry(0.048, 0.049, 0.19, 24, 1, true);
    const body = new THREE.Mesh(bodyGeo, brassMat);
    this.bulletGroup.add(body);

    // Донце гильзы с проточкой под выбрасыватель (Extractor Groove)
    const grooveGeo = new THREE.CylinderGeometry(0.043, 0.043, 0.025, 24);
    const groove = new THREE.Mesh(grooveGeo, brassMat);
    groove.position.y = -0.1;
    this.bulletGroup.add(groove);

    const rimGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.015, 24);
    const rim = new THREE.Mesh(rimGeo, brassMat);
    rim.position.y = -0.118;
    this.bulletGroup.add(rim);

    // Капсюль со следом удара бойка (улика криминалистов)
    const primerGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.005, 16);
    const primer = new THREE.Mesh(primerGeo, primerMat);
    primer.position.y = -0.126;
    this.bulletGroup.add(primer);

    // Точечный след бойка
    const indentGeo = new THREE.SphereGeometry(0.008, 8, 8);
    const indentMat = new THREE.MeshBasicMaterial({ color: 0x18181b });
    const indent = new THREE.Mesh(indentGeo, indentMat);
    indent.position.set(0.003, -0.128, 0.002);
    this.bulletGroup.add(indent);

    // Локальный блик на гильзе от полицейского стробоскопа
    this.casingGlint = new THREE.PointLight(0xffedd5, 1.2, 1.2);
    this.casingGlint.position.set(0, 0.12, 0);
    this.bulletGroup.add(this.casingGlint);

    this.group.add(this.bulletGroup);
  }

  // =========================================================================
  // 4. МАКРО-УЛИКА: БРОШЕННЫЙ ПОЛИЦЕЙСКИЙ ЖЕТОН КАНАГАВА
  // =========================================================================
  initPoliceBadge() {
    this.badgeGroup = new THREE.Group();
    this.badgeGroup.position.set(0.7, 0.025, 0.85);
    this.badgeGroup.rotation.set(-Math.PI / 2, 0, 0.35);

    // Кожаная обложка удостоверения (Черная тисненая кожа)
    const leatherGeo = new THREE.BoxGeometry(0.48, 0.68, 0.03);
    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.65,
      metalness: 0.15
    });
    const leather = new THREE.Mesh(leatherGeo, leatherMat);
    this.badgeGroup.add(leather);

    // Золотая полицейская эмблема Восходящего Солнца (旭日章 Asahi Sunburst)
    const badgePlateGeo = new THREE.CylinderGeometry(0.16, 0.17, 0.015, 16);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      roughness: 0.22,
      metalness: 0.95
    });
    const badgePlate = new THREE.Mesh(badgePlateGeo, goldMat);
    badgePlate.rotation.x = Math.PI / 2;
    badgePlate.position.set(0, 0.12, 0.022);
    this.badgeGroup.add(badgePlate);

    // Лучи солнца эмблемы
    for (let r = 0; r < 8; r++) {
      const rayGeo = new THREE.BoxGeometry(0.04, 0.38, 0.012);
      const ray = new THREE.Mesh(rayGeo, goldMat);
      ray.rotation.z = (r * Math.PI) / 8;
      ray.position.set(0, 0.12, 0.024);
      this.badgeGroup.add(ray);
    }

    // Серебряная идентификационная плашка с гравировкой детектива
    const idCanvas = document.createElement('canvas');
    idCanvas.width = 256;
    idCanvas.height = 128;
    const ictx = idCanvas.getContext('2d');
    ictx.fillStyle = '#cbd5e1';
    ictx.fillRect(0, 0, 256, 128);
    ictx.fillStyle = '#0f172a';
    ictx.font = 'bold 24px monospace';
    ictx.fillText('神奈川県警察', 25, 45);
    ictx.font = 'bold 20px monospace';
    ictx.fillText('KP-74891 // 警部補', 20, 85);

    const idTex = new THREE.CanvasTexture(idCanvas);
    const idGeo = new THREE.PlaneGeometry(0.36, 0.18);
    const idMat = new THREE.MeshBasicMaterial({ map: idTex });
    const idMesh = new THREE.Mesh(idGeo, idMat);
    idMesh.position.set(0, -0.16, 0.022);
    this.badgeGroup.add(idMesh);

    this.group.add(this.badgeGroup);
  }

  // =========================================================================
  // 5. ЛУЖА КРОВИ С КАПЛЯМИ И СМЫВАНИЕМ В ЗАЛИВ
  // =========================================================================
  initBloodPuddle() {
    this.bloodGroup = new THREE.Group();
    this.bloodGroup.position.set(-0.2, 0.008, 0.2);

    // Форма основной лужи крови
    const bloodGeo = new THREE.CircleGeometry(0.75, 32);
    bloodGeo.rotateX(-Math.PI / 2);

    // Глубокий карминный цвет с высоким коэффициентом зеркальности влаги
    this.bloodMat = new THREE.MeshStandardMaterial({
      color: 0x580505, // Свернувшаяся кровь
      roughness: 0.08,
      metalness: 0.65,
      transparent: true,
      opacity: 0.92
    });

    const bloodMesh = new THREE.Mesh(bloodGeo, this.bloodMat);
    this.bloodGroup.add(bloodMesh);

    // Дорожка капель (след волочения к краю пирса)
    const dropsCount = 28;
    const dropGeo = new THREE.CircleGeometry(0.06, 12);
    dropGeo.rotateX(-Math.PI / 2);

    for (let d = 0; d < dropsCount; d++) {
      const drop = new THREE.Mesh(dropGeo, this.bloodMat);
      const trailZ = -d * 0.22;
      const trailX = (Math.random() - 0.5) * 0.4 + (d * 0.04);
      drop.position.set(trailX, 0, trailZ);
      const s = THREE.MathUtils.randFloat(0.4, 1.4);
      drop.scale.set(s, s, s);
      this.bloodGroup.add(drop);
    }

    this.group.add(this.bloodGroup);
  }

  // =========================================================================
  // 6. ЖЕЛТЫЕ КРИМИНАЛИСТИЧЕСКИЕ МАРКЕРЫ УЛИК (#A И #B)
  // =========================================================================
  initEvidenceMarkers() {
    const createMarker = (letter, x, z) => {
      const mGroup = new THREE.Group();
      mGroup.position.set(x, 0, z);

      // Двускатная пластиковая палатка маркера
      const tentCanvas = document.createElement('canvas');
      tentCanvas.width = 128;
      tentCanvas.height = 128;
      const tctx = tentCanvas.getContext('2d');

      tctx.fillStyle = '#eab308'; // Ярко-желтый
      tctx.fillRect(0, 0, 128, 128);
      tctx.fillStyle = '#000000';
      tctx.font = '900 80px monospace';
      tctx.textAlign = 'center';
      tctx.fillText(letter, 64, 90);

      const tentTex = new THREE.CanvasTexture(tentCanvas);
      const tentGeo = new THREE.ConeGeometry(0.18, 0.25, 4, 1, true);
      tentGeo.rotateY(Math.PI / 4);
      const tentMat = new THREE.MeshStandardMaterial({
        map: tentTex,
        roughness: 0.4,
        metalness: 0.2
      });

      const tent = new THREE.Mesh(tentGeo, tentMat);
      tent.position.y = 0.125;
      mGroup.add(tent);
      return mGroup;
    };

    this.markerA = createMarker('A', -1.2, 0.4);
    this.markerB = createMarker('B', 1.1, 0.9);
    this.group.add(this.markerA);
    this.group.add(this.markerB);
  }

  // =========================================================================
  // 7. ПОЛИЦЕЙСКАЯ ЛЕНТА ОГРАЖДЕНИЯ (ШТОРМОВЫЕ КОЛЕБАНИЯ)
  // =========================================================================
  initFlutteringPoliceTape() {
    this.tapeGroup = new THREE.Group();

    // Стойки ограждения (Police Traffic Stanchions)
    const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.4, 12);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });

    const p1 = new THREE.Mesh(poleGeo, poleMat);
    p1.position.set(-6, 0.7, 2.5);
    this.tapeGroup.add(p1);

    const p2 = new THREE.Mesh(poleGeo, poleMat);
    p2.position.set(6, 0.7, 2.2);
    this.tapeGroup.add(p2);

    // Текстура желтой ленты с надписью на японском и английском языках
    const tapeCanvas = document.createElement('canvas');
    tapeCanvas.width = 1024;
    tapeCanvas.height = 64;
    const tpctx = tapeCanvas.getContext('2d');

    tpctx.fillStyle = '#facc15';
    tpctx.fillRect(0, 0, 1024, 64);
    tpctx.fillStyle = '#000000';
    tpctx.font = 'bold 26px monospace';

    for (let x = 0; x < 1024; x += 340) {
      tpctx.fillText('神奈川県警 捜査本部 立入禁止 POLICE LINE', x, 42);
    }

    const tapeTex = new THREE.CanvasTexture(tapeCanvas);
    tapeTex.wrapS = THREE.RepeatWrapping;
    tapeTex.repeat.set(3, 1);

    // Параметрическая геометрия ленты (разбита на сегменты для ветровой волны)
    this.tapeLength = 12.0;
    this.tapeSegments = 48;
    this.tapeGeo = new THREE.PlaneGeometry(this.tapeLength, 0.18, this.tapeSegments, 2);

    const tapeMat = new THREE.MeshStandardMaterial({
      map: tapeTex,
      roughness: 0.3,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    this.tapeMesh = new THREE.Mesh(this.tapeGeo, tapeMat);
    this.tapeMesh.position.set(0, 1.05, 2.35);
    this.tapeGroup.add(this.tapeMesh);

    this.baseTapeVertices = this.tapeGeo.attributes.position.clone();

    this.group.add(this.tapeGroup);
  }

  // =========================================================================
  // 8. ЯПОНСКИЙ ПАТРУЛЬНЫЙ СЕДАН И СТРОБОСКОПЫ ПОЛИЦИИ
  // =========================================================================
  initPolicePatrolCar() {
    this.carGroup = new THREE.Group();
    this.carGroup.position.set(7.5, 0, -1.8);
    this.carGroup.rotation.y = -Math.PI / 1.35; // Автомобиль стоит под углом

    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.7 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.25, metalness: 0.8 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.85 });

    // 1. Нижняя половина кузова (Черный низ)
    const lowerGeo = new THREE.BoxGeometry(4.9, 0.55, 2.0);
    const lower = new THREE.Mesh(lowerGeo, blackMat);
    lower.position.y = 0.5;
    this.carGroup.add(lower);

    // 2. Верхняя половина кузова (Белый верх капота и дверей)
    const upperGeo = new THREE.BoxGeometry(4.85, 0.42, 1.95);
    const upper = new THREE.Mesh(upperGeo, whiteMat);
    upper.position.y = 0.95;
    this.carGroup.add(upper);

    // 3. Кабина и остекление
    const cabinGeo = new THREE.BoxGeometry(2.4, 0.75, 1.75);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(-0.15, 1.5, 0);
    this.carGroup.add(cabin);

    const roofGeo = new THREE.BoxGeometry(2.35, 0.06, 1.7);
    const roof = new THREE.Mesh(roofGeo, whiteMat);
    roof.position.set(-0.15, 1.88, 0);
    this.carGroup.add(roof);

    // 4. Аэродинамическая красная мигалка на крыше (V-образная балка Патока)
    this.lightbarGroup = new THREE.Group();
    this.lightbarGroup.position.set(-0.15, 2.0, 0);

    const barGeo = new THREE.BoxGeometry(0.35, 0.16, 1.25);
    const redLensMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85
    });
    const lightbar = new THREE.Mesh(barGeo, redLensMat);
    this.lightbarGroup.add(lightbar);

    // Источники красно-синего стробоскопического света
    this.strobeRedLeft = new THREE.PointLight(0xef4444, 0.0, 35);
    this.strobeRedLeft.position.set(0, 0.1, -0.55);
    this.lightbarGroup.add(this.strobeRedLeft);

    this.strobeRedRight = new THREE.PointLight(0xff0000, 0.0, 35);
    this.strobeRedRight.position.set(0, 0.1, 0.55);
    this.lightbarGroup.add(this.strobeRedRight);

    // Синий скрытый строб в решетке радиатора
    this.strobeBlueGrille = new THREE.PointLight(0x0284c7, 0.0, 20);
    this.strobeBlueGrille.position.set(2.4, 0.65, 0);
    this.carGroup.add(this.strobeBlueGrille);

    this.carGroup.add(this.lightbarGroup);

    // 5. Фары патрульного автомобиля сквозь дождь
    const headMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const hlGeo = new THREE.BoxGeometry(0.1, 0.18, 0.35);

    const hlL = new THREE.Mesh(hlGeo, headMat);
    hlL.position.set(2.45, 0.72, -0.65);
    this.carGroup.add(hlL);

    const hlR = new THREE.Mesh(hlGeo, headMat);
    hlR.position.set(2.45, 0.72, 0.65);
    this.carGroup.add(hlR);

    // Световой луч фар
    this.headlightSpot = new THREE.SpotLight(0xfef9c3, 14.0, 45, Math.PI / 6, 0.5, 1.0);
    this.headlightSpot.position.set(2.5, 0.72, 0);
    this.headlightTarget = new THREE.Object3D();
    this.headlightTarget.position.set(12, 0, 0);
    this.carGroup.add(this.headlightTarget);
    this.headlightSpot.target = this.headlightTarget;
    this.carGroup.add(this.headlightSpot);

    this.group.add(this.carGroup);
  }

  // =========================================================================
  // 9. ГРУЗОВЫЕ МОРСКИЕ КОНТЕЙНЕРЫ (HONMOKU PIER B-7)
  // =========================================================================
  initCargoContainers() {
    this.containerGroup = new THREE.Group();
    this.containerGroup.position.set(-14, 0, -4);

    const cColors = [0x7f1d1d, 0x1e3a8a, 0x134e4a, 0x3f3f46];

    for (let stack = 0; stack < 3; stack++) {
      for (let level = 0; level < 3; level++) {
        const cGeo = new THREE.BoxGeometry(12, 2.9, 2.8);
        const cMat = new THREE.MeshStandardMaterial({
          color: cColors[(stack + level) % cColors.length],
          roughness: 0.55,
          metalness: 0.7
        });
        const container = new THREE.Mesh(cGeo, cMat);
        container.position.set(0, 1.45 + level * 3.0, stack * 3.4);
        this.containerGroup.add(container);
      }
    }
    this.group.add(this.containerGroup);
  }

  // =========================================================================
  // 10. РЯБЬ В ЛУЖАХ ОТ ПАДАЮЩИХ КАПЕЛЬ ШТОРМОВОГО ДОЖДЯ
  // =========================================================================
  initPuddleRipples() {
    this.rippleCount = 14;
    this.ripples = [];

    const ripGeo = new THREE.RingGeometry(0.04, 0.08, 24);
    ripGeo.rotateX(-Math.PI / 2);

    for (let r = 0; r < this.rippleCount; r++) {
      const ripMat = new THREE.MeshBasicMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ripGeo, ripMat);
      ring.position.set(
        THREE.MathUtils.randFloat(-4, 4),
        0.009,
        THREE.MathUtils.randFloat(-2, 3)
      );
      this.group.add(ring);

      this.ripples.push({
        mesh: ring,
        scale: Math.random(),
        speed: THREE.MathUtils.randFloat(0.03, 0.06),
        baseX: ring.position.x,
        baseZ: ring.position.z
      });
    }
  }

  // =========================================================================
  // ЦИКЛ АНИМАЦИИ КАДРА (ВЫЗЫВАЕТСЯ ДИРЕКТОРОМ)
  // =========================================================================
  update(frame) {
    const time = frame * 0.016;

    // 1. Полицейские стробоскопы: двойная вспышка левого, затем правого (японский ритм)
    const strobeCycle = frame % 30;
    const leftActive = strobeCycle < 4 || (strobeCycle > 7 && strobeCycle < 11);
    const rightActive = (strobeCycle >= 15 && strobeCycle < 19) || (strobeCycle > 22 && strobeCycle < 26);
    const blueActive = frame % 12 < 3;

    this.strobeRedLeft.intensity = leftActive ? 22.0 : 0.2;
    this.strobeRedRight.intensity = rightActive ? 22.0 : 0.2;
    this.strobeBlueGrille.intensity = blueActive ? 14.0 : 0.0;

    // 2. Блик на стреляной гильзе и жетоне от стробоскопов
    this.casingGlint.intensity = (leftActive || rightActive) ? 2.5 : 0.3;

    // 3. Физика развевающейся на штормовом ветру полицейской ленты
    const pos = this.tapeGeo.attributes.position;
    const base = this.baseTapeVertices;
    const count = pos.count;
    const galeStrength = 0.28;

    for (let i = 0; i < count; i++) {
      const x = base.getX(i);
      const wavePhase = (x / this.tapeLength) * Math.PI * 4;
      const windWave = Math.sin(wavePhase - time * 18.0) * galeStrength;
      const microFlutter = Math.cos(wavePhase * 2.5 + time * 32.0) * 0.06;

      // Смещение ленты по ветру (Z-ось) и вибрация по высоте (Y-ось)
      pos.setZ(i, base.getZ(i) + windWave + microFlutter);
      pos.setY(i, base.getY(i) + Math.sin(time * 12.0 + x) * 0.04);
    }
    pos.needsUpdate = true;
    this.tapeGeo.computeVertexNormals();

    // 4. Анимация кругов ряби в лужах от капель дождя
    this.ripples.forEach((rip) => {
      rip.scale += rip.speed;
      if (rip.scale > 1.0) {
        rip.scale = 0.01;
        rip.mesh.position.x = THREE.MathUtils.randFloat(-6, 6);
        rip.mesh.position.z = THREE.MathUtils.randFloat(-3, 3);
      }
      const currentScale = rip.scale * 3.5;
      rip.mesh.scale.set(currentScale, 1.0, currentScale);
      rip.mesh.material.opacity = (1.0 - rip.scale) * 0.7;
    });

    // 5. Медленное размытие крови дождем
    const bloodWash = Math.sin(time * 0.8) * 0.04;
    this.bloodMat.opacity = 0.92 - bloodWash;
  }
}
