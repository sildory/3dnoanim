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

function startLocalServer() {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf'
  };

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(__dirname, reqPath);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end(`Файл не найден: ${reqPath}`);
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

async function main() {
  console.log('\x1b[35m%s\x1b[0m', '════════════════════════════════════════════════════════════════════');
  console.log('\x1b[1m\x1b[37m%s\x1b[0m', '   ИОКОГАМА // ХРОНИКА ОСОБОГО ОТДЕЛА (HOLLYWOOD 3D MASTERPIECE)    ');
  console.log('\x1b[35m%s\x1b[0m', '════════════════════════════════════════════════════════════════════');

  const server = await startLocalServer();
  console.log(`[+] Локальный сервер запущен: http://127.0.0.1:${PORT}`);

  const ffmpeg = spawn('ffmpeg', [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', String(FPS),
    '-i', '-',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-profile:v', 'high',
    '-level:v', '4.2',
    '-crf', '15',
    '-pix_fmt', 'yuv420p',
    OUTPUT_FILE
  ]);

  ffmpeg.stderr.on('data', (d) => {
    const msg = d.toString();
    if (msg.includes('Error') || msg.includes('fatal')) {
      console.error('\x1b[31m[FFMPEG ERROR]\x1b[0m', msg);
    }
  });

  // Запуск Chromium с надежными флагами WebGL для виртуального дисплея Xvfb
  const browser = await puppeteer.launch({
    headless: false, // Под Xvfb режим с виртуальным дисплеем гарантирует создание WebGL контекста
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--use-angle=gl',
      '--in-process-gpu',
      '--disable-background-timer-throttling',
      `--window-size=${WIDTH},${HEIGHT}`
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('[THREE]') || text.includes('[ERROR]')) {
      console.log(`[БРАУЗЕР] ${msg.type().toUpperCase()}: ${text}`);
    }
  });
  page.on('pageerror', (err) => console.error(`\x1b[31m[ОШИБКА СТРАНИЦЫ]\x1b[0m ${err.message}`));

  const targetUrl = `http://127.0.0.1:${PORT}/index.html`;
  console.log(`[+] Загрузка 3D сцены: ${targetUrl}`);
  await page.goto(targetUrl, { waitUntil: 'networkidle0' });

  // Ожидание готовности 3D-конвейера
  await page.waitForFunction('typeof window.renderFrame === "function"', { timeout: 35000 });
  await page.waitForFunction('window.__ENGINE_READY__ === true', { timeout: 35000 });

  console.log('\x1b[32m[+] 3D Движок успешно инициализирован. Старт пошагового рендера...\x1b[0m\n');
  const t0 = Date.now();

  for (let f = 0; f < TOTAL_FRAMES; f++) {
    await page.evaluate((frame) => window.renderFrame(frame), f);

    const buf = await page.screenshot({
      type: 'jpeg',
      quality: 98,
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
        `\r\x1b[36m[3D RENDER]\x1b[0m Кадр ${String(f + 1).padStart(4, ' ')}/${TOTAL_FRAMES} ` +
        `[\x1b[1m\x1b[32m${pct}%\x1b[0m] | ${curFps.toFixed(1)} FPS | Ожидание: ~${eta}с `
      );
    }
  }

  console.log('\n\n\x1b[32m[+] Все 1800 кадров захвачены. Финализация кодирования видеофайла...\x1b[0m');
  ffmpeg.stdin.end();

  await new Promise((resolve, reject) => {
    ffmpeg.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg завершился с кодом: ${code}`));
    });
  });

  await browser.close();
  server.close();

  const dur = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\x1b[32m[✓] РЕНДЕР 3D ШЕДЕВРА ЗАВЕРШЕН! Файл: ${OUTPUT_FILE} (время: ${dur} сек)\x1b[0m\n`);
}

main().catch((err) => {
  console.error('\x1b[31m[!] Критическая ошибка рендера:\x1b[0m', err);
  process.exit(1);
}); 
