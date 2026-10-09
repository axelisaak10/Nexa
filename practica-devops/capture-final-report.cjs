const { createRequire } = require('node:module');
const { join } = require('node:path');
const { mkdirSync } = require('node:fs');

async function capture(page, url, filename, readyText) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  if (readyText) await page.getByText(readyText, { exact: false }).first().waitFor({ timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: filename, fullPage: true });
  console.log(filename);
}

async function main() {
  const dependencies = process.env.CODEX_NODE_MODULES;
  const { chromium } = createRequire(join(dependencies, '_entry.cjs'))('playwright');
  const evidence = join(__dirname, 'evidencias');
  mkdirSync(evidence, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    await capture(page,
      'https://github.com/axelisaak10/Nexa/actions/runs/37710678336',
      join(evidence, '19-github-actions-cicd-success.png'),
      'Desplegar en AWS EC2');
    await capture(page,
      'https://hub.docker.com/r/34axel/nexa-api/tags',
      join(evidence, '20-dockerhub-tags.png'),
      '34axel/nexa-api');
    await capture(page,
      'http://107.21.88.69/',
      join(evidence, '21-aws-api-publica.png'),
      'hola');
  } finally {
    await browser.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
