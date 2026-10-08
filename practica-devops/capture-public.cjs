const { createRequire } = require('node:module');
const { join } = require('node:path');

async function main() {
  const dependencies = process.env.CODEX_NODE_MODULES;
  if (!dependencies) throw new Error('Falta CODEX_NODE_MODULES');
  const { chromium } = createRequire(join(dependencies, '_entry.cjs'))('playwright');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    await page.goto('http://3.15.3.74:8080/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.getByText('Servicio activo · SQLite conectado').waitFor({ timeout: 15000 });
    await page.screenshot({ path: join(__dirname, 'evidencias', '13-panel-aws-ec2.png'), fullPage: true });
    console.log(await page.title());
  } finally {
    await browser.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
