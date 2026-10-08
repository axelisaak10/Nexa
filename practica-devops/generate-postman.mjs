import { writeFileSync } from 'node:fs';
import { endpoints, openapi } from './contracts.mjs';
const order = [0, 2, 1, 6, 4, 5, 8, 7, 3, 9];
const input = {
  CategoryInput: '{"name":"Categoria {{$timestamp}}"}',
  ProductInput: '{"name":"Teclado","price_cents":59900,"category_id":{{categoryId}}}',
  ClearInput: '{"confirmation":"VACIAR"}',
};
const item = order.map((index, step) => {
  const [method, path, title, schema] = endpoints[index];
  const url = '{{baseUrl}}' + path.replace('{id}', path.includes('categories') ? '{{categoryId}}' : '{{productId}}');
  const expected = method === 'POST' && schema ? 201 : 200;
  const script = [
    `pm.test('HTTP ${expected}', () => pm.response.to.have.status(${expected}));`,
    'const json = pm.response.json();',
    'pm.test("Envoltura JSON", () => { pm.expect(json.statusCode).to.eql(pm.response.code); pm.expect(json.data).to.be.an("array"); pm.expect(Object.keys(json).sort()).to.eql(["data","statusCode"]); });',
  ];
  if (schema === 'CategoryInput') script.push('if (pm.response.code === 201) pm.collectionVariables.set("categoryId", json.data[0].id);');
  if (schema === 'ProductInput') script.push('if (pm.response.code === 201) pm.collectionVariables.set("productId", json.data[0].id);');
  return { name: `${step + 1}. ${title}`, request: { method, header: [
    ...(method === 'GET' ? [] : [{ key: 'X-Admin-Token', value: '{{adminToken}}' }]),
    ...(schema ? [{ key: 'Content-Type', value: 'application/json' }] : []),
  ], url, ...(schema ? { body: { mode: 'raw', raw: input[schema], options: { raw: { language: 'json' } } } } : {}) },
  event: [{ listen: 'test', script: { type: 'text/javascript', exec: script } }] };
});
writeFileSync(new URL('./postman_collection.json', import.meta.url), JSON.stringify({
  info: { name: 'Nexa DevOps — 10 endpoints', description: 'Solo para la BD dedicada a la práctica. La última petición VACÍA todos los datos. Configura baseUrl y adminToken antes de ejecutar.', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
  variable: [{ key: 'baseUrl', value: 'http://localhost:8080' }, { key: 'adminToken', value: '' }, { key: 'categoryId', value: '' }, { key: 'productId', value: '' }], item,
}, null, 2));
writeFileSync(new URL('./openapi.json', import.meta.url), JSON.stringify(openapi, null, 2));
