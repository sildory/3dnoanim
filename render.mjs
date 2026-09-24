import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = 60;
const DURATION_SEC = 30;
const TOTAL_FRAMES = DURATION_SEC * FPS; // 1800 кадров
const OUTPUT_FILE = 'yokohama_noir_masterpiece.mp4';

async function main() {
  console.log('\x1b[38;5;196m%s\x1b[0m', '╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('\x1b[1m\x1b[38;5;255m%s\x1b[0m', '║       ИОКОГАМА // ХРОНИКА ОСОБОГО ОТДЕЛА (TRUE CRIME MASTERPIECE)         ║');
  console.log('\x1b[38;5;196m%s\x1b[0m', '╚═══════════════════════════════════════════════════════════════════════════╝');
  console.log(`[i] Разрешение: ${WIDTH}x${HEIGHT} | 60 FPS | Всего кадров: ${TOTAL_FRAMES}`);
  console.log(`[i] Целевой файл: ${OUTPUT_FILE}\n`);

  const ffmpeg = spawn('ffmpeg', [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', String(FPS),
    '-i', '-',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '16',
    '-pix_fmt', 'yuv420p',
    OUTPUT_FILE
  ]);

  ffmpeg.stderr.on('data', (d) => {
    const msg = d.toString();
    if (msg.includes('Error') || msg.includes('fatal')) {
      console.error('\x1b[31m[FFMPEG ERROR]\x1b[0m', msg);
    }
  });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-background-timer-throttling',
      `--window-size=${WIDTH},${HEIGHT}`
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  const sceneUrl = `file://${path.join(__dirname, 'index.html')}`;
  await page.goto(sceneUrl, { waitUntil: 'load' });
  await page.waitForFunction('typeof window.renderFrame === "function"');

  console.log('\x1b[32m[+] Запуск конвейера визуализации...\x1b[0m');
  const t0 = Date.now();

  for (let f = 0; f < TOTAL_FRAMES; f++) {
    await page.evaluate((frame) => window.renderFrame(frame), f);

    const buf = await page.screenshot({
      type: 'jpeg',
      quality: 95,
      omitBackground: false
    });

    const ok = ffmpeg.stdin.write(buf);
    if (!ok) {
      await new Promise((res) => ffmpeg.stdin.once('drain', res));
    }

    if (f % 30 === 0 || f === TOTAL_FRAMES - 1) {
      const elapsed = (Date.now() - t0) / 1000;
      const curFps = (f + 1) / elapsed;
      const pct = (((f + 1) / TOTAL_FRAMES) * 100).toFixed(1);
      const eta = ((TOTAL_FRAMES - (f + 1)) / (curFps || 1)).toFixed(0);

      process.stdout.write(
        `\r\x1b[38;5;45m[РЕНДЕР]\x1b[0m Кадр ${String(f + 1).padStart(4, ' ')}/${TOTAL_FRAMES} ` +
        `[\x1b[1m\x1b[38;5;196m${pct}%\x1b[0m] | ${curFps.toFixed(1)} FPS | Ожидание: ~${eta}с `
      );
    }
  }

  console.log('\n\n\x1b[32m[+] Видеопоток завершен. Финализация контейнера...\x1b[0m');
  ffmpeg.stdin.end();

  await new Promise((resolve, reject) => {
    ffmpeg.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg завершился с кодом ошибки: ${code}`));
    });
  });

  await browser.close();
  const dur = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\x1b[38;5;46m[✓] РЕНДЕР ЗАВЕРШЕН! Видео: ${OUTPUT_FILE} (${dur} сек)\x1b[0m\n`);
}

main().catch((err) => {
  console.error('\x1b[31m[!] Сбой:\x1b[0m', err);
  process.exit(1);
});
