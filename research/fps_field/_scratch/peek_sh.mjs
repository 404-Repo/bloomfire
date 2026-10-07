import { open, sleep } from './lib.mjs';
const s = await open('https://matidendrite.github.io/shards-of-the-blighted-march/', { out: '/tmp/x' });
try { await sleep(5000); await s.page.click('#startb').catch(()=>{}); const b = await s.page.$eval('#startb', e => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }).catch(()=>null); if (b) await s.T.tap(...b); await sleep(4000);
  console.log(await s.page.evaluate(() => JSON.stringify({ c: window.__GAME__.camera, sh: window.__GAME__.shard, ex: window.__GAME__.exit }).slice(0, 1500)));
} finally { await s.browser.close(); }
