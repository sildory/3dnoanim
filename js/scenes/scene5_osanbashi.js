import * as THREE from 'three';

/**
 * СЦЕНА 5: КУЛЬМИНАЦИЯ НА ПИРСЕ ОСАНБАСИ (0:24 - 0:30 | Кадры 1440 - 1800)
 * Изогнутый деревянный пирс, детектив в развевающемся плаще,
 * колесо Cosmo Clock 21, ветвящиеся 3D-молнии и финальный титр.
 */
export class Scene5Osanbashi {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'Scene5_Osanbashi';
    this.scene.add(this.group);

    // Инициализация подсистем сцены
    this.initOsanbashiDeck();
    this.initDetectiveFigure();
    this.initYokohamaSkyline();
    this.initCosmoClock21();
    this.initBranchingLightning();
    this.initCinematicTitleOverlay();
  }

  // =========================================================================
  // 1. ИЗОГНУТЫЙ ДЕРЕВЯННЫЙ НАСТИЛ ОСАНБАСИ (ARCHITECTURAL DECK)
  // =========================================================================
  initOsanbashiDeck() {
    this.deckGroup = new THREE.Group();

    // Размеры террасы терминала
    const deckW = 32;
    const deckL = 90;
    const segX = 48;
    const segZ = 96;

    this.deckGeo = new THREE.PlaneGeometry(deckW, deckL, segX, segZ);
    this.deckGeo.rotateX(-Math.PI / 2);

    // Параметрическая форма "Спины кита" (плавные подъемы и спуски настила)
    const pos = this.deckGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Продольный спуск к океану и поперечные гребни террасы
      const longitudinalSlope = (z / deckL) * -1.8;
      const waveRidge = Math.sin((x / deckW) * Math.PI * 1.5) * 0.75 * Math.cos((z / deckL) * Math.PI);
      const y = longitudinalSlope + waveRidge;

      pos.setY(i, y);
    }
    this.deckGeo.computeVertexNormals();

    // Процедурная текстура мокрых досок из тика / ипе со щелями
    const plankCanvas = document.createElement('canvas');
    plankCanvas.width = 512;
    plankCanvas.height = 512;
    const pctx = plankCanvas.getContext('2d');

    pctx.fillStyle = '#0a0d14';
    pctx.fillRect(0, 0, 512, 512);

    for (let x = 0; x < 512; x += 16) {
      // Тон доски с вариацией
      const shade = Math.floor(Math.random() * 20 + 12);
      pctx.fillStyle = `rgb(${shade + 4}, ${shade + 2}, ${shade})`;
      pctx.fillRect(x + 1, 0, 14, 512);

      // Продольная линия стыка досок
      pctx.fillStyle = '#020306';
      pctx.fillRect(x, 0, 1.5, 512);
    }

    const deckTex = new THREE.CanvasTexture(plankCanvas);
    deckTex.wrapS = THREE.RepeatWrapping;
    deckTex.wrapT = THREE.RepeatWrapping;
    deckTex.repeat.set(8, 16);

    this.deckMat = new THREE.MeshStandardMaterial({
      map: deckTex,
      roughness: 0.14, // Зеркальный мокрый блеск от ливня
      metalness: 0.75
    });

    this.deckMesh = new THREE.Mesh(this.deckGeo, this.deckMat);
    this.deckMesh.position.set(0, 0, -10);
    this.deckGroup.add(this.deckMesh);

    // Нержавеющие морские леера и ограждения пирса
    const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.2 });
    [-15.5, 15.5].forEach((rx) => {
      for (let rz = -50; rz < 30; rz += 5) {
        const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.1, 8);
        const post = new THREE.Mesh(postGeo, railMat);
        post.position.set(rx, 0.55, rz);
        this.deckGroup.add(post);
      }

      // Горизонтальный поручень
      const railGeo = new THREE.BoxGeometry(0.06, 0.06, 80);
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(rx, 1.1, -10);
      this.deckGroup.add(rail);
    });

    this.group.add(this.deckGroup);
  }

  // =========================================================================
  // 2. ДЕТЕКТИВ КЭНДЗИ ИСИКАВА (3D-ФИГУРА С АНИМИРОВАННЫМ ПЛАЩОМ)
  // =========================================================================
  initDetectiveFigure() {
    this.detectiveGroup = new THREE.Group();
    // Детектив стоит спиной к камере у края пирса, глядя на штормовой залив
    this.detectiveGroup.position.set(0, 0.45, 0);

    const coatMat = new THREE.MeshStandardMaterial({
      color: 0x05070c, // Угольно-черный водонепроницаемый габардин
      roughness: 0.45,
      metalness: 0.3
    });

    const suitMat = new THREE.MeshStandardMaterial({ color: 0x020408, roughness: 0.6 });
    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x090a0f, roughness: 0.2, metalness: 0.8 });

    // 1. Обувь и классические брюки
    [-0.22, 0.22].forEach((lx) => {
      const legGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.95, 12);
      const leg = new THREE.Mesh(legGeo, suitMat);
      leg.position.set(lx, 0.48, 0);
      this.detectiveGroup.add(leg);

      const shoeGeo = new THREE.BoxGeometry(0.18, 0.12, 0.38);
      const shoe = new THREE.Mesh(shoeGeo, leatherMat);
      shoe.position.set(lx, 0.06, -0.06);
      this.detectiveGroup.add(shoe);
    });

    // 2. Торс и плечи детектива
    const torsoGeo = new THREE.BoxGeometry(0.72, 0.85, 0.38);
    const torso = new THREE.Mesh(torsoGeo, coatMat);
    torso.position.set(0, 1.35, 0);
    this.detectiveGroup.add(torso);

    // Поднятый от штормового ветра воротник плаща
    const collarGeo = new THREE.BoxGeometry(0.65, 0.28, 0.42);
    const collar = new THREE.Mesh(collarGeo, coatMat);
    collar.position.set(0, 1.78, 0);
    this.detectiveGroup.add(collar);

    // Рукава и руки в карманах плаща
    [-0.44, 0.44].forEach((ax) => {
      const armGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.75, 12);
      const arm = new THREE.Mesh(armGeo, coatMat);
      arm.position.set(ax, 1.25, 0.02);
      arm.rotation.x = -0.15;
      arm.rotation.z = ax > 0 ? -0.12 : 0.12;
      this.detectiveGroup.add(arm);
    });

    // 3. Классическая шляпа Федора (Fedora Hat)
    const hatGroup = new THREE.Group();
    hatGroup.position.set(0, 1.95, 0);
    hatGroup.rotation.x = -0.12; // Шляпа надвинута на лоб против ветра

    // Поля шляпы
    const brimGeo = new THREE.CylinderGeometry(0.48, 0.52, 0.035, 24);
    const brim = new THREE.Mesh(brimGeo, coatMat);
    hatGroup.add(brim);

    // Тулья шляпы с характерной ложбинкой
    const crownGeo = new THREE.CylinderGeometry(0.26, 0.32, 0.32, 20);
    const crown = new THREE.Mesh(crownGeo, coatMat);
    crown.position.y = 0.17;
    hatGroup.add(crown);

    this.detectiveGroup.add(hatGroup);

    // 4. Тлеющий огонек сигареты детектива
    this.cigaretteLight = new THREE.PointLight(0xef4444, 1.5, 1.8);
    this.cigaretteLight.position.set(0.08, 1.72, -0.22);
    this.detectiveGroup.add(this.cigaretteLight);

    const emberGeo = new THREE.SphereGeometry(0.015, 6, 6);
    const emberMat = new THREE.MeshBasicMaterial({ color: 0xff3b30 });
    const ember = new THREE.Mesh(emberGeo, emberMat);
    ember.position.copy(this.cigaretteLight.position);
    this.detectiveGroup.add(ember);

    // 5. Развевающиеся полы плаща (Параметрическая физическая сетка ткани)
    this.coatTailsGeo = new THREE.PlaneGeometry(0.85, 0.95, 16, 16);
    this.coatTailsGeo.translate(0, -0.475, 0); // Ось качания на талии

    this.coatTailsMat = new THREE.MeshStandardMaterial({
      color: 0x05070c,
      roughness: 0.5,
      metalness: 0.3,
      side: THREE.DoubleSide
    });

    this.coatTailsMesh = new THREE.Mesh(this.coatTailsGeo, this.coatTailsMat);
    this.coatTailsMesh.position.set(0, 1.05, 0.18);
    this.detectiveGroup.add(this.coatTailsMesh);

    this.baseCoatVertices = this.coatTailsGeo.attributes.position.clone();

    this.group.add(this.detectiveGroup);
  }

  // =========================================================================
  // 3. ПАНОРАМА НОЧНОЙ ИОКОГАМЫ (СИЛУЭТЫ МИНАТО МИРАЙ)
  // =========================================================================
  initYokohamaSkyline() {
    this.skylineGroup = new THREE.Group();
    this.skylineGroup.position.set(0, 0, -110);

    const bldgMat = new THREE.MeshStandardMaterial({ color: 0x04070e, roughness: 0.8, metalness: 0.4 });

    // Отель-парус Yokohama Grand InterContinental
    const sailGeo = new THREE.CylinderGeometry(0.5, 14, 46, 16, 1, false, 0, Math.PI);
    sailGeo.rotateY(-Math.PI / 2);
    const sailHotel = new THREE.Mesh(sailGeo, bldgMat);
    sailHotel.position.set(-52, 23, 0);
    this.skylineGroup.add(sailHotel);

    // Зеленый маяк на шпиле отеля
    const sailBeacon = new THREE.PointLight(0x10b981, 3.5, 45);
    sailBeacon.position.set(-52, 47, 0);
    this.skylineGroup.add(sailBeacon);

    // Исторические склады Акарэнга Соко (Красный портовый кирпич)
    const warehouseGeo = new THREE.BoxGeometry(34, 9, 14);
    const warehouseMat = new THREE.MeshStandardMaterial({ color: 0x140a08, roughness: 0.7 });
    const warehouse = new THREE.Mesh(warehouseGeo, warehouseMat);
    warehouse.position.set(45, 4.5, 15);
    this.skylineGroup.add(warehouse);

    // Теплые огни галерей склада
    const whLight = new THREE.PointLight(0xf59e0b, 2.8, 35);
    whLight.position.set(45, 5.0, 23);
    this.skylineGroup.add(whLight);

    this.group.add(this.skylineGroup);
  }

  // =========================================================================
  // 4. КОЛЕСО ОБОЗРЕНИЯ COSMO CLOCK 21 (СВЕТОВОЕ ШОУ И ЦИФРОВОЙ ЦЕНТР)
  // =========================================================================
  initCosmoClock21() {
    this.cosmoGroup = new THREE.Group();
    // Расположение колеса на противоположном берегу залива
    this.cosmoGroup.position.set(16, 28, -95);

    const radius = 24.0;
    this.spokeCount = 48;
    this.spokeLines = [];

    // Наружный несущий обод колеса
    const rimGeo = new THREE.RingGeometry(radius - 0.25, radius + 0.25, 64);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    this.cosmoGroup.add(rimMesh);

    // 48 спиц со светодиодными гирляндами
    const spokeMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 });
    for (let i = 0; i < this.spokeCount; i++) {
      const ang = (i * Math.PI * 2) / this.spokeCount;
      const pts = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(ang) * radius, Math.sin(ang) * radius, 0)
      ];
      const sGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const sLine = new THREE.Line(sGeo, spokeMat);
      this.cosmoGroup.add(sLine);
      this.spokeLines.push(sLine);

      // Гондолы на ободе
      const cabGeo = new THREE.BoxGeometry(0.9, 0.7, 0.7);
      const cabMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xef4444 : 0x38bdf8 });
      const cab = new THREE.Mesh(cabGeo, cabMat);
      cab.position.set(Math.cos(ang) * radius, Math.sin(ang) * radius, 0);
      this.cosmoGroup.add(cab);
    }

    // Цифровые часы в центре колеса Cosmo Clock 21 ("03:00")
    const clockCanvas = document.createElement('canvas');
    clockCanvas.width = 256;
    clockCanvas.height = 256;
    const cctx = clockCanvas.getContext('2d');
    cctx.fillStyle = '#020617';
    cctx.beginPath();
    cctx.arc(128, 128, 120, 0, Math.PI * 2);
    cctx.fill();
    cctx.strokeStyle = '#ef4444';
    cctx.lineWidth = 8;
    cctx.stroke();

    cctx.fillStyle = '#22d3ee';
    cctx.font = '900 68px monospace';
    cctx.textAlign = 'center';
    cctx.fillText('03:00', 128, 150);

    const clockTex = new THREE.CanvasTexture(clockCanvas);
    const clockGeo = new THREE.CircleGeometry(4.2, 32);
    const clockMat = new THREE.MeshBasicMaterial({ map: clockTex });
    const clockMesh = new THREE.Mesh(clockGeo, clockMat);
    this.cosmoGroup.add(clockMesh);

    // Мощный фоновый неоновый свет от колеса
    this.cosmoGlow = new THREE.PointLight(0x06b6d4, 6.0, 75);
    this.cosmoGlow.position.set(0, 0, 5);
    this.cosmoGroup.add(this.cosmoGlow);

    this.group.add(this.cosmoGroup);
  }

  // =========================================================================
  // 5. ВЕТВЯЩАЯСЯ 3D-МОЛНИЯ (ФРАКТАЛЬНЫЙ РАЗРЯД В ПРОСТРАНСТВЕ)
  // =========================================================================
  initBranchingLightning() {
    this.lightningGroup = new THREE.Group();

    this.lightningMat = new THREE.LineBasicMaterial({
      color: 0xf0fdf4, // Ослепительно белый с бирюзовым оттенком
      linewidth: 4,
      transparent: true,
      opacity: 0.0
    });

    this.lightningGeo = new THREE.BufferGeometry();
    this.lightningMesh = new THREE.LineSegments(this.lightningGeo, this.lightningMat);
    this.lightningGroup.add(this.lightningMesh);

    // Мощная вспышка, заливающая пирс при ударе молнии
    this.flashLight = new THREE.PointLight(0xe0f2fe, 0.0, 250);
    this.flashLight.position.set(0, 45, -40);
    this.lightningGroup.add(this.flashLight);

    this.group.add(this.lightningGroup);
  }

  // Генерация фрактальной ветвящейся молнии в 3D
  generateLightning(frame) {
    const coords = [];
    const rootStart = new THREE.Vector3(
      (Math.sin(frame * 12.3) - 0.5) * 60,
      85,
      -80 + Math.cos(frame * 4.5) * 30
    );
    const rootEnd = new THREE.Vector3(
      rootStart.x + (Math.sin(frame) - 0.5) * 35,
      2.0,
      rootStart.z + 20
    );

    const buildBranch = (p1, p2, depth, disp) => {
      if (depth <= 0) {
        coords.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
        return;
      }
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      // Смещение срединной точки разряда
      mid.x += (Math.random() - 0.5) * disp;
      mid.y += (Math.random() - 0.5) * (disp * 0.35);
      mid.z += (Math.random() - 0.5) * disp;

      buildBranch(p1, mid, depth - 1, disp * 0.55);
      buildBranch(mid, p2, depth - 1, disp * 0.55);

      // Вспомогательная боковая ветвь (Fork)
      if (depth === 2 && Math.random() > 0.4) {
        const forkEnd = mid.clone().add(new THREE.Vector3(
          (Math.random() - 0.5) * disp * 2.0,
          -disp * 1.5,
          (Math.random() - 0.5) * disp * 1.5
        ));
        buildBranch(mid, forkEnd, depth - 1, disp * 0.45);
      }
    };

    buildBranch(rootStart, rootEnd, 4, 18.0);

    this.lightningGeo.setAttribute('position', new THREE.Float32BufferAttribute(coords, 3));
    this.lightningGeo.computeVertexNormals();
  }

  // =========================================================================
  // 6. ФИНАЛЬНЫЙ МОНУМЕНТАЛЬНЫЙ 3D-ТИТР (ХУК ДЛЯ X / TWITTER)
  // =========================================================================
  initCinematicTitleOverlay() {
    this.titleGroup = new THREE.Group();
    // Парит в небе за спиной детектива
    this.titleGroup.position.set(0, 11.5, -35);

    const titleCanvas = document.createElement('canvas');
    titleCanvas.width = 2048;
    titleCanvas.height = 1024;
    const tctx = titleCanvas.getContext('2d');

    tctx.clearRect(0, 0, 2048, 1024);

    // Главная надпись Кандзи
    tctx.textAlign = 'center';
    tctx.fillStyle = '#ffffff';
    tctx.font = '900 130px "Noto Serif JP", serif';
    tctx.shadowColor = '#000000';
    tctx.shadowBlur = 32;
    tctx.fillText('横　浜　潜　入　捜　査　録', 1024, 380);

    // Русский монументальный титр
    tctx.fillStyle = '#f87171';
    tctx.font = '900 84px "Courier New", monospace';
    tctx.shadowColor = '#dc2626';
    tctx.shadowBlur = 24;
    tctx.fillText('И О К О Г А М А', 1024, 520);

    // Подзаголовок
    tctx.fillStyle = '#e2e8f0';
    tctx.font = 'bold 44px "Courier New", monospace';
    tctx.shadowColor = '#000000';
    tctx.shadowBlur = 16;
    tctx.fillText('ГОРОД, ГДЕ СЕКРЕТЫ ТОНУТ В ЗАЛИВЕ', 1024, 610);

    tctx.fillStyle = '#38bdf8';
    tctx.font = 'bold 36px monospace';
    tctx.fillText('ДЕЛО № 09: КТО ПРЕДАЛ СЛЕДОВАТЕЛЯ ИСИКАВУ?', 1024, 680);

    const titleTex = new THREE.CanvasTexture(titleCanvas);
    const titleGeo = new THREE.PlaneGeometry(32, 16);
    this.titleMat = new THREE.MeshBasicMaterial({
      map: titleTex,
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });

    const titleMesh = new THREE.Mesh(titleGeo, this.titleMat);
    this.titleGroup.add(titleMesh);

    this.group.add(this.titleGroup);
  }

  // =========================================================================
  // ЦИКЛ АНИМАЦИИ КАДРА (ВЫЗЫВАЕТСЯ ДИРЕКТОРОМ)
  // =========================================================================
  update(frame) {
    const time = frame * 0.016;

    // 1. Физическая симуляция ткани: полы плаща детектива рвет штормовой ветер
    const pos = this.coatTailsGeo.attributes.position;
    const base = this.baseCoatVertices;
    const count = pos.count;
    const windForce = 0.42;

    for (let i = 0; i < count; i++) {
      const y = base.getY(i);
      const weight = Math.abs(y) / 0.95; // Чем ближе к подолу, тем сильнее взмах
      const flutter = Math.sin(time * 24.0 + i) * windForce * weight;
      const gust = Math.cos(time * 14.0 + i * 2.0) * (windForce * 0.6) * weight;

      pos.setZ(i, base.getZ(i) - (weight * 0.45) - Math.abs(flutter));
      pos.setX(i, base.getX(i) + gust);
    }
    pos.needsUpdate = true;
    this.coatTailsGeo.computeVertexNormals();

    // 2. Дрожание уголька сигареты на ветру
    this.cigaretteLight.intensity = 1.2 + Math.sin(time * 16.0) * 0.6;

    // 3. Медленное вращение колеса Cosmo Clock 21 и световое шоу
    this.cosmoGroup.rotation.z = time * 0.04;
    const spokePhase = Math.floor(frame / 6) % this.spokeCount;
    this.spokeLines.forEach((spoke, idx) => {
      spoke.material.opacity = (idx === spokePhase || idx === (spokePhase + 24) % this.spokeCount) ? 1.0 : 0.4;
    });

    // 4. Вспышки ветвящихся 3D-молний
    const isLightning = (
      (frame >= 80 && frame <= 88) ||
      (frame >= 170 && frame <= 182) ||
      (frame >= 280 && frame <= 290)
    );

    if (isLightning) {
      if (frame % 3 === 0) {
        this.generateLightning(frame);
      }
      this.lightningMat.opacity = 1.0;
      this.flashLight.intensity = 140.0;
    } else {
      this.lightningMat.opacity = 0.0;
      this.flashLight.intensity = 0.0;
    }

    // 5. Плавное проявление финального титра (кадры 180 - 360)
    if (frame > 180) {
      const fadeProgress = (frame - 180) / 70;
      this.titleMat.opacity = THREE.MathUtils.clamp(fadeProgress, 0.0, 1.0);
      // Медленный масштабный наезд титра на зрителя
      const s = 1.0 + (frame - 180) * 0.0006;
      this.titleGroup.scale.set(s, s, s);
    }
  }
}
