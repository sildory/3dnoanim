import * as THREE from 'three';

export class NoirDirector {
  constructor(camera) {
    this.camera = camera;
    this.totalFrames = 1800; // 30 секунд при 60 FPS

    this.domAis = document.getElementById('hud-ais');
    this.domTimestamp = document.getElementById('hud-timestamp');
    this.domTitle = document.getElementById('hud-title');
    this.domTranscript = document.getElementById('hud-transcript');

    // Слоты под 5 сцен
    this.scenes = {
      scene1: null,
      scene2: null,
      scene3: null,
      scene4: null,
      scene5: null
    };

    // Сценарий двуязычных протоколов расследования
    this.dossierTimeline = [
      {
        start: 0,
        end: 180,
        ais: 'СИГНАЛ AIS: ПОТЕРЯН [AIS 信号途絶]',
        time: '02:47:19 JST // ЗАЛИВ ДАЙКОКУ',
        title: '事件概要 // ДЕЛО № 09: ПОИСКОВАЯ ОПЕРАЦИЯ',
        text: 'Сухогруз «Акацуки» обесточен в акватории Иокогамы. Попытка выхода на связь без ответа.'
      },
      {
        start: 180,
        end: 360,
        ais: 'СОНАР: ОБЪЕКТ НА ДНЕ [ソナー異常感知]',
        time: '02:49:05 JST // СЕКТОР ДАЙКОКУ-БУЙ',
        title: '水中探知 // АНОМАЛИЯ НА ГЛУБИНЕ 14 МЕТРОВ',
        text: 'Сонар береговой охраны засек затопленный седан синдиката. Габаритные огни замкнуты.'
      },
      {
        start: 360,
        end: 540,
        ais: 'ОГРАЖДЕНИЕ: ПИРС-4 [規制線展開]',
        time: '02:51:30 JST // ТЕРМИНАЛ ХОНМОКУ',
        title: '現場鑑識 // КРИМИНАЛИСТИЧЕСКИЙ ОСМОТР ПИРСА-4',
        text: 'На кромке мокрого настила обнаружена стреляная гильза 9x19мм и смываемый след крови.'
      },
      {
        start: 540,
        end: 720,
        ais: 'БАЛЛИСТИКА: СОВПАДЕНИЕ [鑑識一致]',
        time: '02:53:14 JST // ПИРС ХОНМОКУ B-7',
        title: '遺留品照合 // СОВПАДЕНИЕ С ТАБЕЛЬНЫМ ОРУЖИЕМ',
        text: 'Нарезка ствола с вероятностью 99.8% указывает на револьвер полицейского департамента.'
      },
      {
        start: 720,
        end: 900,
        ais: 'ПЕРЕХВАТ РАДИО [無線傍受成功]',
        time: '02:55:00 JST // КАННАЙ / ЧАЙНАТАУН',
        title: '通信傍受 // ПЕРЕХВАТ СИНДИКАТА «ИНАГАВА-КАЙ»',
        text: '«Инспектор Исикава вышел на контейнерный след. Приказ руководства: ликвидировать.»'
      },
      {
        start: 900,
        end: 1080,
        ais: 'ЦЕЛЬ ОБНАРУЖЕНА [車両確認]',
        time: '02:56:45 JST // ПЕРЕУЛОК ИСЕДЗАКИ',
        title: '追跡緊急配備 // СЕДАН ДЕТЕКТИВА ПОД НАБЛЮДЕНИЕМ',
        text: 'Автомобиль инспектора заблокирован в неоновом квартале. Дворники включены, салон пуст.'
      },
      {
        start: 1080,
        end: 1260,
        ais: 'ГОЛОГРАММА УЛИК [立体弾道解析]',
        time: '02:58:10 JST // ТАКТИЧЕСКИЙ ОТДЕЛ',
        title: '弾道再構成 // 3D-РЕКОНСТРУКЦИЯ СЕКТОРА СТРЕЛЬБЫ',
        text: 'Вектор выстрела: 34.2 градуса сверху вниз. Выстрел произведен в упор со спины.'
      },
      {
        start: 1260,
        end: 1440,
        ais: 'СГОВОР ВЕРХОВ [警察上層部関与]',
        time: '02:59:40 JST // АРХИВ ОСОБОГО ОТДЕЛА',
        title: '極秘報告書 // ПОДТВЕРЖДЕНИЕ ПРЕДАТЕЛЬСТВА',
        text: 'Приказ об отключении портовых камер исходил непосредственно из кабинета замначальника.'
      },
      {
        start: 1440,
        end: 1650,
        ais: 'ШТОРМ: КУЛЬМИНАЦИЯ [大桟橋到達]',
        time: '03:00:12 JST // ПИРС ОСАНБАСИ',
        title: '最終対峙 // РАЗВЯЗКА НА КРАЮ МОЛА',
        text: 'Иокогама тонет в грозовом шквале. Инспектор Исикава ждет связного у кромки залива.'
      },
      {
        start: 1650,
        end: 1800,
        ais: 'ДЕЛО ЗАКРЫТО [事件封印]',
        time: '03:01:00 JST // ТОКИЙСКИЙ ЗАЛИВ',
        title: '事件記録結了 // ГОРОД, ГДЕ ПРАВДА ТОНЕТ В ДОЖДЕ',
        text: '«В этом городе даже штормовой ливень не смоет следы предательства.»'
      }
    ];
  }

