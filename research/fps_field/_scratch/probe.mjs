import { open, sleep } from './lib.mjs';
const [url, name, ori = 'L'] = process.argv.slice(2);
const L = ori === 'L';
const s = await open(url, { w: L ? 844 : 390, h: L ? 390 : 844, out: `/Users/atlas/astrocade-game5/research/fps_field/_scratch/probe_${name}` });
try {
  await sleep(6000);
  console.log('gpu', await s.gpu());
  await s.snap('load');
  console.log((await s.ui()).join('\n'));
  console.log('G', JSON.stringify(await s.G())?.slice(0, 600));
  console.log('errs', s.errs.slice(0, 5));
} finally { await s.browser.close(); }
