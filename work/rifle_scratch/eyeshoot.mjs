// node eyeshoot.mjs out.png url [query...]  -> 844x390 @2x screenshot of eye.html
import puppeteer from 'puppeteer'; import { serve } from './serve.mjs';
const [out, url, extra = ''] = process.argv.slice(2);
const PORT = 8990 + Math.floor(Math.random() * 50); const srv = await serve(PORT); let b;
try {
  b = await puppeteer.launch({ headless: 'new', args: ['--enable-gpu', '--ignore-gpu-blocklist'] });
  const p = await b.newPage(); p.on('pageerror', (e) => console.log('pageerror:', e.message)); p.on('console', (m) => { if (m.type() !== 'log') console.log('console:', m.text()); });
  await p.setViewport({ width: 844, height: 390, deviceScaleFactor: 2 });
  await p.goto(`http://localhost:${PORT}/eye.html?u=${encodeURIComponent(url)}&${extra}`, { waitUntil: 'load' });
  await p.waitForFunction('window.__DONE__', { timeout: 60000 });
  await p.screenshot({ path: out });
  console.log(out, JSON.stringify(await p.evaluate(() => window.__REP__)));
} finally { if (b) await b.close(); srv.close(); }
