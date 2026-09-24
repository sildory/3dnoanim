import { NoirMath } from './math.js';

export class YokohamaScenes {
  constructor(engine) {
    this.e = engine;
    this.ctx = engine.ctx;
    this.w = engine.w;
    this.h = engine.h;
  }

  render(frame) {
    const camShakeX = Math.sin(frame * 0.05) * 2.5;
    const camShakeY = Math.cos(frame * 0.04) * 2.0;

    this.ctx.save();
    this.ctx.translate(camShakeX, camShakeY);

    if (frame < 360) {
      this.act1_RadarBiometrics(frame);
    } else if (frame < 720) {
      this.act2_HonmokuDocks(frame - 360);
    } else if (frame < 1080) {
      this.act3_NeonMinatoMirai(frame - 720);
    } else if (frame < 1440) {
      this.act4_ForensicsCorkboard(frame - 1080);
    } else {
      this.act5_ClimaxOsanbashi(frame - 1440);
    }

    this.ctx.restore();

    this.e.drawStormRain(frame);
    this.e.drawLensRefraction(frame);
    this.e.drawCinematicVignette(0.88);
    this.e.drawScanlines(0.065);
    this.e.drawFilmGrain(frame, 0.05);

    if (frame % 360 < 10) {
      this.e.applyChromaticAberration(10);
      this.drawCrtGlitch();
    }
  }

