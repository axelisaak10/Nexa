// JSON Schema 2020-12: el mismo contrato alimenta validación y documentación.
const integer = { type: 'integer', minimum: 1, maximum: Number.MAX_SAFE_INTEGER };
const name = maxLength => ({ type: 'string', minLength: 1, maxLength, pattern: '\\S' });
const object = properties => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
export const schemas = {
  CategoryInput: object({ name: name(80) }),
  ProductInput: object({ name: name(120), price_cents: { ...integer, minimum: 0 }, category_id: integer }),
  ClearInput: object({ confirmation: { type: 'string', const: 'VACIAR' } }),
  Category: object({ id: integer, name: name(80) }),
  Product: object({ id: integer, name: name(120), price_cents: { ...integer, minimum: 0 }, category_id: integer }),
  Health: object({ service: { type: 'string' }, database: { type: 'string' } }),
  Backup: object({ filename: { type: 'string' }, bytes: { type: 'integer', minimum: 1 } }),
  Cleared: object({ deleted_products: { type: 'integer', minimum: 0 }, deleted_categories: { type: 'integer', minimum: 0 } }),
  Error: object({ message: { type: 'string' } }),
};
export function envelope(item) {
  return object({ statusCode: { type: 'integer', minimum: 100, maximum: 599 }, data: { type: 'array', items: { $ref: `#/components/schemas/${item}` } } });
}
export const endpoints = [
  ['GET', '/api/health', 'Estado del servicio', null, 'Health'],
  ['GET', '/api/categories', 'Listar categorías', null, 'Category'],
  ['POST', '/api/categories', 'Crear categoría', 'CategoryInput', 'Category'],
  ['PUT', '/api/categories/{id}', 'Actualizar categoría', 'CategoryInput', 'Category'],
  ['DELETE', '/api/categories/{id}', 'Eliminar categoría sin productos', null, 'Category'],
  ['GET', '/api/products', 'Listar productos', null, 'Product'],
  ['GET', '/api/products/{id}', 'Consultar producto', null, 'Product'],
  ['POST', '/api/products', 'Crear producto', 'ProductInput', 'Product'],
  ['PUT', '/api/products/{id}', 'Actualizar producto', 'ProductInput', 'Product'],
  ['DELETE', '/api/products/{id}', 'Eliminar producto', null, 'Product'],
  ['POST', '/api/database/backup', 'Respaldar SQLite', null, 'Backup'],
  ['DELETE', '/api/database', 'Vaciar datos conservando estructura', 'ClearInput', 'Cleared'],
];
export const openapi = { openapi: '3.1.0', info: { title: 'Nexa API de práctica DevOps', version: '1.0.0' },
  components: { schemas, securitySchemes: { AdminToken: { type: 'apiKey', in: 'header', name: 'X-Admin-Token' } } }, paths: {} };
for (const [method, path, summary, input, output] of endpoints) {
  const code = method === 'POST' && input ? '201' : '200';
  const response = item => ({ description: item, content: { 'application/json': { schema: envelope(item) } } });
  const operation = { summary, responses: { [code]: response(output), default: response('Error') } };
  if (method !== 'GET') operation.security = [{ AdminToken: [] }];
  if (input) operation.requestBody = { required: true, content: { 'application/json': { schema: { $ref: `#/components/schemas/${input}` } } } };
  if (path.includes('{id}')) operation.parameters = [{ name: 'id', in: 'path', required: true, schema: integer }];
  (openapi.paths[path] ??= {})[method.toLowerCase()] = operation;
}
// Validador del subconjunto de JSON Schema usado en los cuerpos de esta API.
export function validate(value, schema) {
  if (schema.type === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    if (schema.required.some(key => !(key in value))) return false;
    if (Object.keys(value).some(key => !Object.hasOwn(schema.properties, key))) return false;
    return Object.entries(schema.properties).every(([key, rule]) => validate(value[key], rule));
  }
  if (schema.type === 'string') return typeof value === 'string' &&
    (schema.const === undefined || value === schema.const) &&
    (schema.minLength === undefined || [...value].length >= schema.minLength) &&
    (schema.maxLength === undefined || [...value].length <= schema.maxLength) &&
    (!schema.pattern || new RegExp(schema.pattern).test(value));
  if (schema.type === 'integer') return Number.isSafeInteger(value) && value >= schema.minimum && value <= schema.maximum;
  return false;
}
