# Proyecto integrador CI/CD para API REST

API REST de catálogo construida con Node.js 22 y SQLite. Incluye pruebas automatizadas, cobertura obligatoria, imagen Docker y despliegue blue-green en AWS EC2 mediante GitHub Actions.

## Arquitectura

```text
git push a main
      |
      v
GitHub Actions
  1. 17 pruebas + cobertura >= 70%
  2. Docker build
  3. Push a Docker Hub: latest y SHA
  4. SSH hacia EC2
      |
      v
AWS EC2 Ubuntu
  Nginx :80 -> contenedor blue o green -> Node.js :80 -> SQLite /data
```

El despliegue inicia la nueva versión en un puerto interno alterno, espera una respuesta saludable, cambia Nginx mediante reload y después elimina el contenedor anterior. Si el health check falla, conserva la versión activa.

## Endpoints

Todas las respuestas utilizan `{"statusCode":200,"data":[]}`.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Estado de Node.js y SQLite |
| GET | `/api/categories` | Listar categorías |
| POST | `/api/categories` | Crear categoría |
| PUT | `/api/categories/{id}` | Actualizar categoría |
| DELETE | `/api/categories/{id}` | Eliminar categoría |
| GET | `/api/products` | Listar productos |
| GET | `/api/products/{id}` | Consultar producto |
| POST | `/api/products` | Crear producto |
| PUT | `/api/products/{id}` | Actualizar producto |
| DELETE | `/api/products/{id}` | Eliminar producto |
| POST | `/api/database/backup` | Crear respaldo SQLite |
| DELETE | `/api/database` | Vaciar datos conservando estructura |

Las escrituras requieren `X-Admin-Token`. Los cuerpos usan `Content-Type: application/json`. OpenAPI está disponible en `/openapi.json`.

## Ejecución local

```powershell
cd practica-devops
$env:ADMIN_TOKEN = [guid]::NewGuid().ToString('N')
npm start
```

Abrir `http://localhost:8080/api/health`.

## Pruebas y cobertura

```powershell
cd practica-devops
npm test
npm run test:coverage
```

La segunda orden falla si líneas, funciones o ramas bajan del 70%. Resultado local verificado:

```text
tests 17
pass 17
fail 0
all files: lines 92.48%, branches 87.50%, functions 92.45%
```

La suite crea una base temporal. Comprueba los 12 endpoints, errores de validación, autenticación, duplicados, llaves foráneas, respaldo, persistencia y Socket TCP.

## Docker local

Ejecutar desde la raíz del repositorio:

```powershell
docker build -t nexa-api:local .
docker run -d --name nexa-api -p 8080:80 -e ADMIN_TOKEN="token-local-seguro" -v nexa-api-data:/data nexa-api:local
curl.exe http://localhost:8080/api/health
```

El Dockerfile usa una imagen slim, ejecuta Node.js como usuario sin privilegios, incluye health check y conserva SQLite en `/data`. `.dockerignore` excluye los archivos que no forman parte de la imagen, incluidos `.env`, Git, reportes y `node_modules`.

## Docker Hub

Crear un repositorio público llamado `nexa-api` y un Personal Access Token con permiso de lectura y escritura. El pipeline publica:

```text
USUARIO/nexa-api:latest
USUARIO/nexa-api:HASH_COMPLETO_DEL_COMMIT
```

## Preparación de AWS EC2

1. Crear una instancia Ubuntu Server.
2. Permitir TCP 22 únicamente desde la IP de administración y TCP 80 desde el origen requerido.
3. Ejecutar `deploy/install-docker-ubuntu.sh` en la instancia.
4. Confirmar que el usuario del pipeline puede ejecutar `sudo` y que su clave pública está en `~/.ssh/authorized_keys`.

La API queda disponible en `http://IP_PUBLICA/api/health`.

## GitHub Secrets obligatorios

En GitHub: Settings, Secrets and variables, Actions, New repository secret.

El despliegue a EC2 se habilita creando la variable de repositorio
`DEPLOY_ENABLED` con el valor `true`. Mientras no exista, CI publica la imagen
en Docker Hub y omite el trabajo de EC2 para evitar fallos por una conexión SSH
aún no configurada.

| Secret | Contenido |
|---|---|
| `DOCKERHUB_USERNAME` | Usuario de Docker Hub |
| `DOCKERHUB_TOKEN` | PAT de Docker Hub |
| `EC2_HOST` | IP o DNS público de EC2 |
| `EC2_USER` | Usuario SSH, normalmente `ubuntu` |
| `EC2_SSH_KEY` | Contenido completo de la clave privada PEM |
| `EC2_KNOWN_HOSTS` | Línea de `ssh-keyscan -H IP_EC2`, validada por el propietario |
| `ADMIN_TOKEN` | Token largo y aleatorio para escrituras de la API |

No colocar estos valores en archivos, capturas, commits, issues o logs.

## Flujo CI/CD

`.github/workflows/main.yml` se ejecuta en `push` y `pull_request` hacia `main`.

- Pull request: ejecuta pruebas y cobertura.
- Push a main: prueba, publica `latest` y `${{ github.sha }}`, y despliega exactamente la etiqueta SHA en EC2.
- El job de despliegue usa el environment `production` y SSH con host conocido.
- La nueva versión debe aprobar `/api/health` antes del cambio de tráfico.

## Demostración en clase

Modificar el mensaje de `GET /api/health` en `server.mjs`, ejecutar `npm run test:coverage` y después:

```powershell
git add practica-devops/server.mjs
git commit -m "demo: actualizar mensaje de health"
git push origin main
```

Mostrar en GitHub Actions las pruebas y cobertura, la publicación de ambas etiquetas, el health check, el despliegue blue-green y la URL pública actualizada.

## Seguridad

- No se versionan contraseñas, tokens, IPs ni llaves privadas.
- El contenedor se ejecuta sin privilegios.
- SSH valida `known_hosts`.
- `ADMIN_TOKEN` se almacena en EC2 con permisos 600.
- El despliegue utiliza la etiqueta inmutable del commit.
- SQLite persiste en el volumen Docker `nexa-api-data`.

## Fuentes

- GitHub Actions: https://docs.github.com/actions
- Docker Build Push Action: https://github.com/docker/build-push-action
- Docker Hub tokens: https://docs.docker.com/security/access-tokens/
- Docker Engine en Ubuntu: https://docs.docker.com/engine/install/ubuntu/
- AWS EC2: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html
- Node.js test runner: https://nodejs.org/api/test.html
