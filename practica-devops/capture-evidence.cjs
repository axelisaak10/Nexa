// Capturas reales del panel y peticiones HTTP. Usa el Playwright del runtime.
const { createRequire } = require('node:module');
const { join } = require('node:path');
const { mkdirSync, writeFileSync } = require('node:fs');
const { randomUUID } = require('node:crypto');
async function main() {
  const dependencies = process.env.CODEX_NODE_MODULES;
  if (!dependencies) throw new Error('Configura CODEX_NODE_MODULES al directorio de paquetes del runtime');
  const { chromium } = createRequire(join(dependencies, '_entry.cjs'))('playwright');
  const { createApp } = await import('./server.mjs');
  const root = join(__dirname, 'evidencias');
  mkdirSync(root, { recursive: true });
  const token = randomUUID();
  const { server } = createApp({ dataDir: join(__dirname, 'data', `evidence-${Date.now()}`), adminToken: token });
  const port = Number(process.env.EVIDENCE_PORT || 18080);
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 1100 }, deviceScaleFactor: 1 });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://localhost:${port}`);
    await page.getByText('Servicio activo · SQLite conectado').waitFor();
    await page.screenshot({ path: join(root, '01-panel-local.png'), fullPage: true });
    await page.locator('#token').fill(token);
    const actions = [
      [0, '02-health'], [2, '03-crear-categoria'], [1, '04-categorias'],
      [5, '05-crear-producto'], [4, '06-productos'], [6, '07-producto'],
      [8, '08-respaldo'], [7, '09-eliminar-producto'], [3, '10-eliminar-categoria'], [9, '11-vaciado'],
    ];
    const evidence = [];
    page.on('dialog', dialog => dialog.accept());
    for (const [index, name] of actions) {
      if (index === 9) {
        const headers = { 'Content-Type': 'application/json', 'X-Admin-Token': token };
        const category = await (await fetch(`http://localhost:${port}/api/categories`, { method: 'POST', headers, body: JSON.stringify({ name: 'Datos para vaciado' }) })).json();
        await fetch(`http://localhost:${port}/api/products`, { method: 'POST', headers, body: JSON.stringify({ name: 'Producto para vaciado', price_cents: 100, category_id: category.data[0].id }) });
      }
      await page.locator('#endpoint').selectOption(String(index));
      const responsePromise = page.waitForResponse(r => r.url().includes('/api/') && r.request().method() !== 'OPTIONS');
      await page.locator('#send').click();
      const response = await responsePromise;
      await page.locator('#send').waitFor({ state: 'visible' });
      await page.waitForFunction(() => !document.querySelector('#send').disabled);
      evidence.push({ method: response.request().method(), url: response.url(), status: response.status(), body: await response.json() });
      await page.screenshot({ path: join(root, name + '.png'), fullPage: true });
      await page.screenshot({ path: join(root, name + '-detalle.png'), clip: { x: 80, y: 281, width: 1120, height: 625 } });
      if (!response.ok()) throw new Error(`Fallo de evidencia: ${name}`);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    if (!await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)) throw new Error('Desbordamiento móvil');
    await page.screenshot({ path: join(root, '12-panel-movil.png'), fullPage: true });
    if (errors.length) throw new Error(errors.join('\n'));
    writeFileSync(join(root, 'peticiones-locales.json'), JSON.stringify({ capturedAt: new Date().toISOString(), environment: 'Node.js local, sin contenedor', requests: evidence }, null, 2));
    console.log(`Capturadas ${evidence.length} peticiones correctas y 12 pantallas reales.`);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
