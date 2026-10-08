import { createConnection } from 'node:net';
import { readFileSync } from 'node:fs';

const [host = '127.0.0.1', portText = '6061', ...commandParts] = process.argv.slice(2);
let command = commandParts.join(' ');
// Windows PowerShell 5.1 puede quitar las comillas JSON de los argumentos
// enviados a programas nativos. La entrada estándar evita esa conversión.
if (!command && !process.stdin.isTTY) command = readFileSync(0, 'utf8').trim();
if (!command) {
  console.error('Uso: COMANDO | node socket-client.mjs HOST 6061');
  process.exit(2);
}
const port = Number(portText);
const socket = createConnection({ host, port }, () => socket.write(command + '\n'));
socket.setEncoding('utf8');
socket.setTimeout(10000);
let response = '';
socket.on('data', chunk => {
  response += chunk;
  if (!response.includes('\n')) return;
  process.stdout.write(response);
  socket.end();
});
socket.on('timeout', () => socket.destroy(new Error('Tiempo de espera agotado al conectar con el servidor')));
socket.on('error', error => { console.error(error.message); process.exit(1); });
