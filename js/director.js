import * as THREE from 'three';

/**
 * ПЛАВНЫЕ МАТЕМАТИЧЕСКИЕ ИНТЕРПОЛЯЦИИ ДЛЯ КИНОКАМЕРЫ
 */
function smootherstep(min, max, value) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

export class NoirDirector {
  constructor(camera) {
    this.camera = camera;
    this.totalFrames = 1800; // 30 секунд при 60 FPS

    // DOM-элементы интерфейса (HUD)
    this.domAis = document.getElementById('hud-ais');
    this.domTimestamp = document.getElementById('hud-timestamp');
    this.domTitle = document.getElementById('hud-title');
    this.domTranscript = document.getElementById('hud-transcript');

    // Слоты под сцены
    this.scenes = {
      scene1: null,
      scene2: null,
      scene3: null,
      scene4: null,
      scene5: null
    };

    // Точки прицеливания камеры
    this.lookTarget = new THREE.Vector3(0, 1.5, 0);

    // Сценарный таймлайн фильма
    this.timeline = [
      {
        start: 0,
        end: 280,
        city: 'LOS ANGELES // SUNSET BLVD',
        time: '19:42 PDT // ЗОЛОТОЙ ЧАС',
        title: 'УЛИЧНЫЙ СОУЛ // ГОЛОС КАЛИФОРНИИ',
        text: '«Петь на бульваре — значит перекрикивать шум автострад и гул океанского ветра...»'
      },
      {
        start: 280,
        end: 560,
        city: 'LOS ANGELES // ACOUSTIC VIBE',
        time: '19:48 PDT // САНСЕТ-СТРИП',
        title: 'АКУСТИКА АСФАЛЬТА // SHURE 55SH',
        text: 'Теплый калифорнийский смог ловит последние лучи солнца на хромированной решетке микрофона.'
      },
      {
        start: 560,
        end: 840,
        city: 'LOS ANGELES // DOWNTOWN RIM',
        time: '19:54 PDT // СУМЕРКИ ДАУНТАУНА',
        title: 'ФИНАЛЬНЫЙ АККОРД // БРОНЗОВЫЙ ЗАКАТ',
        text: 'Солнце тонет за силуэтами пальм. Город зажигает первые уличные фонари.'
      },
      {
        start: 840,
        end: 900,
        city: 'TRANSIT // COAST TO COAST',
        time: '23:59 EST // ПЕРЕСЕКАЯ КОНТИНЕНТ',
        title: 'СМЕНА РИТМА // ОТ СОУЛА К ДЖАЗУ',
        text: 'От тихоокеанской акустики — к электрическому неону Атлантического побережья.'
      },
      {
        start: 900,
        end: 1200,
        city: 'MIAMI // OCEAN DRIVE',
        time: '01:15 EDT // ТРОПИЧЕСКАЯ ПОЛНОЧЬ',
        title: 'НОЧНОЙ НЕОН // ВСТУПЛЕНИЕ САКСОФОНА',
        text: 'Влажный океанский воздух, запах соли и контрабасовый грув на открытой террасе клуба.'
      },
      {
        start: 1200,
        end: 1500,
        city: 'MIAMI // ART DECO TERRACE',
        time: '01:24 EDT // СИНЕСТЕЗИЯ ДЖАЗА',
        title: 'ТЕНОР-САКСОФОН // СОЛО В МАДЖЕНТЕ',
        text: 'Блики латуни ловят пурпурные и бирюзовые неоновые вывески отеля «Колони». Горячая импровизация.'
      },
      {
        start: 1500,
        end: 1800,
        city: 'MIAMI // ATLANTIC HORIZON',
        time: '01:30 EDT // КУЛЬМИНАЦИЯ',
        title: 'ФИНАЛЬНОЕ СВЕДЕНИЕ // ДВА ПОБЕРЕЖЬЯ',
        text: 'Два города, два ритма, одна ночь: закатный голос Запада и полуночный саксофон Востока.'
      }
    ];
  }

  registerScene(name, sceneInstance) {
    this.scenes[name] = sceneInstance;
  }

  // =========================================================================
  // ОСНОВНОЙ РЕЖИССЕРСКИЙ ЦИКЛ ОБНОВЛЕНИЯ КАДРА
  // =========================================================================
  update(frame) {
    this.updateHUD(frame);

    // Распределение планов по таймлайну (30 сек = 1800 кадров)
    if (frame < 280) {
      this.directAct1_LASunsetEstablish(frame);
    } else if (frame < 560) {
      this.directAct2_LASteadicamOrbit(frame - 280);
    } else if (frame < 840) {
      this.directAct3_LADowntownWide(frame - 560);
    } else if (frame < 900) {
      this.directInterlude_Transition(frame - 840);
    } else if (frame < 1200) {
      this.directAct4_MiamiGlide(frame - 900);
    } else if (frame < 1500) {
      this.directAct5_MiamiJazz360(frame - 1200);
    } else {
      this.directAct6_GrandFinale(frame - 1500);
    }
  }

