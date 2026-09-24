import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = 60;
const DURATION_SEC = 30;
const TOTAL_FRAMES = DURATION_SEC * FPS; // 1800 кадров
const OUTPUT_FILE = 'yokohama_noir_masterpiece.mp4';
const PORT = 8080;

// Встроенный локальный HTTP-сервер для снятия ограничений CORS
function startLocalServer() {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8'
  };

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(__dirname, reqPath);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end(`File not found: ${reqPath}`);
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

async function main() {
  console.log('\x1b[35m%s\x1b[0m', '════════════════════════════════════════════════════════════════');
  console.log('\x1b[1m\x1b[37m%s\x1b[0m', '   ИОКОГАМА // ХРОНИКА ОСОБОГО ОТДЕЛА (TRUE CRIME MASTERPIECE)  ');
  console.log('\x1b[35m%s\x1b[0m', '════════════════════════════════════════════════════════════════');

  const server = await startLocalServer();
  console.log(`[+] Локальный сервер запущен: http://127.0.0.1:${PORT}`);

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
      '--allow-file-access-from-files',
      '--disable-web-security',
      '--disable-background-timer-throttling',
      `--window-size=${WIDTH},${HEIGHT}`
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  // Вывод логов браузера прямо в терминал GitHub Actions
  page.on('console', (msg) => console.log(`[БРАУЗЕР] ${msg.type().toUpperCase()}: ${msg.text()}`));
  page.on('pageerror', (err) => console.error(`\x1b[31m[ОШИБКА В СТРАНИЦЕ]\x1b[0m ${err.message}`));

  const targetUrl = `http://127.0.0.1:${PORT}/index.html`;
  console.log(`[+] Открытие сцены: ${targetUrl}`);
  await page.goto(targetUrl, { waitUntil: 'networkidle0' });

  // Ожидание регистрации функции
  await page.waitForFunction('typeof window.renderFrame === "function"', { timeout: 15000 });

  console.log('\x1b[32m[+] Функция renderFrame успешно инициализирована. Старт рендера...\x1b[0m\n');
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
        `\r\x1b[36m[РЕНДЕР]\x1b[0m Кадр ${String(f + 1).padStart(4, ' ')}/${TOTAL_FRAMES} ` +
        `[\x1b[1m\x1b[32m${pct}%\x1b[0m] | ${curFps.toFixed(1)} FPS | Ожидание: ~${eta}с `
      );
    }
  }

  console.log('\n\n\x1b[32m[+] Все кадры обработаны. Завершение MP4...\x1b[0m');
  ffmpeg.stdin.end();

  await new Promise((resolve, reject) => {
    ffmpeg.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg завершился с кодом ошибки: ${code}`));
    });
  });

  await browser.close();
  server.close();

  const dur = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\x1b[32m[✓] РЕНДЕР ЗАВЕРШЕН! Файл: ${OUTPUT_FILE} (${dur} сек)\x1b[0m\n`);
}

main().catch((err) => {
  console.error('\x1b[31m[!] Сбой:\x1b[0m', err);
  process.exit(1);
});
