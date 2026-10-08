#!/usr/bin/env bash
set -euo pipefail

cd "${1:-$HOME/nexa}"
sudo docker build -t webapp:socket-6061 .

old_token="$(sudo docker inspect webapp-container --format '{{range .Config.Env}}{{println .}}{{end}}' | sed -n 's/^ADMIN_TOKEN=//p')"
if [ -z "$old_token" ]; then
  echo 'No se encontró ADMIN_TOKEN en el contenedor actual.' >&2
  exit 1
fi

sudo docker rm -f webapp-container
sudo docker run -d --name webapp-container \
  --restart unless-stopped \
  -p 8080:80 -p 6061:6061 \
  -e ADMIN_TOKEN="$old_token" \
  -v webapp-data:/data \
  webapp:socket-6061

sudo docker ps --filter name=webapp-container
curl --fail http://127.0.0.1:8080/api/health
echo 'Actualización lista. Prueba TCP 6061 desde el cliente autorizado.'