  // =========================================================================
  // МИКРО-ДВИЖЕНИЕ ЖИВОЙ КАМЕРЫ (STEADICAM BREATHING)
  // =========================================================================
  applyCameraDrift(frame, amp = 0.035) {
    const t = frame * 0.025;
    this.camera.position.x += Math.sin(t * 1.1) * Math.cos(t * 0.6) * amp;
    this.camera.position.y += Math.cos(t * 0.9) * Math.sin(t * 1.2) * (amp * 0.6);
    this.camera.position.z += Math.sin(t * 0.7) * (amp * 0.4);
  }

  // =========================================================================
  // АКТ 1: ЛОС-АНДЖЕЛЕС — СКОЛЬЖЕНИЕ КРАНА ВДОЛЬ ЗАКАТНОГО БУЛЬВАРА
  // =========================================================================
  directAct1_LASunsetEstablish(f) {
    const t = smootherstep(0, 280, f);
    this.camera.fov = THREE.MathUtils.lerp(34, 40, t);
    this.camera.updateProjectionMatrix();

    // Камера плавно скользит вперед, поднимаясь от асфальта навстречу силуэту певицы
    const camX = THREE.MathUtils.lerp(-4.5, -0.6, t);
    const camY = THREE.MathUtils.lerp(0.45, 1.45, t);
    const camZ = THREE.MathUtils.lerp(18.0, 4.8, t);

    this.camera.position.set(camX, camY, camZ);
    this.applyCameraDrift(f, 0.025);

    this.lookTarget.set(0, 1.4, 0);
    this.camera.lookAt(this.lookTarget);

    if (this.scenes.scene1) this.scenes.scene1.update(f);
  }

  // =========================================================================
  // АКТ 2: ЛОС-АНДЖЕЛЕС — ИНТИМНЫЙ ОБЛЕТ ПЕВИЦЫ И МИКРОФОНА В ЗОЛОТОМ ЧАСУ
  // =========================================================================
  directAct2_LASteadicamOrbit(f) {
    const t = smootherstep(0, 280, f);
    this.camera.fov = 48; // Портретный кинообъектив
    this.camera.updateProjectionMatrix();

    // Эллиптический стедикам-облет сбоку на контровой закатный ракурс
    const angle = THREE.MathUtils.lerp(-0.7, 0.85, t);
    const radius = THREE.MathUtils.lerp(3.8, 2.6, t);

    const camX = Math.sin(angle) * radius;
    const camZ = Math.cos(angle) * radius;
    const camY = 1.35 + Math.sin(t * Math.PI) * 0.25;

    this.camera.position.set(camX, camY, camZ);
    this.applyCameraDrift(f, 0.03);

    this.lookTarget.set(0, 1.38, 0);
    this.camera.lookAt(this.lookTarget);

    if (this.scenes.scene2) this.scenes.scene2.update(f + 280);
  }

  // =========================================================================
  // АКТ 3: ЛОС-АНДЖЕЛЕС — ШИРОКИЙ НИЖНИЙ ПЛАН (СИЛУЭТ НА ФОНЕ ПАЛЬМ И ЗАКАТА)
  // =========================================================================
  directAct3_LADowntownWide(f) {
    const t = smootherstep(0, 280, f);
    this.camera.fov = THREE.MathUtils.lerp(46, 36, t);
    this.camera.updateProjectionMatrix();

    // Медленный драматичный отъезд камеры назад с легким голландским углом (Dutch tilt)
    const camX = Math.sin(t * 1.5) * 0.4;
    const camY = THREE.MathUtils.lerp(0.85, 0.55, t); // Очень низкая точка съемки
    const camZ = THREE.MathUtils.lerp(2.8, 7.2, t);

    this.camera.position.set(camX, camY, camZ);
    this.applyCameraDrift(f, 0.02);

    this.lookTarget.set(0, 1.5, -2.0);
    this.camera.lookAt(this.lookTarget);

    if (this.scenes.scene3) this.scenes.scene3.update(f + 560);
  }

  // =========================================================================
  // ПЕРЕХОД: ЭКСПРЕСС-ПАН ДЕКОРАЦИЙ (WHIP PAN ИЗ LA В MIAMI)
  // =========================================================================
  directInterlude_Transition(f) {
    const t = f / 60; // 1 секунда
    this.camera.fov = THREE.MathUtils.lerp(36, 45, t);
    this.camera.updateProjectionMatrix();

    // Быстрый киношный поворот камеры (Whip-pan)
    const panX = THREE.MathUtils.lerp(0, 15.0, t);
    const panY = THREE.MathUtils.lerp(0.55, 3.2, t);
    const panZ = THREE.MathUtils.lerp(7.2, 16.0, t);

    this.camera.position.set(panX, panY, panZ);
    this.camera.lookAt(panX * 2, 1.5, 0);

    if (this.scenes.scene3) this.scenes.scene3.update(840);
  }

