import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../src/lib/mobile.js', import.meta.url), 'utf8');
const mobile = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('Coordinates reject missing, nonnumeric, nonfinite and out-of-range values', () => {
  assert.equal(mobile.validCoordinates(0, 0), true);
  assert.equal(mobile.validCoordinates(19.43, -99.13), true);
  for (const pair of [[null, 0], ['', 0], [91, 0], [0, -181], [NaN, 0], [Infinity, 0]]) assert.equal(mobile.validCoordinates(...pair), false);
});

test('Pairing rejects foreign origins, executable URLs, wrong routes and malformed tokens', () => {
  const origin = 'https://nexa.example';
  assert.equal(mobile.pairingToken('ABCD2345', origin), 'ABCD2345');
  assert.equal(mobile.pairingToken(`${origin}/auth/watch?token=ABCD2345`, origin), 'ABCD2345');
  for (const value of ['https://evil.example/auth/watch?token=ABCD2345', 'javascript:alert(1)', '/other?token=ABCD2345', '00000000', 'ABCD2345extra']) assert.equal(mobile.pairingToken(value, origin), null);
});

test('A partial geocoded address leaves absent fields empty for manual entry', () => {
  assert.deepEqual(mobile.addressFromGeocoder({ road: 'Reforma', city: 'CDMX' }), { calle_numero: 'Reforma', colonia: '', ciudad: 'CDMX', codigo_postal: '' });
});

test('Shake detection ignores ordinary movement, needs several peaks and enforces cooldown', () => {
  const detect = mobile.createShakeDetector();
  for (let t = 0; t < 1000; t += 100) assert.equal(detect({ x: 0, y: 1, z: 9.8 }, t), false);
  assert.equal(detect({ x: 30, y: 1, z: 9.8 }, 1200), false);
  assert.equal(detect({ x: -30, y: 1, z: 9.8 }, 1400), false);
  assert.equal(detect({ x: 30, y: 1, z: 9.8 }, 1600), true);
  for (let t = 1800; t < 5000; t += 200) assert.equal(detect({ x: t % 400 ? 30 : -30, y: 1, z: 9.8 }, t), false);
});

function database(records) {
  return { from(table) {
    let filters = [];
    let changes;
    const query = {
      select() { return query; },
      eq(k, v) { filters.push(row => String(row[k]) === String(v)); return query; },
      gte(k, v) { filters.push(row => row[k] >= v); return query; },
      lte(k, v) { filters.push(row => row[k] <= v); return query; },
      update(value) { changes = value; return query; },
      async upsert(row) { records[table] = [row]; return { error: null }; },
      async maybeSingle() {
        const row = records[table]?.find(row => filters.every(f => f(row)));
        if (row && changes) Object.assign(row, changes);
        return { data: row ? { ...row } : null, error: null };
      },
    };
    return query;
  } };
}

async function route(path, session, records = {}, overrides = {}) {
  const db = database(records);
  const helpers = {
    mobileSession: async (_request, admin) => {
      if (!session) throw Object.assign(new Error('Unauthorized'), { status: 401 });
      if (admin && session.id_rol !== 1) throw Object.assign(new Error('Forbidden'), { status: 403 });
      return { db, session };
    },
    mobileError: error => Response.json({ error: error.message }, { status: error.status || 503 }),
  };
  const context = vm.createContext({ Response, Date, Number, process: { env: { SUPABASE_SERVICE_ROLE_KEY: 'test-only' } } });
  const routeModule = new vm.SourceTextModule(await readFile(new URL(`../src/${path}`, import.meta.url), 'utf8'), { context });
  await routeModule.link(async name => {
    const exports = overrides[name] || (name.endsWith('mobileServer') ? helpers : name.endsWith('mobile') ? mobile : {});
    return new vm.SyntheticModule(Object.keys(exports), function () { for (const [key, value] of Object.entries(exports)) this.setExport(key, value); }, { context });
  });
  await routeModule.evaluate();
  return routeModule.namespace;
}
const context = { params: Promise.resolve({ id: '7' }) };
const request = body => new Request('https://nexa.example/api', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });

