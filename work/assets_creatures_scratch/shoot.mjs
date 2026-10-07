import puppeteer from 'puppeteer';
import { serve } from './serve.mjs'; import fs from 'fs';
const page = process.argv[2], PORT = 8977 + (page === 'pose' ? 0 : 1);
const srv = await serve(PORT); let b;
try {
  b = await puppeteer.launch({ headless: 'new', args: ['--enable-gpu', '--ignore-gpu-blocklist'] });
  const p = await b.newPage(); p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('console:', m.text()); }); p.on('pageerror', (e) => console.log('pageerror:', e.message));
  await p.setViewport({ width: 1260, height: 900 });
  await p.goto(`http://localhost:${PORT}/${page}.html`, { waitUntil: 'load', timeout: 120000 });
  await p.waitForFunction('window.__DONE__', { timeout: 240000 });
  fs.mkdirSync('shots', { recursive: true });
  await p.screenshot({ path: `shots/${page}.png`, fullPage: true });
  const rep = await p.evaluate(() => window.__REP__);
  fs.writeFileSync(`shots/${page}.json`, JSON.stringify(rep, null, 1));
  console.log(`wrote shots/${page}.png`);
} finally { if (b) await b.close(); srv.close(); }
