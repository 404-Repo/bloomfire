import puppeteer from 'puppeteer';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ headless: 'new', args: ['--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:8797/', { waitUntil: 'load' }); await page.waitForFunction('window.__READY__ === true');
  await page.evaluate(() => window.__START__()); await sleep(2000);
  const r = await page.evaluate(() => {
    const { scene, renderer, camera, THREE } = window.__DBG__; const out = {}; let meshes = 0, inst = 0, cast = 0;
    const fr = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    let vis = 0; const byName = {};
    scene.traverse((o) => { if (o.isMesh || o.isPoints) { meshes++; if (o.isInstancedMesh) inst++; if (o.castShadow) cast++; if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); const s = o.geometry.boundingSphere.clone().applyMatrix4(o.matrixWorld); if (!o.frustumCulled || fr.intersectsSphere(s)) { vis++; let p = o; while (p.parent && p.parent !== scene) p = p.parent; const k = (p.name || p.type) + (o.isInstancedMesh ? ':inst' : ''); byName[k] = (byName[k] || 0) + 1; } } });
    const insts = {}; scene.traverse(o=>{ if(o.isInstancedMesh){ const k=o.count; insts[o.geometry.attributes.position.count]=(insts[o.geometry.attributes.position.count]||0)+1; } }); const tops = scene.children.map((c) => { let n = 0; c.traverse((o) => { if (o.isMesh) n++; }); return n; }).filter((n) => n > 3); const mats = new Set(); scene.children[scene.children.length-1].traverse(o=>{if(o.isMesh)mats.add(o.material.type+o.material.color?.getHexString())}); return { insts, tops, lastMats: [...mats].slice(0,10), meshes, inst, cast, vis, byName, calls: renderer.info.render.calls, shadowMap: renderer.shadowMap.enabled };
  });
  console.log(JSON.stringify(r, null, 1));
} finally { await browser.close(); }
