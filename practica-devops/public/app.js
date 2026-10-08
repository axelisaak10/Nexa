const examples = { CategoryInput: { name: 'Electrónica' }, ProductInput: { name: 'Teclado', price_cents: 59900, category_id: 1 }, ClearInput: { confirmation: 'VACIAR' } };
const select = document.querySelector('#endpoint');
const result = document.querySelector('#result');
let operations = [];
async function init() {
  const spec = await (await fetch('/openapi.json')).json();
  for (const [path, methods] of Object.entries(spec.paths)) for (const [method, operation] of Object.entries(methods)) {
    const ref = operation.requestBody?.content['application/json'].schema.$ref.split('/').pop();
    operations.push({ path, method: method.toUpperCase(), body: examples[ref], summary: operation.summary });
  }
  operations.forEach((op, index) => {
    const option = document.createElement('option'); option.value = index; option.textContent = `${op.method} ${op.path}`; select.append(option);
    const row = document.createElement('tr');
    [op.method, op.path, op.summary].forEach(value => { const cell = document.createElement('td'); cell.textContent = value; row.append(cell); });
    document.querySelector('#routes').append(row);
  });
  select.addEventListener('change', () => { document.querySelector('#body').value = JSON.stringify(operations[select.value].body || {}, null, 2); });
  const health = await fetch('/api/health');
  document.querySelector('#health').textContent = health.ok
    ? await health.text()
    : 'Servicio no disponible';
}
document.querySelector('#send').addEventListener('click', async event => {
  const op = operations[select.value]; if (!op) return;
  if (op.path === '/api/database' && !window.confirm('¿Vaciar todos los productos y categorías de esta base de datos?')) return;
  event.target.disabled = true;
  try {
    const headers = {};
    if (op.method !== 'GET') headers['X-Admin-Token'] = document.querySelector('#token').value;
    if (op.body) headers['Content-Type'] = 'application/json';
    const path = op.path.replace('{id}', encodeURIComponent(document.querySelector('#id').value));
    const response = await fetch(path, { method: op.method, headers, body: op.body ? document.querySelector('#body').value : undefined });
    result.textContent = JSON.stringify(await response.json(), null, 2);
    document.querySelector('#result-status').textContent = `${op.method} ${path} · HTTP ${response.status} · ${new Date().toLocaleString('es-MX')}`;
  } catch (error) { result.textContent = error.message; }
  finally { event.target.disabled = false; }
});
init().catch(error => { document.querySelector('#health').textContent = 'No se pudo conectar'; result.textContent = error.message; });