test('Tracking denies anonymous and other customers; owner sees a real location only during delivery', async () => {
  const records = { pedidos: [{ id_pedido: 7, id_usuario: 2, estado_pedido: 'Enviado' }], order_tracking: [{ id_pedido: 7, latitude: 19, longitude: -99 }] };
  const anonymous = await route('app/api/orders/[id]/tracking/route.js', null, records);
  assert.equal((await anonymous.GET(request({}), context)).status, 401);
  const other = await route('app/api/orders/[id]/tracking/route.js', { id_usuario: 3, id_rol: 2 }, records);
  assert.equal((await other.GET(request({}), context)).status, 404);
  const owner = await route('app/api/orders/[id]/tracking/route.js', { id_usuario: 2, id_rol: 2 }, records);
  assert.equal((await (await owner.GET(request({}), context)).json()).location.latitude, 19);
  records.pedidos[0].estado_pedido = 'Entregado';
  assert.equal((await (await owner.GET(request({}), context)).json()).location, null);
});

test('Publishing requires admin, valid coordinates and an active delivery', async () => {
  const records = { pedidos: [{ id_pedido: 7, estado_pedido: 'Enviado' }] };
  const customer = await route('app/api/orders/[id]/tracking/route.js', { id_usuario: 2, id_rol: 2 }, records);
  assert.equal((await customer.POST(request({ latitude: 19, longitude: -99, accuracy: 5 }), context)).status, 403);
  const admin = await route('app/api/orders/[id]/tracking/route.js', { id_usuario: 1, id_rol: 1 }, records);
  assert.equal((await admin.POST(request({ latitude: 91, longitude: 0, accuracy: 5 }), context)).status, 400);
  assert.equal((await admin.POST(request({ latitude: 19, longitude: -99, accuracy: 5 }), context)).status, 200);
  records.pedidos[0].estado_pedido = 'Entregado';
  assert.equal((await admin.POST(request({ latitude: 19, longitude: -99, accuracy: 5 }), context)).status, 409);
});

test('Pairing binds the authenticated user once and refuses expired sessions', async () => {
  const records = { qr_sessions: [{ token: 'ABCD2345', status: 'pending', created_at: new Date().toISOString() }, { token: 'BCDE2345', status: 'pending', created_at: new Date(Date.now() - 700000).toISOString() }] };
  const api = await route('app/api/devices/pair/route.js', { id_usuario: 2 }, records);
  assert.equal((await api.POST(request({ token: 'ABCD2345', userId: 999 }))).status, 200);
  assert.equal(records.qr_sessions[0].user_id, 2);
  assert.equal((await api.POST(request({ token: 'ABCD2345' }))).status, 409);
  assert.equal((await api.POST(request({ token: 'BCDE2345' }))).status, 409);
});

test('Order updates notify only persisted transitions and reject invalid states', async () => {
  const records = { pedidos: [{ id_pedido: 7, id_usuario: 2, estado_pedido: 'Pendiente' }] };
  let sends = 0;
  const api = await route('app/api/admin/orders/route.js', { id_usuario: 1, id_rol: 1 }, records, {
    'next/server': { NextResponse: Response },
    '@/lib/authHelper': { getSession: () => ({ id_rol: 1 }), isAdmin: session => session?.id_rol === 1 },
    '@/lib/mockData': { getPedidos: async () => [], updateEstadoPedido: async () => { throw new Error('Must not use mock'); } },
    '@/lib/pushServer': { sendOrderPush: async () => { sends++; return { sent: 1 }; } },
  });
  assert.equal((await api.PUT(request({ id_pedido: 7, estado_pedido: 'Invalid' }))).status, 400);
  assert.equal((await api.PUT(request({ id_pedido: 7, estado_pedido: 'Enviado' }))).status, 200);
  assert.equal((await api.PUT(request({ id_pedido: 7, estado_pedido: 'Enviado' }))).status, 200);
  assert.equal(sends, 1);
});

test('Service worker never intercepts private API traffic and constrains notification navigation', async () => {
  const listeners = {};
  let opened;
  const self = { location: { origin: 'https://nexa.example' }, addEventListener: (name, cb) => { listeners[name] = cb; }, clients: { matchAll: async () => [], openWindow: async value => { opened = value; } } };
  vm.runInNewContext(await readFile(new URL('../public/sw.js', import.meta.url), 'utf8'), { self, URL });
  for (const path of ['/api/orders', '/api/orders/7/tracking', '/profile']) listeners.fetch({ request: new Request(`https://nexa.example${path}`), respondWith: () => assert.fail('Private data cached') });
  let promise;
  listeners.notificationclick({ notification: { data: { url: 'https://evil.example' }, close() {} }, waitUntil: value => { promise = value; } });
  await promise;
  assert.equal(opened, 'https://nexa.example/profile');
});
