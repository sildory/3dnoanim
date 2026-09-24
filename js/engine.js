import { NoirMath } from './math.js';

export class NoirEngine {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.w = width;
    this.h = height;

    // 850 частиц штормового дождя
    this.rain = [];
    for (let i = 0; i < 850; i++) {
      this.rain.push({
        x: Math.random() * this.w * 1.5 - this.w * 0.25,
        y: Math.random() * this.h,
        len: 40 + Math.random() * 60,
        speed: 45 + Math.random() * 35,
        alpha: 0.15 + Math.random() * 0.45,
        thick: 1.0 + Math.random() * 2.0
      });
    }

    // Капли дождя на оптике камеры
    this.lensDroplets = [];
    for (let i = 0; i < 60; i++) {
      this.lensDroplets.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        r: 3 + Math.random() * 11,
        speed: 0.12 + Math.random() * 0.4
      });
    }
  }

  clear(col = '#020408') {
    this.ctx.fillStyle = col;
    this.ctx.fillRect(0, 0, this.w, this.h);
  }

  // Реалистичный радар залива (PPI Radar Screen) с батиметрией
  drawPhosphorRadar(cx, cy, radius, frame) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(cx, cy);

    // Кольца дальности 5, 10, 15 морских миль
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
    ctx.lineWidth = 1.5;
    for (let r = 50; r <= radius; r += 60) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(-radius, 0); ctx.lineTo(radius, 0);
    ctx.moveTo(0, -radius); ctx.lineTo(0, radius);
    ctx.stroke();

    // Сканирующий луч с экспоненциальным затуханием
    const sweep = (frame * 0.045) % (Math.PI * 2);
    const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, radius);
    grad.addColorStop(0, 'rgba(52, 211, 153, 0.45)');
    grad.addColorStop(1, 'rgba(5, 150, 105, 0.05)');

    ctx.save();
    ctx.rotate(sweep);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, -0.4, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#6ee7b7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius, 0);
    ctx.stroke();
    ctx.restore();

    // Отметки судов
    const blips = [
      { x: 110, y: -70, label: 'СУХОГРУЗ "АКАЦУКИ" [СИГНАЛ ПОТЕРЯН]' },
      { x: -90, y: 120, label: 'ПАТРУЛЬ КАНАГАВА-2' },
      { x: 170, y: 80, label: 'ДАЙКОКУ БУЙ #12' }
    ];

    for (let i = 0; i < blips.length; i++) {
      const b = blips[i];
      const blipAngle = Math.atan2(b.y, b.x);
      const diff = (sweep - blipAngle + Math.PI * 4) % (Math.PI * 2);
      const intensity = Math.max(0, 1 - diff / 1.5);

      if (intensity > 0.05) {
        ctx.fillStyle = `rgba(239, 68, 68, ${intensity})`;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(239, 68, 68, ${intensity * 0.8})`;
        ctx.strokeRect(b.x - 8, b.y - 8, 16, 16);

        ctx.fillStyle = `rgba(255, 255, 255, ${intensity})`;
        ctx.font = 'bold 13px "Courier New"';
        ctx.fillText(b.label, b.x + 14, b.y + 4);
      }
    }
    ctx.restore();
  }

  // Биометрический сканер радужной оболочки глаза (Retinal Iris Scan)
  drawRetinalScan(x, y, radius, frame) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.5;

    // Внешние окружности
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.65, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Сетка капилляров радужки
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.65)';
    ctx.lineWidth = 1.2;
    for (let a = 0; a < Math.PI * 2; a += 0.2) {
      const r1 = radius * 0.35;
      const r2 = radius * 0.95;
      const jitter = Math.sin(a * 8 + frame * 0.1) * 6;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
      ctx.lineTo(Math.cos(a) * (r2 + jitter), Math.sin(a) * (r2 + jitter));
      ctx.stroke();
    }

    // Вращающийся видоискатель сканера
    const rot = frame * 0.03;
    ctx.save();
    ctx.rotate(rot);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 10, 0, Math.PI * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, radius + 10, Math.PI, Math.PI * 1.5);
    ctx.stroke();
    ctx.restore();

    // Засечка биометрии
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 15px "Courier New"';
    ctx.fillText('СОВПАДЕНИЕ ДНК 99.8%', -radius, radius + 35);
    ctx.fillText('ИСИКАВА КЭНДЗИ // ИНСПЕКТОР', -radius, radius + 55);
    ctx.restore();
  }

  // Волюметрический световой конус (God Rays)
  drawVolumetricSearchlight(x, y, tx, ty, wStart, wEnd, col) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const angle = Math.atan2(ty - y, tx - x);
    const dist = Math.hypot(tx - x, ty - y);

    ctx.translate(x, y);
    ctx.rotate(angle);

    const g = ctx.createLinearGradient(0, 0, dist, 0);
    g.addColorStop(0, col);
    g.addColorStop(0.7, col.replace(/[\d\.]+\)$/, '0.08)'));
    g.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -wStart / 2);
    ctx.lineTo(dist, -wEnd / 2);
    ctx.lineTo(dist, wEnd / 2);
    ctx.lineTo(0, wStart / 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Анаморфотный киноблик
  drawAnamorphicStreak(y, intensity = 0.7, col = 'rgba(14, 165, 233, ') {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const g = ctx.createLinearGradient(0, y, this.w, y);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.35, `${col}${intensity * 0.4})`);
    g.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
    g.addColorStop(0.65, `${col}${intensity * 0.4})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = g;
    ctx.fillRect(0, y - 3, this.w, 6);
    ctx.restore();
  }

  // Капли на линзе с оптическим преломлением
  drawLensRefraction(frame) {
    const ctx = this.ctx;
    ctx.save();
    for (let i = 0; i < this.lensDroplets.length; i++) {
      const d = this.lensDroplets[i];
      const curY = (d.y + frame * d.speed) % (this.h + 20);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.arc(d.x, curY, d.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(186, 230, 253, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(d.x - 1, curY - 1, d.r * 0.85, 0, Math.PI);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Штормовой дождь
  drawStormRain(frame) {
    const ctx = this.ctx;
    ctx.save();
    const windAngle = 0.26;

    for (let i = 0; i < this.rain.length; i++) {
      const d = this.rain[i];
      const curY = (d.y + frame * d.speed) % (this.h + 80);
      const curX = d.x + curY * windAngle;

      ctx.strokeStyle = `rgba(186, 230, 253, ${d.alpha})`;
      ctx.lineWidth = d.thick;
      ctx.beginPath();
      ctx.moveTo(curX, curY - d.len);
      ctx.lineTo(curX + d.len * windAngle, curY);
      ctx.stroke();

      if (curY > this.h - 220 && i % 3 === 0) {
        ctx.strokeStyle = `rgba(224, 242, 254, ${d.alpha * 0.65})`;
        ctx.beginPath();
        ctx.ellipse(curX, curY, 7, 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Хроматическая аберрация каналов RGB
  applyChromaticAberration(offset = 8) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(239, 68, 68, 0.14)';
    ctx.fillRect(-offset, 0, this.w, this.h);
    ctx.fillStyle = 'rgba(6, 182, 212, 0.14)';
    ctx.fillRect(offset, 0, this.w, this.h);
    ctx.restore();
  }

  // 35-мм кинозерно
  drawFilmGrain(frame, opacity = 0.055) {
    const ctx = this.ctx;
    ctx.save();
    let seed = frame * 997;
    for (let i = 0; i < 16000; i++) {
      const rx = NoirMath.hash(seed++) * this.w;
      const ry = NoirMath.hash(seed++) * this.h;
      const a = NoirMath.hash(seed++) * opacity;
      ctx.fillStyle = `rgba(240, 249, 255, ${a})`;
      ctx.fillRect(rx, ry, 1.8, 1.8);
    }
    ctx.restore();
  }

  // Оптическая виньетка
  drawCinematicVignette(intensity = 0.88) {
    const ctx = this.ctx;
    ctx.save();
    const g = ctx.createRadialGradient(
      this.w / 2, this.h / 2, this.w * 0.22,
      this.w / 2, this.h / 2, this.w * 0.72
    );
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.65, `rgba(2, 6, 12, ${intensity * 0.55})`);
    g.addColorStop(1, `rgba(1, 2, 4, ${intensity})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.w, this.h);
    ctx.restore();
  }

  // ЭЛТ-сканлайны
  drawScanlines(alpha = 0.065) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    for (let y = 0; y < this.h; y += 4) {
      ctx.fillRect(0, y, this.w, 1.6);
    }
    ctx.restore();
  }

  // Печатная машинка
  drawTypewriter(text, x, y, charCount, fontSize = 26, color = '#f8fafc') {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = `bold ${fontSize}px "Courier New", monospace`;
    ctx.fillStyle = color;

    const visible = text.substring(0, Math.min(text.length, Math.floor(charCount)));
    ctx.fillText(visible, x, y);

    if (Math.floor(charCount * 4) % 2 === 0 && charCount <= text.length + 8) {
      const m = ctx.measureText(visible);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + m.width + 4, y - fontSize + 6, fontSize * 0.5, fontSize);
    }
    ctx.restore();
  }

  // Японская печать Ханко / Инкан красными чернилами
  drawHankoStamp(x, y, text1 = '神奈川', text2 = '警察') {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 20px "Courier New", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text1, 0, -10);
    ctx.fillText(text2, 0, 20);
    ctx.restore();
  }
}
