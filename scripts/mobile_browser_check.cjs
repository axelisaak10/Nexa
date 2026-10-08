// Run against a local production build. All API calls are intercepted with isolated fixtures.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
    const payload = Buffer.from(JSON.stringify({ id_usuario: 2, id_rol: 2, nombre: 'Cliente de prueba', exp: Date.now() + 3600000 })).toString('base64url');
    await context.addCookies([{ name: 'nexa-token', value: `test.${payload}.test`, domain: 'localhost', path: '/' }]);
    await context.addInitScript(() => {
      sessionStorage.setItem('nexa-discount-dismissed', 'true');
      Object.defineProperty(navigator, 'geolocation', { value: { getCurrentPosition(resolve, reject) { if (window.testDenyLocation) reject({ code: 1 }); else resolve({ coords: { latitude: 19.4, longitude: -99.1 } }); } } });
    });
    let offline = false;
    let paired = false;
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin !== 'http://localhost:3100') return route.fulfill({ status: 200, contentType: 'text/html', body: '' });
      if (!url.pathname.startsWith('/api/')) return route.continue();
      let data = { success: true };
      if (url.pathname === '/api/orders') data.orders = [{ id_pedido: 7, estado_pedido: 'Enviado', fecha_pedido: new Date().toISOString(), total: 95, metodo_pago: 'Prueba', detalles_pedido: [] }];
      if (url.pathname === '/api/cart') data.items = [];
      if (url.pathname === '/api/favorites') data.favorites = [];
      if (url.pathname === '/api/address/locate') data.address = { calle_numero: 'Reforma 123', colonia: 'Centro', ciudad: 'CDMX', codigo_postal: '06000' };
      if (url.pathname === '/api/devices/pair') { assert.deepEqual(route.request().postDataJSON(), { token: 'ABCD2345' }); paired = true; }
      if (url.pathname === '/api/orders/7/tracking') {
        if (offline) return route.abort('internetdisconnected');
        data = { order: { id_pedido: 7, estado_pedido: 'Enviado' }, location: { latitude: 19.4, longitude: -99.1, updated_at: new Date(Date.now() - 180000).toISOString(), accuracy: 10 }, checkedAt: new Date().toISOString() };
      }
      return route.fulfill({ json: data });
    });
    const page = await context.newPage();
    await page.goto('http://localhost:3100/profile');
    await page.getByRole('button', { name: 'EDITAR PERFIL Y DIRECCIÓN' }).click();
    await page.getByRole('button', { name: 'Usar mi ubicación' }).click();
    await page.getByRole('button', { name: 'Usar esta dirección' }).click();
    assert.equal(await page.getByPlaceholder('Av. Principal #123').inputValue(), 'Reforma 123');
    await page.evaluate(() => { window.testDenyLocation = true; });
    await page.getByRole('button', { name: 'Usar mi ubicación' }).click();
    await page.getByText('No autorizaste la ubicación. Puedes escribir la dirección.').waitFor();
    await page.getByRole('button', { name: 'Leer etiqueta NFC' }).click();
    await page.getByText('NFC no está disponible aquí.', { exact: false }).waitFor();
    await page.getByLabel('Código o enlace de vinculación').fill('ABCD2345');
    await page.getByRole('button', { name: 'Confirmar vinculación' }).click();
    await page.getByText('Dispositivo vinculado a tu cuenta.', { exact: true }).waitFor();
    assert.equal(paired, true);
    paired = false;
    await page.evaluate(() => {
      window.NDEFReader = class { async scan() { window.testReader = this; } };
    });
    await page.getByRole('button', { name: 'Leer etiqueta NFC' }).click();
    await page.evaluate(() => window.testReader.onreading({ message: { records: [{ recordType: 'url', data: new TextEncoder().encode('https://other.example/auth/watch?token=ABCD2345') }] } }));
    await page.getByText('La etiqueta no contiene un código Nexa válido.', { exact: false }).waitFor();
    await page.evaluate(() => window.testReader.onreading({ message: { records: [{ recordType: 'text', data: new TextEncoder().encode('ABCD2345') }] } }));
    await page.getByText('Código leído. Confirma la vinculación con tu cuenta.').waitFor();
    assert.equal(paired, false, 'A scan must not automatically pair');
    await page.getByRole('button', { name: 'Confirmar vinculación' }).click();
    await page.getByText('Dispositivo vinculado a tu cuenta.', { exact: true }).waitFor();
    assert.equal(paired, true);
    await page.evaluate(() => { Notification.requestPermission = async () => 'denied'; });
    await page.getByRole('button', { name: 'Guardar y activar' }).click();
    await page.getByText('No se autorizaron las notificaciones.', { exact: false }).waitFor();
    fs.mkdirSync('.mobile-qa', { recursive: true });
    await page.screenshot({ path: '.mobile-qa/profile.png', fullPage: true });
    await page.locator('.mobile-feature').last().screenshot({ path: '.mobile-qa/device-settings.png' });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'Mobile layout overflows: ' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right > innerWidth + 1).slice(0, 8).map(el => ({ tag: el.tagName, class: el.className, width: el.getBoundingClientRect().width })))));
    await page.getByRole('button', { name: 'Ver promociones', exact: true }).click();
    await page.getByText('15% DE DESCUENTO', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Cerrar aviso' }).click();
    await page.getByRole('link', { name: 'Ver seguimiento de este pedido' }).click();
    await page.getByText('Última posición conocida · sin datos recientes').waitFor();
    await page.screenshot({ path: '.mobile-qa/tracking.png', fullPage: true });
    offline = true;
    await page.evaluate(() => window.dispatchEvent(new Event('online')));
    await page.locator('.mobile-feature [role="alert"]').waitFor();
    offline = false;
    await page.evaluate(() => window.dispatchEvent(new Event('online')));
    await page.locator('.mobile-feature [role="alert"]').waitFor({ state: 'hidden' });
    await context.clearCookies();
    await page.reload();
    await page.getByText('Inicia sesión para consultar tu entrega').waitFor();
    console.log('PASS: mobile layout, address confirmation/denial, NFC fallback and reader confirmation, push permission denial, promotions, stale tracking, reconnect and signed-out access.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
