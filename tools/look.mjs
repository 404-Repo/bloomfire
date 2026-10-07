// Frames from fixed spots: node tools/look.mjs "x,z,yaw,pitch[;paint=x,z,r]" ... --out=dir [--w --h] [--start]
import puppeteer from 'puppeteer';
import fs from 'fs';
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const W = +arg('w', 844), H = +arg('h', 390), OUT = arg('out', '/Users/atlas/astrocade-game5/work/lead_scratch/look');
fs.mkdirSync(OUT, { recursive: true });
const spots = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ headless: 'new', args: ['--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  let i = 0;
  for (const sp of spots) {
    const [at, paint] = sp.split('|');
    const page = await browser.newPage(); await page.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    page.on('pageerror', (e) => console.log('pageerror', e.message));
    await page.goto(`http://localhost:8797/?at=${at}${paint ? '&paint=' + paint : ''}`, { waitUntil: 'load' }); await page.waitForFunction('window.__READY__ === true');
    await page.evaluate(() => window.__START__()); await sleep(2500);
    if (!process.argv.includes('--hud')) await page.addStyleTag({ content: '#hud,#touch,#rotate{display:none!important}' });
    await sleep(300);
    await page.screenshot({ path: `${OUT}/l${i++}.jpg`, type: 'jpeg', quality: 85 });
    await page.close();
  }
} finally { await browser.close(); }
