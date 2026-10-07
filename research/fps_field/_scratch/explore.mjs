import { open, sleep } from './lib.mjs';
const [url, name, ori, ...steps] = process.argv.slice(2);
const L = ori !== 'P';
const s = await open(url, { w: L ? 844 : 390, h: L ? 390 : 844, out: `/Users/atlas/astrocade-game5/research/fps_field/_scratch/raw/explore_${name}` });
try {
  await sleep(5000);
  for (const st of steps) {
    if (st.startsWith('#')) { const b = await s.page.$eval(st, (e) => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }); await s.T.tap(...b); }
    else if (st.startsWith('w')) { await sleep(+st.slice(1)); continue; }
    else console.log('clicked', await s.clickText(new RegExp(st)));
    await sleep(2500); await s.snap(st.replace(/\W/g, ''));
    console.log('--- after', st); console.log((await s.ui()).filter((l) => !/^(p|b|span|small|strong|em|h\d|li|i)#/.test(l)).slice(0, 45).join('\n'));
  }
  const g = await s.G(); console.log(JSON.stringify(g).slice(0, 700)); console.log('errs', s.errs.slice(0, 4));
} finally { await s.browser.close(); }
