import * as THREE from 'three';

/**
 * СЦЕНА 4: СУДЕБНО-БАЛЛИСТИЧЕСКАЯ РЕКОНСТРУКЦИЯ (0:18 - 0:24 | Кадры 1080 - 1439)
 * 3D-облет вокруг парящей пули 9мм с нарезами ствола, лазерные векторы выстрела,
 * голографическая доска улик с красными нитями и спектрограмма радиоперехвата.
 */
export class Scene4Forensics {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'Scene4_Forensics';
    this.scene.add(this.group);

    // Инициализация подсистем сцены
    this.initTacticalGrid();
    this.initBallisticBullet3D();
    this.initHoloScannerRings();
    this.initTrajectoryLaserReconstruction();
    this.initForensicDossierBoard();
    this.initAudioOscillogram();
  }

  // =========================================================================
  // 1. ТАКТИЧЕСКИЙ ПОЛЯРНЫЙ ПОЛ И СЕТКА КООРДИНАТНОГО ЗАЛА
  // =========================================================================
  initTacticalGrid() {
    this.gridGroup = new THREE.Group();

    // Темная отражающая поверхность криминалистического стола
    const floorGeo = new THREE.PlaneGeometry(36, 36);
    floorGeo.rotateX(-Math.PI / 2);

    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x03060c,
      roughness: 0.15,
      metalness: 0.95
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -2.2;
    this.gridGroup.add(floor);

    // Концентрические кольца дальности и угловой транспортир (Polar Coordinates)
    const ringMat = new THREE.LineBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.35
    });

    [2.0, 4.0, 6.0, 8.5, 12.0].forEach((r) => {
      const ringGeo = new THREE.RingGeometry(r - 0.02, r + 0.02, 64);
      ringGeo.rotateX(-Math.PI / 2);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = -2.18;
      this.gridGroup.add(ring);
    });

    // Радиальные оси углов стрельбы (через каждые 30 градусов)
    const axisMat = new THREE.LineBasicMaterial({ color: 0x0369a1, transparent: true, opacity: 0.25 });
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
      const pts = [
        new THREE.Vector3(0, -2.18, 0),
        new THREE.Vector3(Math.cos(a) * 12.0, -2.18, Math.sin(a) * 12.0)
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(lineGeo, axisMat);
      this.gridGroup.add(line);
    }

    this.group.add(this.gridGroup);
  }

  // =========================================================================
  // 2. ВЫСОКОТОЧНАЯ 3D-МОДЕЛЬ ПУЛИ 9X19MM С НАРЕЗАМИ СТВОЛА
  // =========================================================================
  initBallisticBullet3D() {
    this.bulletGroup = new THREE.Group();
    // Расположение в центре облета камеры
    this.bulletGroup.position.set(0, 1.4, 0);

    // Построение профиля пули (Оживальная головная часть и цилиндрический ведущий поясок)
    const points = [];
    const r = 0.52; // Радиус 9мм в масштабе сцены
    const h = 1.65; // Длина пули

    // Донце пули (Boat-tail с конической фаской)
    points.push(new THREE.Vector2(0.0, -0.65));
    points.push(new THREE.Vector2(r * 0.92, -0.65));
    points.push(new THREE.Vector2(r, -0.55));

    // Ведущая цилиндрическая часть
    points.push(new THREE.Vector2(r, 0.2));

    // Оживальная часть (Огибающая дуга к кончику пули)
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const curY = 0.2 + t * 0.85;
      const curR = r * Math.cos(t * Math.PI * 0.5);
      points.push(new THREE.Vector2(curR, curY));
    }
    points.push(new THREE.Vector2(0.0, 1.05));

    const bulletGeo = new THREE.LatheGeometry(points, 32);

    // Материал медной оболочки FMJ с металлическим блеском и микронарезами
    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xca6f32, // Томпак / Медь оболочки
      roughness: 0.18,
      metalness: 0.92
    });

    this.bulletMesh = new THREE.Mesh(bulletGeo, copperMat);
    this.bulletGroup.add(this.bulletMesh);

    // 6 правосторонних нарезов ствола (Rifling Grooves) табельного пистолета
    const striationMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917, // Нагар и темная сталь от контакта с нарезами
      roughness: 0.6,
      metalness: 0.8
    });

    this.striationMeshes = [];
    for (let s = 0; s < 6; s++) {
      const ang = (s * Math.PI * 2) / 6;
      const stGeo = new THREE.BoxGeometry(0.12, 0.72, 0.04);
      const stMesh = new THREE.Mesh(stGeo, striationMat);

      stMesh.position.set(
        Math.cos(ang) * (r + 0.005),
        -0.15,
        Math.sin(ang) * (r + 0.005)
      );
      // Спиральный наклон нареза ствола (Правый твист 1:10 дюймов)
      stMesh.rotation.y = -ang;
      stMesh.rotation.z = -0.16;
      this.bulletGroup.add(stMesh);
      this.striationMeshes.push(stMesh);
    }

    // Сканирующий лазерный срез микрометра (светящаяся плоскость сечения)
    const scanPlaneGeo = new THREE.RingGeometry(0.65, 0.68, 32);
    scanPlaneGeo.rotateX(Math.PI / 2);
    const scanPlaneMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    this.scanLaserRing = new THREE.Mesh(scanPlaneGeo, scanPlaneMat);
    this.scanLaserRing.position.y = 0.0;
    this.bulletGroup.add(this.scanLaserRing);

    // Подсветка пули: теплый медный свет и контровой холодный циан
    const warmLight = new THREE.PointLight(0xfdba74, 3.5, 6);
    warmLight.position.set(1.5, 1.0, 1.5);
    this.bulletGroup.add(warmLight);

    const coldRimLight = new THREE.PointLight(0x38bdf8, 4.0, 6);
    coldRimLight.position.set(-1.5, -0.5, -1.5);
    this.bulletGroup.add(coldRimLight);

    this.group.add(this.bulletGroup);
  }

  // =========================================================================
  // 3. ГОЛОГРАФИЧЕСКИЕ КОЛЬЦА АНАЛИЗАТОРА (HUD SCANNER RINGS)
  // =========================================================================
  initHoloScannerRings() {
    this.ringsGroup = new THREE.Group();
    this.ringsGroup.position.set(0, 1.4, 0);

    const createReticleRing = (radius, color, dashed = false) => {
      const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, false, 0);
      const points = curve.getPoints(64);
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      geo.rotateX(Math.PI / 2);

      const mat = dashed
        ? new THREE.LineDashedMaterial({ color: color, dashSize: 0.2, gapSize: 0.1, transparent: true, opacity: 0.65 })
        : new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.75 });

      const line = new THREE.Line(geo, mat);
      if (dashed) line.computeLineDistances();
      return line;
    };

    this.ring1 = createReticleRing(1.4, 0x38bdf8, true);
    this.ring2 = createReticleRing(1.8, 0xef4444, false);
    this.ring3 = createReticleRing(2.2, 0x0ea5e9, true);

    this.ringsGroup.add(this.ring1);
    this.ringsGroup.add(this.ring2);
    this.ringsGroup.add(this.ring3);

    // Вертикальная координатная дуга угломера
    const arcCurve = new THREE.EllipseCurve(0, 0, 1.6, 1.6, 0, Math.PI * 0.75, false, 0);
    const arcGeo = new THREE.BufferGeometry().setFromPoints(arcCurve.getPoints(32));
    const arcMat = new THREE.LineBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.8 });
    this.angleArc = new THREE.Line(arcGeo, arcMat);
    this.ringsGroup.add(this.angleArc);

    this.group.add(this.ringsGroup);
  }

  // =========================================================================
  // 4. ТРАЕКТОРИЯ ВЫСТРЕЛА: ЛАЗЕРНЫЙ ВЕКТОР И УГОЛ 34.2 ГРАДУСА
  // =========================================================================
  initTrajectoryLaserReconstruction() {
    this.trajectoryGroup = new THREE.Group();

    // Лазерная траектория пули: от точки выстрела со спины к падению в залив
    const pOrigin = new THREE.Vector3(-3.5, 3.2, -2.5); // Стрелок
    const pImpact = new THREE.Vector3(0, 1.4, 0);        // Точка поражения
    const pWater  = new THREE.Vector3(4.8, -2.2, 3.2);  // Вектор сброса в залив

    // Основной красный лазерный луч
    const laserMat = new THREE.LineBasicMaterial({
      color: 0xef4444,
      linewidth: 3,
      transparent: true,
      opacity: 0.95
    });

    const laserPts = [pOrigin, pImpact, pWater];
    const laserGeo = new THREE.BufferGeometry().setFromPoints(laserPts);
    this.laserTrajectory = new THREE.Line(laserGeo, laserMat);
    this.trajectoryGroup.add(this.laserTrajectory);

    // Точечные маркеры позиций в пространстве
    const createTargetPoint = (pos, col, text) => {
      const pGrp = new THREE.Group();
      pGrp.position.copy(pos);

      const sGeo = new THREE.SphereGeometry(0.12, 12, 12);
      const sMat = new THREE.MeshBasicMaterial({ color: col });
      const sphere = new THREE.Mesh(sGeo, sMat);
      pGrp.add(sphere);

      const pLight = new THREE.PointLight(col, 2.5, 4.0);
      pGrp.add(pLight);

      return pGrp;
    };

    this.trajectoryGroup.add(createTargetPoint(pOrigin, 0xef4444, 'СТРЕЛОК'));
    this.trajectoryGroup.add(createTargetPoint(pImpact, 0x38bdf8, 'КОНТАКТ'));
    this.trajectoryGroup.add(createTargetPoint(pWater, 0x06b6d4, 'ЗАЛИВ'));

    this.group.add(this.trajectoryGroup);
  }

  // =========================================================================
  // 5. ПАРЯЩАЯ 3D-ДОСКА УЛИК И КРАСНЫЕ КРИМИНАЛЬНЫЕ НИТИ (EVIDENCE BOARD)
  // =========================================================================
  initForensicDossierBoard() {
    this.dossierGroup = new THREE.Group();
    this.dossierGroup.position.set(0, 1.2, 0);

    this.evidenceCards = [];

    // Генерация текстуры фотокарточки детектива Исикавы
    const createCardTexture = (title, sub1, sub2, isRedacted = false) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 640;
      const ctx = canvas.getContext('2d');

      // Бумага архивного дела со следами времени
      ctx.fillStyle = '#0a0f1d';
      ctx.fillRect(0, 0, 512, 640);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 6;
      ctx.strokeRect(8, 8, 496, 624);

      // Заголовок карточки
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 32px "Courier New", monospace';
      ctx.fillText(title, 35, 60);

      // Фото-рамка в деле
      ctx.fillStyle = '#020617';
      ctx.fillRect(35, 90, 442, 280);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(35, 90, 442, 280);

      // Силуэт/паттерн фотокарточки
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(256, 210, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(256, 330, 110, 60, 0, 0, Math.PI * 2);
      ctx.fill();

      // Данные расследования
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(sub1, 35, 420);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '20px monospace';
      ctx.fillText(sub2, 35, 460);

      // Красные плашки цензуры высшего руководства
      if (isRedacted) {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(35, 510, 400, 32);
        ctx.fillRect(35, 560, 320, 28);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px monospace';
        ctx.fillText('СЕКРЕТНО // РАСПОРЯЖЕНИЕ ШТАБА', 45, 532);
      } else {
        // Японский оттиск печати
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 4;
        ctx.strokeRect(330, 490, 130, 110);
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 26px "Noto Serif JP", serif';
        ctx.fillText('重要', 370, 535);
        ctx.fillText('証拠', 370, 575);
      }

      const tex = new THREE.CanvasTexture(canvas);
      return tex;
    };

    // Конфигурация парящих карточек досье в пространстве вокруг пули
    const cardData = [
      {
        pos: new THREE.Vector3(-3.2, 0.8, -1.8),
        rot: [0, 0.45, 0],
        title: 'СУБЪЕКТ // ИСИКАВА К.',
        s1: 'ИНСПЕКТОР СЛЕДСТВЕННОГО ОТДЕЛА',
        s2: 'СТАТУС: ПРОПАЛ В ПОРТУ [M.I.A.]',
        redacted: false
      },
      {
        pos: new THREE.Vector3(3.2, 1.2, -1.5),
        rot: [0, -0.4, 0],
        title: 'УЛИКА #B7 // ПИРС-4',
        s1: 'ГИЛЬЗА 9X19MM С МЕСТА СБРОСА',
        s2: 'СОВПАДЕНИЕ НАРЕЗОВ: 99.8%',
        redacted: false
      },
      {
        pos: new THREE.Vector3(0.5, 2.2, -3.2),
        rot: [0.15, 0, 0],
        title: 'РАПОРТ УПРАВЛЕНИЯ КАНАГАВА',
        s1: 'ПРИКАЗ ОБ ОТКЛЮЧЕНИИ AIS КАМЕР',
        s2: 'ПОДПИСЬ: РУКОВОДСТВО ДЕПАРТАМЕНТА',
        redacted: true
      }
    ];

    const cardGeo = new THREE.PlaneGeometry(1.6, 2.0);

    cardData.forEach((cd) => {
      const tex = createCardTexture(cd.title, cd.s1, cd.s2, cd.redacted);
      const cardMat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.4,
        metalness: 0.2,
        side: THREE.DoubleSide
      });
      const cardMesh = new THREE.Mesh(cardGeo, cardMat);
      cardMesh.position.copy(cd.pos);
      cardMesh.rotation.set(cd.rot[0], cd.rot[1], cd.rot[2]);

      // Металлическая булавка на карточке
      const pinGeo = new THREE.SphereGeometry(0.045, 8, 8);
      const pinMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.9, roughness: 0.2 });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.set(0, 0.95, 0.03);
      cardMesh.add(pin);

      this.dossierGroup.add(cardMesh);
      this.evidenceCards.push(cardMesh);
    });

    // 3D-КРАСНЫЕ КРИМИНАЛЬНЫЕ НИТИ РАССЛЕДОВАНИЯ (Bézier Curves)
    const threadMat = new THREE.LineBasicMaterial({
      color: 0xdc2626,
      linewidth: 3,
      transparent: true,
      opacity: 0.85
    });

    const createThread = (startVec, endVec, droopY = -0.35) => {
      const mid = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
      mid.y += droopY; // Физическое провисание нити
      const curve = new THREE.QuadraticBezierCurve3(startVec, mid, endVec);
      const pts = curve.getPoints(32);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      return new THREE.Line(geo, threadMat);
    };

    // Соединяем улики нитями: от пули к карточкам подозреваемых
    const pBullet = new THREE.Vector3(0, 0.2, 0);
    const pCard1 = new THREE.Vector3(-3.2, 1.7, -1.8);
    const pCard2 = new THREE.Vector3(3.2, 2.1, -1.5);
    const pCard3 = new THREE.Vector3(0.5, 3.1, -3.2);

    this.dossierGroup.add(createThread(pCard1, pBullet, -0.4));
    this.dossierGroup.add(createThread(pBullet, pCard2, -0.3));
    this.dossierGroup.add(createThread(pCard1, pCard3, -0.5));
    this.dossierGroup.add(createThread(pCard3, pCard2, -0.45));

    this.group.add(this.dossierGroup);
  }

  // =========================================================================
  // 6. 3D-ОСЦИЛЛОГРАММА ПЕРЕХВАТА РАДИОЧАСТОТЫ СИНДИКАТА
  // =========================================================================
  initAudioOscillogram() {
    this.audioGroup = new THREE.Group();
    this.audioGroup.position.set(0, -1.2, -2.5);

    // 48 вертикальных светящихся полос спектрограммы
    this.barCount = 48;
    this.audioBars = [];
    const barMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    const totalWidth = 6.4;
    const step = totalWidth / this.barCount;

    for (let i = 0; i < this.barCount; i++) {
      const barGeo = new THREE.BoxGeometry(step * 0.75, 1.0, 0.04);
      barGeo.translate(0, 0.5, 0); // Рост от основания
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(-totalWidth / 2 + i * step, 0, 0);
      this.audioGroup.add(bar);
      this.audioBars.push(bar);
    }

    // Текстовая плашка частоты радиоперехвата
    const freqCanvas = document.createElement('canvas');
    freqCanvas.width = 512;
    freqCanvas.height = 64;
    const fctx = freqCanvas.getContext('2d');
    fctx.fillStyle = '#0369a1';
    fctx.font = 'bold 26px monospace';
    fctx.fillText('RADIO INTERCEPT // 148.525 MHz [ENCRYPTED]', 10, 42);

    const freqTex = new THREE.CanvasTexture(freqCanvas);
    const freqGeo = new THREE.PlaneGeometry(3.5, 0.45);
    const freqMesh = new THREE.Mesh(freqGeo, new THREE.MeshBasicMaterial({ map: freqTex, transparent: true }));
    freqMesh.position.set(0, 1.4, 0);
    this.audioGroup.add(freqMesh);

    this.group.add(this.audioGroup);
  }

  // =========================================================================
  // ЦИКЛ АНИМАЦИИ КАДРА (ВЫЗЫВАЕТСЯ ДИРЕКТОРОМ)
  // =========================================================================
  update(frame) {
    const time = frame * 0.016;

    // 1. Вращение 3D-пули и демонстрация нарезов ствола
    this.bulletMesh.rotation.y = time * 1.8;
    this.striationMeshes.forEach((sm, i) => {
      const baseAng = (i * Math.PI * 2) / 6 + time * 1.8;
      sm.position.x = Math.cos(baseAng) * 0.525;
      sm.position.z = Math.sin(baseAng) * 0.525;
      sm.rotation.y = -baseAng;
    });

    // 2. Движение сканирующего кольца лазерного микрометра вверх-вниз по телу пули
    const scanY = Math.sin(time * 3.5) * 0.6;
    this.scanLaserRing.position.y = scanY;

    // 3. Встречное вращение голографических колец прицела HUD
    this.ring1.rotation.y = time * 0.9;
    this.ring2.rotation.y = -time * 1.4;
    this.ring3.rotation.y = time * 0.6;
    this.angleArc.rotation.z = Math.sin(time * 1.2) * 0.25;

    // 4. Дыхание (левитация) парящих карточек улик расследования
    this.evidenceCards.forEach((card, idx) => {
      card.position.y += Math.sin(time * 2.0 + idx * 1.5) * 0.0015;
    });

    // 5. Модуляция полос осциллограммы звуковой волны перехвата радио
    for (let i = 0; i < this.barCount; i++) {
      const freq1 = Math.sin(i * 0.35 + time * 14.0);
      const freq2 = Math.cos(i * 0.7 - time * 8.0);
      const voicePacket = Math.sin(time * 4.0) > 0.1 ? 1.0 : 0.15; // Паузы речи в эфире
      const height = Math.abs(freq1 * freq2) * 1.1 * voicePacket + 0.08;
      this.audioBars[i].scale.y = height;
    }

    // 6. Пульсация красного траекторного лазера
    const laserPulse = Math.sin(time * 12.0) * 0.15 + 0.85;
    this.laserTrajectory.material.opacity = laserPulse;
  }
}