  drawCrtGlitch() {
    const ctx = this.ctx;
    ctx.save();
    for (let i = 0; i < 4; i++) {
      const gy = Math.random() * this.h;
      const gh = 6 + Math.random() * 25;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.28)';
      ctx.fillRect(0, gy, this.w, gh);
    }
    ctx.restore();
  }

  // =========================================================================
  // АКТ 1: РАДАР ТОКИЙСКОГО ЗАЛИВА И БИОМЕТРИЯ (0 - 6 сек)
  // =========================================================================
  act1_RadarBiometrics(f) {
    const ctx = this.ctx;
    ctx.fillStyle = '#04070d';
    ctx.fillRect(0, 0, this.w, this.h);

    // Радар залива
    this.e.drawPhosphorRadar(420, 540, 340, f);

    // Биометрический сканер глаза детектива Исикавы
    this.e.drawRetinalScan(1360, 480, 160, f);

    // Печать управления полиции Канагава
    this.e.drawHankoStamp(1680, 200, '神奈川', '捜査一');

    // Текстовый протокол
    ctx.fillStyle = '#f8fafc';
    ctx.font = '900 24px "Courier New", monospace';
    ctx.fillText('ПОЛИЦЕЙСКОЕ УПРАВЛЕНИЕ ПРЕФЕКТУРЫ КАНАГАВА', 100, 90);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.fillText('СЛУЖБА ПОРТОВОГО НАБЛЮДЕНИЯ // ЗАЛИВ ДАЙКОКУ, ИОКОГАМА', 100, 120);

    this.e.drawTypewriter('ОБЪЕКТ: СУХОГРУЗ "АКАЦУКИ" (ФЛАГ: ПАНАМА)', 860, 240, f * 0.9, 22, '#94a3b8');
    this.e.drawTypewriter('СИГНАЛ AIS ОТКЛЮЧЕН ВРУЧНУЮ // 02:47:19', 860, 275, Math.max(0, f - 45) * 0.9, 22, '#ef4444');
    this.e.drawTypewriter('СУБЪЕКТ: СЛЕДОВАТЕЛЬ КЭНДЗИ ИСИКАВА (ПРОПАЛ В ПОРТУ)', 860, 310, Math.max(0, f - 90) * 0.9, 22, '#38bdf8');
  }

  // =========================================================================
  // АКТ 2: ДОКИ ХОНМОКУ И ТАКТИЧЕСКИЙ ПЕРЕХВАТ (6 - 12 сек)
  // =========================================================================
  act2_HonmokuDocks(f) {
    const ctx = this.ctx;

    ctx.fillStyle = '#030508';
    ctx.fillRect(0, 0, this.w, this.h);

    // Прожектор береговой охраны
    const searchX = 1000 + Math.sin(f * 0.04) * 450;
    this.e.drawVolumetricSearchlight(300, 80, searchX, 850, 25, 480, 'rgba(255, 255, 220, 0.35)');

    // Портальные краны
    this.drawDockCrane(260, 180, 0.9);
    this.drawDockCrane(960, 120, 1.15);
    this.drawDockCrane(1620, 200, 0.85);

    // Контейнерный терминал
    this.drawContainers(f);

    // Мокрая набережная с отражением прожектора
    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 800, this.w, 280);

    const carX = -200 + f * 7.5;
    this.drawSedan(carX, 830);

    // Рамка перехвата
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(carX - 110, 810, 240, 90);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 15px "Courier New"';
    ctx.fillText('ЦЕЛЬ: ЧЕРНЫЙ СЕДАН [СИНДИКАТ]', carX - 110, 800);
    ctx.fillText('ВЕКТОР: СБРОС В ЗАЛИВ', carX - 110, 920);

    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 20px "Courier New"';
    ctx.fillText('КАМЕРА ПИРС-4 // СЕКТОР ХОНМОКУ B-7', 80, 80);
    ctx.fillText(`СКОРОСТЬ: ${(88 + Math.sin(f * 0.1) * 6).toFixed(1)} КМ/Ч`, 80, 115);
  }

  drawDockCrane(x, y, scale) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.strokeStyle = '#0e1726';
    ctx.fillStyle = '#080d16';
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(0, 680);
    ctx.lineTo(90, 0);
    ctx.lineTo(290, 0);
    ctx.lineTo(380, 680);
    ctx.stroke();

    ctx.fillRect(-150, -42, 650, 44);
    ctx.strokeRect(-150, -42, 650, 44);

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(380, -42, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawContainers(f) {
    const ctx = this.ctx;
    const colors = ['#7f1d1d', '#0f172a', '#1e3a5f', '#78350f'];
    for (let c = 0; c < 11; c++) {
      for (let r = 0; r < 4; r++) {
        const cx = c * 185 - 40;
        const cy = 540 + r * 68;
        ctx.fillStyle = colors[(c * 4 + r) % colors.length];
        ctx.fillRect(cx, cy, 175, 64);
        ctx.strokeStyle = '#05070a';
        ctx.lineWidth = 3;
        ctx.strokeRect(cx, cy, 175, 64);
      }
    }
  }

  drawSedan(x, y) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#020408';
    ctx.beginPath();
    ctx.moveTo(-100, 30);
    ctx.lineTo(-70, 0);
    ctx.lineTo(40, 0);
    ctx.lineTo(80, 25);
    ctx.lineTo(110, 30);
    ctx.lineTo(110, 60);
    ctx.lineTo(-100, 60);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.fillRect(105, 35, 8, 12);

    const beam = ctx.createRadialGradient(110, 45, 10, 320, 55, 240);
    beam.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
    beam.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(110, 40);
    ctx.lineTo(350, 0);
    ctx.lineTo(350, 120);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // =========================================================================
  // АКТ 3: НЕОН МИНАТО МИРАЙ И ЧАЙНАТАУН (12 - 18 сек)
  // =========================================================================
  act3_NeonMinatoMirai(f) {
    const ctx = this.ctx;
    ctx.fillStyle = '#020409';
    ctx.fillRect(0, 0, this.w, this.h);

    this.drawLandmarkTower(340, 70);
    this.drawCosmoClock(1380, 420, 280, f);
    this.drawChinatownGate(840, 370);

    // Отражения в лужах с интерференцией волн
    this.drawPuddleReflection(f);

    this.e.drawAnamorphicStreak(520, 0.75, 'rgba(6, 182, 212, ');
    this.e.drawAnamorphicStreak(760, 0.6, 'rgba(239, 68, 68, ');

    ctx.fillStyle = 'rgba(7, 10, 18, 0.92)';
    ctx.fillRect(180, 860, 1560, 140);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.strokeRect(180, 860, 1560, 140);

    ctx.fillStyle = '#ef4444';
    ctx.font = '900 24px "Courier New"';
    ctx.fillText('ПЕРЕХВАТ СИНДИКАТА «ИНАГАВА-КАЙ» // 02:56:40', 220, 905);

    const txt = '«Груз перевезен на пирс Осанбаси. Детектив идет по пятам. Приказ: огонь на поражение.»';
    this.e.drawTypewriter(txt, 220, 955, f * 0.9, 22, '#f8fafc');
  }

  drawLandmarkTower(x, y) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#060a14';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(-110, 760);
    ctx.lineTo(-85, 240);
    ctx.lineTo(-60, 90);
    ctx.lineTo(-25, 0);
    ctx.lineTo(25, 0);
    ctx.lineTo(60, 90);
    ctx.lineTo(85, 240);
    ctx.lineTo(110, 760);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
    for (let r = 80; r < 720; r += 26) {
      ctx.fillRect(-55, r, 110, 6);
    }

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, -6, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawCosmoClock(x, y, r, f) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    const rot = f * 0.005;

    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 32; i++) {
      const ang = rot + (i * Math.PI * 2) / 32;
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(6, 182, 212, 0.5)' : 'rgba(239, 68, 68, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
      ctx.stroke();
    }

    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(0, 0, 54, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#22d3ee';
    ctx.font = '900 24px "Courier New"';
    ctx.fillText('02:59', -35, 8);
    ctx.restore();
  }

  drawChinatownGate(x, y) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#7f1d1d';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(-160, 40);
    ctx.quadraticCurveTo(0, 15, 160, 40);
    ctx.lineTo(130, 70);
    ctx.lineTo(-130, 70);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#991b1b';
    ctx.fillRect(-110, 70, 30, 340);
    ctx.fillRect(80, 70, 30, 340);

    ctx.fillStyle = '#facc15';
    ctx.font = '900 36px "Courier New"';
    ctx.fillText('横浜中華街', -90, 30);
    ctx.restore();
  }

  drawPuddleReflection(f) {
    const ctx = this.ctx;
    ctx.save();
    const g = ctx.createLinearGradient(0, 750, 0, this.h);
    g.addColorStop(0, 'rgba(6, 182, 212, 0.22)');
    g.addColorStop(0.5, 'rgba(239, 68, 68, 0.18)');
    g.addColorStop(1, 'rgba(2, 4, 8, 0.95)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 750, this.w, 330);
    ctx.restore();
  }

  // =========================================================================
  // АКТ 4: ДОСКА УЛИК И БАЛЛИСТИКА В 3D (18 - 24 сек)
  // =========================================================================
  act4_ForensicsCorkboard(f) {
    const ctx = this.ctx;
    ctx.fillStyle = '#14100c';
    ctx.fillRect(0, 0, this.w, this.h);

    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    for (let y = 0; y < this.h; y += 18) {
      ctx.fillRect(0, y, this.w, 4);
    }

    // 3D-чертеж гильзы 9 мм
    this.drawBulletBlueprint(440, 480, f);

    // Схема места преступления
    ctx.fillStyle = '#080d16';
    ctx.fillRect(800, 140, 840, 560);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.strokeRect(800, 140, 840, 560);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 20px "Courier New"';
    ctx.fillText('СУДЕБНАЯ ЭКСПЕРТИЗА // ПРОТОКОЛ ОСМОТРА МЕСТА', 840, 190);

    this.drawTargetMarker(980, 320, 'ГИЛЬЗА НА ПИРСЕ');
    this.drawTargetMarker(1340, 360, 'ТОРМОЗНОЙ СЛЕД');
    this.drawTargetMarker(1160, 520, 'ТОЧКА ПАДЕНИЯ В ЗАЛИВ');

    this.drawRedThread(980, 320, 1340, 360);
    this.drawRedThread(1340, 360, 1160, 520);
    this.drawRedThread(440, 480, 980, 320);

    ctx.fillStyle = 'rgba(8, 14, 26, 0.95)';
    ctx.fillRect(360, 780, 1200, 220);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3;
    ctx.strokeRect(360, 780, 1200, 220);

    ctx.fillStyle = '#eab308';
    ctx.font = '900 24px "Courier New"';
    ctx.fillText('ЗАКЛЮЧЕНИЕ СЛЕДСТВЕННОЙ ГРУППЫ КАНАГАВА:', 400, 830);

    const l1 = 'ВЫСТРЕЛ ПРОИЗВЕДЕН ИЗ ОРУЖИЯ ДЕПАРТАМЕНТА ПОЛИЦИИ.';
    const l2 = 'ВЫВОД: СИНДИКАТ ДЕЙСТВОВАЛ ПРИ ПОДДЕРЖКЕ ВЫСШИХ ЧИНОВ.';
    this.e.drawTypewriter(l1, 400, 880, f * 0.95, 22, '#ffffff');
    this.e.drawTypewriter(l2, 400, 930, Math.max(0, f - 50) * 0.95, 22, '#ef4444');
  }

  drawBulletBlueprint(x, y, f) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    const rot = f * 0.03;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;

    ctx.strokeRect(-40, -120, 80, 240);
    ctx.strokeRect(-32, -140, 64, 20);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 15px "Courier New"';
    ctx.fillText('БАЛЛИСТИКА 9X19MM', -70, -160);
    ctx.fillText('НАРЕЗЫ: СОВПАДЕНИЕ 99.8%', -70, 150);
    ctx.restore();
  }

  drawTargetMarker(x, y, label) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(x - 14, y - 14); ctx.lineTo(x + 14, y + 14);
    ctx.moveTo(x + 14, y - 14); ctx.lineTo(x - 14, y + 14);
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 15px "Courier New"';
    ctx.fillText(label, x + 20, y + 5);
    ctx.restore();
  }

  drawRedThread(x1, y1, x2, y2) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 6;

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2 + 25;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(midX, midY, x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  // =========================================================================
  // АКТ 5: КУЛЬМИНАЦИЯ: ПИРС ОСАНБАСИ И ФИНАЛ (24 - 30 сек)
  // =========================================================================
  act5_ClimaxOsanbashi(f) {
    const ctx = this.ctx;

    const isLightning = (f > 35 && f < 42) || (f > 150 && f < 158) || (f > 240 && f < 246);

    if (isLightning) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, this.w, this.h);
      this.e.applyChromaticAberration(18);

      // Ветвящаяся молния
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      const pts = NoirMath.getLightningBranches(1100, 0, 1340, 520, 140, f);
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        if (i === 0) ctx.moveTo(pts[i].x, pts[i].y);
        else ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();
    } else {
      ctx.fillStyle = '#020306';
      ctx.fillRect(0, 0, this.w, this.h);
    }

    this.drawBayBridge(isLightning);

    // Настил пирса Осанбаси
    ctx.save();
    ctx.fillStyle = isLightning ? '#334155' : '#070a12';
    ctx.beginPath();
    ctx.moveTo(0, 740);
    ctx.bezierCurveTo(450, 680, 1150, 780, this.w, 710);
    ctx.lineTo(this.w, this.h);
    ctx.lineTo(0, this.h);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = isLightning ? '#64748b' : '#0f172a';
    ctx.lineWidth = 2;
    for (let x = -50; x < this.w + 100; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, 720);
      ctx.lineTo(x - 140, this.h);
      ctx.stroke();
    }
    ctx.restore();

    this.drawDetective(960, 660, f, isLightning);

    // Главный вирусный хук для Twitter / X
    if (f > 40) {
      const a = Math.min(1, (f - 40) / 35);
      ctx.save();
      ctx.textAlign = 'center';

      ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
      ctx.font = '900 96px "Courier New", monospace';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 28;
      ctx.fillText('И О К О Г А М А', this.w / 2, 260);

      ctx.fillStyle = `rgba(239, 68, 68, ${a})`;
      ctx.font = '900 32px "Courier New", monospace';
      ctx.fillText('ГОРОД, ГДЕ СЕКРЕТЫ ТОНУТ В ЗАЛИВЕ', this.w / 2, 325);

      ctx.fillStyle = `rgba(226, 232, 240, ${a * 0.9})`;
      ctx.font = 'bold 24px "Courier New", monospace';
      ctx.fillText('ДЕЛО № 09: КТО СДАЛ СЛЕДОВАТЕЛЯ ИСИКАВУ?', this.w / 2, 380);
      ctx.restore();
    }

    if (f > 325) {
      const fade = (f - 325) / 35;
      ctx.fillStyle = `rgba(0, 0, 0, ${fade})`;
      ctx.fillRect(0, 0, this.w, this.h);
    }
  }

  drawBayBridge(isLightning) {
    const ctx = this.ctx;
    ctx.save();
    const by = 520;

    ctx.fillStyle = isLightning ? '#64748b' : '#070b14';
    ctx.strokeStyle = isLightning ? '#94a3b8' : '#0d1524';
    ctx.lineWidth = 4;

    ctx.fillRect(580, by - 260, 26, 260);
    ctx.fillRect(1340, by - 260, 26, 260);
    ctx.fillRect(0, by, this.w, 24);

    ctx.lineWidth = 1.6;
    ctx.strokeStyle = isLightning ? '#cbd5e1' : '#131e33';
    for (let i = -170; i <= 170; i += 22) {
      ctx.beginPath();
      ctx.moveTo(593, by - 240);
      ctx.lineTo(593 + i * 2.6, by);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(1353, by - 240);
      ctx.lineTo(1353 + i * 2.6, by);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawDetective(x, y, f, isLightning) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    const wind = Math.sin(f * 0.18) * 18;
    ctx.fillStyle = isLightning ? '#1e293b' : '#020306';

    ctx.beginPath();
    ctx.moveTo(-25, 45);
    ctx.lineTo(25, 45);
    ctx.lineTo(40 + wind, 190);
    ctx.lineTo(-40 + wind * 0.4, 190);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-35, 45);
    ctx.lineTo(35, 45);
    ctx.lineTo(22, 15);
    ctx.lineTo(-22, 15);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(0, 10, 26, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 2, 16, Math.PI, 0);
    ctx.fill();

    ctx.lineWidth = 8;
    ctx.strokeStyle = isLightning ? '#1e293b' : '#020306';
    ctx.beginPath();
    ctx.moveTo(30, 48);
    ctx.lineTo(48, 110);
    ctx.stroke();
    ctx.restore();
  }
}