  // =========================================================================
  // АКТ 4: МАЙАМИ — СКОЛЬЖЕНИЕ ВДОЛЬ ТЕРРАСЫ (САКСОФОН И НЕОНОВЫЕ ЛУЖИ)
  // =========================================================================
  directAct4_MiamiGlide(f) {
    const t = smootherstep(0, 300, f);
    this.camera.fov = 38;
    this.camera.updateProjectionMatrix();

    // Низкий трекинг вдоль настила террасы навстречу неоновым бликам саксофона
    const camX = THREE.MathUtils.lerp(8.5, 1.2, t);
    const camY = THREE.MathUtils.lerp(0.4, 1.3, t);
    const camZ = THREE.MathUtils.lerp(14.0, 4.2, t);

    this.camera.position.set(camX, camY, camZ);
    this.applyCameraDrift(f, 0.035);

    this.lookTarget.set(0, 1.35, 0);
    this.camera.lookAt(this.lookTarget);

    if (this.scenes.scene4) this.scenes.scene4.update(f + 900);
  }

  // =========================================================================
  // АКТ 5: МАЙАМИ — ДИНАМИЧЕСКИЙ 360-ГРАДУСНЫЙ ОБЛЕТ ДЖАЗ-БЭНДА
  // =========================================================================
  directAct5_MiamiJazz360(f) {
    const t = f / 300;
    this.camera.fov = 42;
    this.camera.updateProjectionMatrix();

    // Плавный круговой вираж вокруг музыкантов на 360 градусов
    const angle = t * Math.PI * 2 * 0.85;
    const radius = 3.6 + Math.sin(t * Math.PI * 2) * 0.4;

    const camX = Math.sin(angle) * radius;
    const camZ = Math.cos(angle) * radius;
    const camY = 1.45 + Math.sin(t * Math.PI * 4) * 0.35;

    this.camera.position.set(camX, camY, camZ);
    this.applyCameraDrift(f, 0.04);

    this.lookTarget.set(0, 1.3, 0);
    this.camera.lookAt(this.lookTarget);

    if (this.scenes.scene5) this.scenes.scene5.update(f + 1200);
  }

  // =========================================================================
  // АКТ 6: КУЛЬМИНАЦИЯ — КРАНОВЫЙ ВЗЛЕТ НАД ОКЕАНОМ И НОЧНЫМ МАЙАМИ
  // =========================================================================
  directAct6_GrandFinale(f) {
    const t = smootherstep(0, 300, f);
    this.camera.fov = THREE.MathUtils.lerp(42, 34, t);
    this.camera.updateProjectionMatrix();

    // Кран плавно поднимается на высоту 7 метров и отъезжает назад над Атлантикой
    const camX = Math.sin(t * Math.PI) * 1.5;
    const camY = THREE.MathUtils.lerp(1.45, 6.8, t);
    const camZ = THREE.MathUtils.lerp(4.0, 16.5, t);

    this.camera.position.set(camX, camY, camZ);
    this.applyCameraDrift(f, 0.02);

    this.lookTarget.set(0, 1.2, -6.0);
    this.camera.lookAt(this.lookTarget);

    if (this.scenes.scene5) this.scenes.scene5.update(f + 1500);
  }

  // =========================================================================
  // ДВУЯЗЫЧНЫЙ ТИТРОВОЙ ИНТЕРФЕЙС (HUD)
  // =========================================================================
  updateHUD(frame) {
    for (let i = 0; i < this.timeline.length; i++) {
      const item = this.timeline[i];
      if (frame >= item.start && frame < item.end) {
        if (this.domAis && this.domAis.textContent !== item.city) {
          this.domAis.textContent = item.city;
        }
        if (this.domTimestamp && this.domTimestamp.textContent !== item.time) {
          this.domTimestamp.textContent = item.time;
        }
        if (this.domTitle && this.domTitle.textContent !== item.title) {
          this.domTitle.textContent = item.title;
        }
        if (this.domTranscript) {
          // Эффект плавного проявления кино-титров
          const localF = frame - item.start;
          const charsToShow = Math.floor(localF * 1.8);
          this.domTranscript.textContent = item.text.substring(0, charsToShow);
        }
        break;
      }
    }
  }

  // =========================================================================
  // РИТМИЧЕСКИЕ СВЕТОВЫЕ АКЦЕНТЫ (ВМЕСТО СТАРОЙ МОЛНИИ)
  // Синхронизировано под ключевые доли бита и джазовые акценты
  // =========================================================================
  isLightningFrame(frame) {
    return (
      (frame >= 240 && frame <= 245) ||  // Кульминация куплета LA
      (frame >= 520 && frame <= 526) ||  // Закатный луч
      (frame >= 890 && frame <= 898) ||  // Световой переход континента
      (frame >= 1180 && frame <= 1186) || // Вступление соло саксофона в Майами
      (frame >= 1440 && frame <= 1448) || // Акцент контрабаса
      (frame >= 1710 && frame <= 1720)   // Финальный сценический аккорд
    );
  }
  } 
