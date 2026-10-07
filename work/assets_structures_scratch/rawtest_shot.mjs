// Adapted from ~/404_assetlib/rawtest_shot.mjs: serves game/ and this dir, renders, writes json.
import { createRequire } from 'module';
import http from 'http'; import fs from 'fs'; import path from 'path';
const require = createRequire('/Users/atlas/404-game-recipe/package.json');
const puppeteer = require('puppeteer');
const HERE = '/Users/atlas/astrocade-game5/work/assets_structures_scratch';
const GAME = '/Users/atlas/astrocade-game5/game';
const OUT = path.join(HERE, 'shots'); fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const srv = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const f = u.startsWith('/game/') ? path.join(GAME, u.slice(6)) : path.join(HERE, u);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const port = srv.address().port;
const b = await puppeteer.launch({ headless: 'new', args: ['--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const p = await b.newPage();
  p.on('console', (m) => console.log('[page]', m.text()));
  await p.setViewport({ width: 1560, height: 1100 });
  await p.goto(`http://127.0.0.1:${port}/rawtest.html`, { waitUntil: 'load', timeout: 120000 });
  await p.waitForFunction('window.__DONE__', { timeout: 240000 }).catch(() => console.log('timed out'));
  await new Promise((r) => setTimeout(r, 500));
  await p.screenshot({ path: `${OUT}/rawtest.png`, fullPage: true });
  const rep = await p.evaluate(() => window.__RAW__ || []);
  fs.writeFileSync(`${OUT}/rawtest.json`, JSON.stringify(rep, null, 1));
  console.log(`wrote ${OUT}/rawtest.png and rawtest.json (${rep.length} assets)`);
} finally { await b.close(); srv.close(); }
