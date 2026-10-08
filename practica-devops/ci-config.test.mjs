import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const root = resolve(here, '..');
const read = path => readFileSync(join(root, path), 'utf8');
const workflow = read('.github/workflows/main.yml');
const dockerfile = read('Dockerfile');
const dockerignore = read('.dockerignore');
const deploy = read('practica-devops/deploy/deploy-blue-green.sh');

test('Configuración CI/CD del proyecto integrador', async t => {
  await t.test('workflow atiende push y pull request de main', () => {
    assert.match(workflow, /push:[\s\S]*branches: \[main\]/);
    assert.match(workflow, /pull_request:[\s\S]*branches: \[main\]/);
  });
  await t.test('CI ejecuta pruebas con cobertura mínima', () => {
    assert.match(workflow, /npm run test:coverage/);
    assert.match(read('practica-devops/package.json'), /test-coverage-lines=70/);
  });
  await t.test('Docker Hub usa secretos y dos etiquetas', () => {
    assert.match(workflow, /secrets\.DOCKERHUB_USERNAME/);
    assert.match(workflow, /secrets\.DOCKERHUB_TOKEN/);
    assert.match(workflow, /nexa-api:latest/);
    assert.match(workflow, /nexa-api:\$\{\{ github\.sha \}\}/);
  });
  await t.test('despliegue usa secretos SSH sin direcciones incrustadas', () => {
    assert.match(workflow, /vars\.DEPLOY_ENABLED == 'true'/);
    for (const name of ['EC2_HOST', 'EC2_USER', 'EC2_SSH_KEY', 'ADMIN_TOKEN']) assert.match(workflow, new RegExp(`secrets\\.${name}`));
    assert.match(workflow, /ssh -i ~\/\.ssh\/ec2\.pem/);
    assert.doesNotMatch(workflow, /EC2_KNOWN_HOSTS/);
    assert.doesNotMatch(workflow, /\b(?:\d{1,3}\.){3}\d{1,3}\b/);
  });
  await t.test('Dockerfile usa usuario sin privilegios y healthcheck', () => {
    assert.match(dockerfile, /USER node/);
    assert.match(dockerfile, /HEALTHCHECK/);
    assert.match(dockerfile, /EXPOSE 80/);
  });
  await t.test('dockerignore aplica lista blanca y no envía secretos', () => {
    assert.equal(dockerignore.trimStart().startsWith('**'), true);
    assert.doesNotMatch(dockerignore, /!.*\.env/m);
  });
  await t.test('blue green valida salud antes de cambiar Nginx', () => {
    assert.ok(deploy.indexOf('/api/health') < deploy.indexOf('systemctl reload nginx'));
    assert.match(deploy, /nexa-blue|next=blue/);
    assert.match(deploy, /nexa-green|next=green/);
  });
});
