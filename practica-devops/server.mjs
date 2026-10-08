import { createServer } from 'node:http';
import { createServer as createTcpServer } from 'node:net';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { schemas, validate, openapi } from './contracts.mjs';

const here = fileURLToPath(new URL('.', import.meta.url));
class ApiError extends Error { constructor(code, message) { super(message); this.code = code; } }
export function createApp({ dataDir = process.env.DATA_DIR || join(here, 'data'), adminToken = process.env.ADMIN_TOKEN || '' } = {}) {
  mkdirSync(dataDir, { recursive: true });
  const backups = join(dataDir, 'backups');
  mkdirSync(backups, { recursive: true });
  const db = new DatabaseSync(join(dataDir, 'webapp.sqlite'));
  db.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
  db.exec(readFileSync(join(here, 'schema.sql'), 'utf8'));
  const send = (res, code, data) => {
    res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(JSON.stringify({ statusCode: code, data }));
  };
  const body = async req => {
    if ((req.headers['content-type'] || '').split(';')[0].trim().toLowerCase() !== 'application/json') throw new ApiError(415, 'Se requiere Content-Type application/json');
    const parts = []; let size = 0;
    for await (const chunk of req.iterator({ destroyOnReturn: false })) {
      size += chunk.length;
      if (size > 16384) { req.resume(); throw new ApiError(413, 'Cuerpo demasiado grande'); }
      parts.push(chunk);
    }
    try { return JSON.parse(Buffer.concat(parts).toString('utf8')); }
    catch { throw new ApiError(400, 'JSON inválido'); }
  };
  const authorize = req => {
    if (!adminToken) throw new ApiError(503, 'Configura ADMIN_TOKEN para habilitar escrituras');
    const received = Buffer.from(req.headers['x-admin-token'] || '');
    const expected = Buffer.from(adminToken);
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) throw new ApiError(401, 'Token administrativo inválido');
  };
  const parseId = text => {
    const id = Number(text);
    if (!/^\d+$/.test(text) || !Number.isSafeInteger(id) || id < 1) throw new ApiError(400, 'Identificador inválido');
    return id;
  };
  const socketResponse = (statusCode, data) => JSON.stringify({ statusCode, data }) + '\n';
  const socketCommand = message => {
    const text = message.trim();
    if (!text.startsWith('{') || !text.endsWith('}')) throw new ApiError(400, 'Formato esperado: {insert:<element>} o {get:<element>}');
    const inner = text.slice(1, -1);
    const separator = inner.indexOf(':');
    if (separator < 1) throw new ApiError(400, 'Comando TCP inválido');
    const operation = inner.slice(0, separator).trim().toLowerCase();
    let element;
    try { element = JSON.parse(inner.slice(separator + 1)); }
    catch { throw new ApiError(400, 'El elemento debe ser un objeto JSON válido'); }
    if (!element || typeof element !== 'object' || Array.isArray(element)) throw new ApiError(400, 'El elemento debe ser un objeto JSON');
    if (operation === 'insert') {
      if (validate(element, schemas.CategoryInput)) {
        const result = db.prepare('INSERT INTO categories(name) VALUES (?)').run(element.name.trim());
        return { statusCode: 201, data: [db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid)] };
      }
      if (validate(element, schemas.ProductInput)) {
        const result = db.prepare('INSERT INTO products(name, price_cents, category_id) VALUES (?, ?, ?)').run(element.name.trim(), element.price_cents, element.category_id);
        return { statusCode: 201, data: [db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid)] };
      }
      throw new ApiError(400, 'El body no cumple CategoryInput ni ProductInput');
    }
    if (operation === 'get') {
      const entity = element.entity === 'category' ? 'categories' : element.entity === 'product' ? 'products' : null;
      if (entity && Number.isSafeInteger(element.id) && element.id > 0 && Object.keys(element).length === 2) {
        const rows = db.prepare(`SELECT * FROM ${entity} WHERE id = ?`).all(element.id);
        if (!rows.length) throw new ApiError(404, 'Elemento no encontrado');
        return { statusCode: 200, data: rows };
      }
      if (validate(element, schemas.CategoryInput)) {
        const rows = db.prepare('SELECT * FROM categories WHERE name = ? COLLATE NOCASE').all(element.name.trim());
        if (!rows.length) throw new ApiError(404, 'Elemento no encontrado');
        return { statusCode: 200, data: rows };
      }
      if (validate(element, schemas.ProductInput)) {
        const rows = db.prepare('SELECT * FROM products WHERE name = ? AND price_cents = ? AND category_id = ?').all(element.name.trim(), element.price_cents, element.category_id);
        if (!rows.length) throw new ApiError(404, 'Elemento no encontrado');
        return { statusCode: 200, data: rows };
      }
      throw new ApiError(400, 'Usa el body original o {"entity":"product|category","id":1}');
    }
    throw new ApiError(400, 'Operación TCP permitida: insert o get');
  };
  const tcpServer = createTcpServer(socket => {
    socket.setEncoding('utf8');
    socket.setTimeout(15000, () => socket.destroy());
    let buffer = '';
    socket.on('data', chunk => {
      buffer += chunk;
      if (Buffer.byteLength(buffer, 'utf8') > 16384) {
        socket.end(socketResponse(413, [{ message: 'Comando demasiado grande' }]));
        return;
      }
      const messages = buffer.split(/\r?\n/);
      buffer = messages.pop();
      for (const message of messages) {
        if (!message.trim()) continue;
        try {
          const result = socketCommand(message);
          socket.write(socketResponse(result.statusCode, result.data));
        } catch (error) {
          if (error instanceof ApiError) socket.write(socketResponse(error.code, [{ message: error.message }]));
          else if (error.code === 'ERR_SQLITE_ERROR' && /constraint/i.test(error.message)) socket.write(socketResponse(409, [{ message: 'Conflicto de integridad: duplicado o relación inválida' }]));
          else { console.error(error); socket.write(socketResponse(500, [{ message: 'Error interno del servidor' }])); }
        }
      }
    });
  });
  const server = createServer(async (req, res) => {
    try {
      const path = new URL(req.url, 'http://localhost').pathname;
      const method = req.method;
      if (method === 'GET' && (path === '/' || path === '/app.js')) {
        const js = path === '/app.js';
        res.writeHead(200, { 'Content-Type': js ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8', 'X-Content-Type-Options': 'nosniff' });
        return res.end(readFileSync(join(here, js ? 'public/app.js' : 'public/index.html')));
      }
      if (method === 'GET' && path === '/openapi.json') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify(openapi, null, 2));
      }
      if (method === 'GET' && path === '/api/health') {
        db.prepare('SELECT 1').get();
        return send(res, 200, [{ message: 'hola' }]);
      }
      const collection = path.match(/^\/api\/(categories|products)(?:\/([^/]+))?$/);
      if (collection) {
        const [, table, rawId] = collection;
        const id = rawId === undefined ? null : parseId(rawId);
        if (method === 'GET' && (id === null || table === 'products')) {
          const rows = id === null ? db.prepare(`SELECT * FROM ${table} ORDER BY id`).all() : db.prepare(`SELECT * FROM ${table} WHERE id = ?`).all(id);
          if (id !== null && !rows.length) throw new ApiError(404, 'Producto no encontrado');
          return send(res, 200, rows);
        }
        if (method === 'POST' && id === null) {
          authorize(req);
          const input = await body(req);
          if (!validate(input, schemas[table === 'categories' ? 'CategoryInput' : 'ProductInput'])) throw new ApiError(400, 'El cuerpo no cumple el JSON Schema');
          const result = table === 'categories'
            ? db.prepare('INSERT INTO categories(name) VALUES (?)').run(input.name.trim())
            : db.prepare('INSERT INTO products(name, price_cents, category_id) VALUES (?, ?, ?)').run(input.name.trim(), input.price_cents, input.category_id);
          return send(res, 201, [db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(result.lastInsertRowid)]);
        }
        if (method === 'PUT' && id !== null) {
          authorize(req);
          const input = await body(req);
          if (!validate(input, schemas[table === 'categories' ? 'CategoryInput' : 'ProductInput'])) throw new ApiError(400, 'El cuerpo no cumple el JSON Schema');
          const row = table === 'categories'
            ? db.prepare('UPDATE categories SET name = ? WHERE id = ? RETURNING *').get(input.name.trim(), id)
            : db.prepare('UPDATE products SET name = ?, price_cents = ?, category_id = ? WHERE id = ? RETURNING *').get(input.name.trim(), input.price_cents, input.category_id, id);
          if (!row) throw new ApiError(404, 'Registro no encontrado');
          return send(res, 200, [row]);
        }
        if (method === 'DELETE' && id !== null) {
          authorize(req);
          const row = db.prepare(`DELETE FROM ${table} WHERE id = ? RETURNING *`).get(id);
          if (!row) throw new ApiError(404, 'Registro no encontrado');
          return send(res, 200, [row]);
        }
        throw new ApiError(405, 'Método no permitido para esta ruta');
      }
      if (method === 'POST' && path === '/api/database/backup') {
        authorize(req);
        const filename = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID()}.sqlite`;
        // VACUUM INTO crea una copia coherente, incluyendo datos del WAL.
        db.prepare('VACUUM INTO ?').run(join(backups, filename));
        return send(res, 200, [{ filename, bytes: statSync(join(backups, filename)).size }]);
      }
      if (method === 'DELETE' && path === '/api/database') {
        authorize(req);
        if (!validate(await body(req), schemas.ClearInput)) throw new ApiError(400, 'Confirma con {"confirmation":"VACIAR"}');
        db.exec('BEGIN IMMEDIATE');
        try {
          const products = db.prepare('DELETE FROM products').run().changes;
          const categories = db.prepare('DELETE FROM categories').run().changes;
          db.exec('COMMIT');
          return send(res, 200, [{ deleted_products: products, deleted_categories: categories }]);
        } catch (error) { db.exec('ROLLBACK'); throw error; }
      }
      throw new ApiError(404, 'Ruta no encontrada');
    } catch (error) {
      if (error instanceof ApiError) return send(res, error.code, [{ message: error.message }]);
      if (error.code === 'ERR_SQLITE_ERROR' && /constraint/i.test(error.message)) return send(res, 409, [{ message: 'Conflicto de integridad: duplicado o relación inválida' }]);
      console.error(error);
      if (!res.headersSent) send(res, 500, [{ message: 'Error interno del servidor' }]);
    }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  let dbClosed = false;
  const closeDatabaseWhenStopped = () => {
    if (!dbClosed && !server.listening && !tcpServer.listening) { db.close(); dbClosed = true; }
  };
  server.on('close', closeDatabaseWhenStopped);
  tcpServer.on('close', closeDatabaseWhenStopped);
  return { server, tcpServer, db };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { server, tcpServer } = createApp();
  const port = Number(process.env.PORT || 8080);
  const socketPort = Number(process.env.SOCKET_PORT || 6061);
  server.listen(port, '0.0.0.0', () => console.log(`Nexa API disponible en http://localhost:${port}`));
  tcpServer.listen(socketPort, '0.0.0.0', () => console.log(`Nexa Socket TCP disponible en 0.0.0.0:${socketPort}`));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { server.close(); tcpServer.close(); });
}
