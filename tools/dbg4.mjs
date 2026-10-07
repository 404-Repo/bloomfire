import puppeteer from 'puppeteer';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ headless: 'new', args: ['--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage(); await page.setViewport({ width: 844, height: 390, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:8797/', { waitUntil: 'load' }); await page.waitForFunction('window.__READY__ === true');
  await page.evaluate(() => window.__START__()); await sleep(1500);
  console.log(await page.evaluate(() => {
    const { scene, camera, THREE } = window.__DBG__; const fr = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    const rows = {}; scene.traverse((o) => { if (!o.isMesh || !o.visible) return; let vis = true; let p = o; while (p) { if (!p.visible) vis = false; p = p.parent; } if (!vis) return;
      const bs = o.geometry.boundingSphere || (o.geometry.computeBoundingSphere(), o.geometry.boundingSphere); const s = (o.isInstancedMesh ? o.boundingSphere : bs).clone(); if (!o.isInstancedMesh) s.applyMatrix4(o.matrixWorld);
      if (o.frustumCulled && !fr.intersectsSphere(s)) return;
      const tri = (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3 * (o.isInstancedMesh ? o.count : 1);
      const k = o.isInstancedMesh ? 'inst' + o.geometry.attributes.position.count : (o.material.name || o.material.type) + (o.castShadow ? '' : '');
      rows[k] = (rows[k] || 0) + tri; });
    return JSON.stringify(Object.entries(rows).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => k + ':' + Math.round(v / 1000) + 'k'));
  }));
} finally { await browser.close(); }
