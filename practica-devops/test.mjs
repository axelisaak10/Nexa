import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createApp } from './server.mjs';
import { createConnection } from 'node:net';
import { endpoints } from './contracts.mjs';

test('Integración de 12 endpoints, errores, respaldo y persistencia', async t => {
  const dataDir = mkdtempSync(join(tmpdir(), 'nexa-test-'));
  let app = createApp({ dataDir, adminToken: 'test-only-token' });
  await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
  let base = `http://127.0.0.1:${app.server.address().port}`;
  t.after(async () => {
    if (app.tcpServer.listening) await new Promise(resolve => app.tcpServer.close(resolve));
    if (app.server.listening) await new Promise(resolve => app.server.close(resolve));
    rmSync(dataDir, { recursive: true, force: true });
  });
  const request = async (method, path, input, status = 200, token = 'test-only-token') => {
    const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token }, body: input === undefined ? undefined : JSON.stringify(input) });
    const json = await response.json();
    assert.equal(response.status, status, JSON.stringify(json));
    assert.equal(json.statusCode, status);
    assert.deepEqual(Object.keys(json).sort(), ['data', 'statusCode']);
    assert.ok(Array.isArray(json.data));
    return json.data;
  };
  let category, product, backup;
  await t.test('cat', async () => {
    const health = (await request('GET', '/api/health'))[0];
    assert.deepEqual(health, { message: 'hola' });
    const spec = await (await fetch(base + '/openapi.json')).json();
    assert.equal(Object.values(spec.paths).flatMap(Object.keys).length, 12);
    assert.equal(endpoints.length, 12);
  });
  await t.test('02 GET categories inicialmente vacío', async () => assert.deepEqual(await request('GET', '/api/categories'), []));
  await t.test('03 POST categories', async () => { [category] = await request('POST', '/api/categories', { name: 'Tecnología' }, 201); });
  await t.test('04 POST products relacionado', async () => { [product] = await request('POST', '/api/products', { name: 'Teclado', price_cents: 59900, category_id: category.id }, 201); });
  await t.test('05 GET products', async () => assert.equal((await request('GET', '/api/products')).length, 1));
  await t.test('06 GET products por ID', async () => assert.deepEqual((await request('GET', `/api/products/${product.id}`))[0], product));
  await t.test('07 PUT categories actualiza datos', async () => {
    [category] = await request('PUT', `/api/categories/${category.id}`, { name: 'Tecnología actualizada' });
    assert.equal(category.name, 'Tecnología actualizada');
  });
  await t.test('08 PUT products actualiza datos', async () => {
    [product] = await request('PUT', `/api/products/${product.id}`, { name: 'Teclado actualizado', price_cents: 64900, category_id: category.id });
    assert.equal(product.price_cents, 64900);
    assert.deepEqual((await request('GET', `/api/products/${product.id}`))[0], product);
  });
  await t.test('Rechazo de duplicados, FK inválida y eliminación del padre', async () => {
    await request('POST', '/api/categories', { name: 'Tecnología actualizada' }, 409);
    await request('POST', '/api/products', { name: 'X', price_cents: 1, category_id: 9999 }, 409);
    await request('DELETE', `/api/categories/${category.id}`, undefined, 409);
    assert.equal((await request('GET', '/api/products')).length, 1);
  });
  await t.test('Esquemas, autorización y errores', async () => {
    for (const input of [{}, { name: ' ' }, { name: 'X', extra: 1 }, [], null]) await request('POST', '/api/categories', input, 400);
    for (const price of [-1, 0.5, '100', null]) await request('POST', '/api/products', { name: 'X', price_cents: price, category_id: category.id }, 400);
    await request('POST', '/api/categories', { name: 'X' }, 401, 'wrong');
    await request('POST', '/api/database/backup', undefined, 401, '');
    await request('DELETE', '/api/database', { confirmation: 'VACIAR' }, 401, '');
    await request('DELETE', '/api/database', { confirmation: 'NO' }, 400);
    await request('GET', '/api/products/9999', undefined, 404);
    await request('PUT', '/api/products/9999', { name: 'X', price_cents: 1, category_id: category.id }, 404);
    await request('PUT', `/api/products/${product.id}`, { name: '', price_cents: -1, category_id: 0 }, 400);
    await request('PUT', `/api/categories/${category.id}`, { name: 'X' }, 401, 'wrong');
    await request('GET', '/api/products/1oops', undefined, 400);
    await request('PUT', '/api/products', {}, 405);
    await request('GET', '/not-found', undefined, 404);
    const malformed = await fetch(base + '/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Admin-Token': 'test-only-token' }, body: '{' });
    assert.equal(malformed.status, 400);
    const media = await fetch(base + '/api/categories', { method: 'POST', headers: { 'X-Admin-Token': 'test-only-token' }, body: '{}' });
    assert.equal(media.status, 415);
    await request('POST', '/api/categories', { name: 'x'.repeat(17000) }, 413);
    await request('POST', '/api/categories', JSON.parse('{"name":"X","__proto__":{}}'), 400);
  });
  await t.test('09 POST backup verificable y coherente con WAL', async () => {
    [backup] = await request('POST', '/api/database/backup');
    assert.ok(existsSync(join(dataDir, 'backups', backup.filename)));
    const copy = new DatabaseSync(join(dataDir, 'backups', backup.filename), { readOnly: true });
    assert.equal(copy.prepare('PRAGMA integrity_check').get().integrity_check, 'ok');
    assert.equal(copy.prepare('SELECT count(*) AS n FROM products').get().n, 1);
    copy.close();
  });
  await t.test('Persistencia al reiniciar', async () => {
    await new Promise(resolve => app.server.close(resolve));
    app = createApp({ dataDir, adminToken: 'test-only-token' });
    await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
    base = `http://127.0.0.1:${app.server.address().port}`;
    assert.deepEqual((await request('GET', `/api/products/${product.id}`))[0], product);
  });
  await t.test('10 DELETE products', async () => { await request('DELETE', `/api/products/${product.id}`); await request('GET', `/api/products/${product.id}`, undefined, 404); });
  await t.test('11 DELETE categories', async () => { await request('DELETE', `/api/categories/${category.id}`); });
  await t.test('12 DELETE database preserva tablas y respaldos', async () => {
    const [c] = await request('POST', '/api/categories', { name: 'Segunda' }, 201);
    await request('POST', '/api/products', { name: 'X', price_cents: 0, category_id: c.id }, 201);
    const [counts] = await request('DELETE', '/api/database', { confirmation: 'VACIAR' });
    assert.deepEqual(counts, { deleted_products: 1, deleted_categories: 1 });
    assert.deepEqual(await request('GET', '/api/products'), []);
    assert.deepEqual(await request('GET', '/api/categories'), []);
    assert.ok(existsSync(join(dataDir, 'backups', backup.filename)));
    await request('POST', '/api/categories', { name: 'Después del vaciado' }, 201);
  });
  await t.test('Socket TCP 6061: insert y get comparten la misma SQLite', async () => {
    await new Promise(resolve => app.tcpServer.listen(0, '127.0.0.1', resolve));
    const port = app.tcpServer.address().port;
    const command = text => new Promise((resolve, reject) => {
      const socket = createConnection({ host: '127.0.0.1', port }, () => socket.write(text + '\n'));
      let output = '';
      socket.setEncoding('utf8');
      socket.on('data', chunk => {
        output += chunk;
        if (output.includes('\n')) { socket.end(); resolve(JSON.parse(output.trim())); }
      });
      socket.on('error', reject);
    });
    const insertedCategory = await command('{insert:{"name":"Socket TCP"}}');
    assert.equal(insertedCategory.statusCode, 201);
    const categoryId = insertedCategory.data[0].id;
    const productBody = { name: 'Adaptador TCP', price_cents: 6061, category_id: categoryId };
    const insertedProduct = await command(`{insert:${JSON.stringify(productBody)}}`);
    assert.equal(insertedProduct.statusCode, 201);
    const byBody = await command(`{get:${JSON.stringify(productBody)}}`);
    assert.equal(byBody.statusCode, 200);
    assert.equal(byBody.data[0].name, 'Adaptador TCP');
    const byId = await command(`{get:{"entity":"product","id":${insertedProduct.data[0].id}}}`);
    assert.deepEqual(byId.data, insertedProduct.data);
  });
});