  registerScene(name, sceneInstance) {
    this.scenes[name] = sceneInstance;
  }

  // Обновление состояния режиссуры и положения камеры
  update(frame) {
    this.updateHUD(frame);

    // Определение текущего акта (по 360 кадров = 6 секунд на сцену)
    if (frame < 360) {
      this.directAct1(frame);
    } else if (frame < 720) {
      this.directAct2(frame - 360);
    } else if (frame < 1080) {
      this.directAct3(frame - 720);
    } else if (frame < 1440) {
      this.directAct4(frame - 1080);
    } else {
      this.directAct5(frame - 1440);
    }
  }

  // Акт 1: Бреющий полет над темной водой залива к мосту
  directAct1(f) {
    const t = f / 360;
    const camY = THREE.MathUtils.lerp(1.8, 4.2, t);
    const camZ = THREE.MathUtils.lerp(35, -15, t);
    const camX = Math.sin(f * 0.015) * 2.5;

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(camX * 0.5, 3.0, camZ - 40);

    if (this.scenes.scene1) {
      this.scenes.scene1.update(f);
    }
  }

  // Акт 2: Макро-трекинг на уровне 20 см от асфальта мимо гильзы и стробоскопов
  directAct2(f) {
    const t = f / 360;
    const camX = THREE.MathUtils.lerp(-12, 10, t);
    const camY = 0.35 + Math.sin(f * 0.05) * 0.02; // Киношное макро у земли
    const camZ = THREE.MathUtils.lerp(5, -2, t);

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(camX + 3.0, 0.25, camZ - 8);

    if (this.scenes.scene2) {
      this.scenes.scene2.update(f);
    }
  }

  // Акт 3: Головокружительный вертикальный спуск между небоскребами к седану
  directAct3(f) {
    const t = f / 360;
    // Кран спускается с высоты 45 метров до 2.2 метра
    const camY = THREE.MathUtils.lerp(45, 2.2, Math.pow(t, 0.75));
    const camZ = THREE.MathUtils.lerp(-35, 12, t);
    const camX = Math.sin(t * Math.PI) * 4.0;

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(0, 1.2, 0);

    if (this.scenes.scene3) {
      this.scenes.scene3.update(f);
    }
  }

  // Акт 4: Кинематографичный 3D-вираж вокруг баллистической модели пули
  directAct4(f) {
    const angle = (f / 360) * Math.PI * 2 * 0.75;
    const radius = 6.5;
    const camX = Math.sin(angle) * radius;
    const camZ = Math.cos(angle) * radius;
    const camY = 2.0 + Math.sin(f * 0.03) * 0.8;

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(0, 1.4, 0);

    if (this.scenes.scene4) {
      this.scenes.scene4.update(f);
    }
  }

  // Акт 5: Кульминационный наезд из-за спины детектива на пирсе под грозой
  directAct5(f) {
    const t = f / 360;
    const camZ = THREE.MathUtils.lerp(28, 6.5, t);
    const camY = THREE.MathUtils.lerp(4.5, 2.1, t);
    const camX = Math.sin(f * 0.02) * 0.6;

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(0, 1.8, -30);

    if (this.scenes.scene5) {
      this.scenes.scene5.update(f);
    }
  }

  // Обновление двуязычного протокола расследования
  updateHUD(frame) {
    for (let i = 0; i < this.dossierTimeline.length; i++) {
      const item = this.dossierTimeline[i];
      if (frame >= item.start && frame < item.end) {
        if (this.domAis && this.domAis.textContent !== item.ais) {
          this.domAis.textContent = item.ais;
        }
        if (this.domTimestamp && this.domTimestamp.textContent !== item.time) {
          this.domTimestamp.textContent = item.time;
        }
        if (this.domTitle && this.domTitle.textContent !== item.title) {
          this.domTitle.textContent = item.title;
        }
        if (this.domTranscript) {
          // Эффект печатной машинки для текста сводки
          const localF = frame - item.start;
          const charsToShow = Math.floor(localF * 1.6);
          this.domTranscript.textContent = item.text.substring(0, charsToShow);
        }
        break;
      }
    }
  }

  isLightningFrame(frame) {
    // Кадры вспышек молний в Акте 1 и в кульминационном Акте 5
    return (
      (frame >= 75 && frame <= 82)   ||
      (frame >= 210 && frame <= 216) ||
      (frame >= 1480 && frame <= 1488) ||
      (frame >= 1610 && frame <= 1622) ||
      (frame >= 1720 && frame <= 1730)
    );
  }
}
