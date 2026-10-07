import { open, sleep } from './lib.mjs';
const L = process.argv[2] !== 'P';
const s = await open('https://dairus01.github.io/blacksite/', { w: L ? 844 : 390, h: L ? 390 : 844, out: '/Users/atlas/astrocade-game5/research/fps_field/_scratch/bs_start' });
try {
  await sleep(4000);
  const b = await s.page.$eval('#startb', (e) => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  await s.T.tap(...b); await sleep(2500); await s.snap('afterdeploy');
  console.log((await s.ui()).filter(l=>!/^(p|b|span|h\d)#/.test(l)).join('\n'));
  const g = await s.G(); console.log(JSON.stringify(g).slice(0, 900));
} finally { await s.browser.close(); }
