#!/usr/bin/env bash
set -euo pipefail

: "${IMAGE:?La variable IMAGE es obligatoria}"
BASE=/opt/nexa
ACTIVE_FILE="$BASE/active-color"
sudo mkdir -p "$BASE"

if ! command -v docker >/dev/null 2>&1; then
  echo 'Docker no está instalado. Ejecuta deploy/install-docker-ubuntu.sh primero.' >&2
  exit 1
fi

if ! command -v nginx >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y nginx curl
  sudo systemctl enable --now nginx
fi

active=$(sudo cat "$ACTIVE_FILE" 2>/dev/null || echo green)
if [ "$active" = blue ]; then
  next=green; old=blue; port=18081
else
  next=blue; old=green; port=18080
fi

sudo docker pull "$IMAGE"
sudo docker rm -f "nexa-$next" >/dev/null 2>&1 || true
sudo docker run -d --name "nexa-$next" \
  --restart unless-stopped \
  --env-file "$BASE/admin.env" \
  -p "127.0.0.1:$port:80" \
  -v nexa-api-data:/data \
  "$IMAGE"

healthy=false
for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:$port/api/health" >/dev/null; then healthy=true; break; fi
  sleep 2
done
if [ "$healthy" != true ]; then
  sudo docker logs "nexa-$next" || true
  sudo docker rm -f "nexa-$next" || true
  echo 'La nueva versión no superó el health check.' >&2
  exit 1
fi

cat <<EOF | sudo tee "$BASE/nexa-api.nginx.new" >/dev/null
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    location / {
        proxy_pass http://127.0.0.1:$port;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
sudo mv "$BASE/nexa-api.nginx.new" /etc/nginx/sites-available/nexa-api
sudo ln -sfn /etc/nginx/sites-available/nexa-api /etc/nginx/sites-enabled/nexa-api
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
echo "$next" | sudo tee "$ACTIVE_FILE" >/dev/null
sudo docker rm -f "nexa-$old" >/dev/null 2>&1 || true
sudo docker image prune -f >/dev/null
curl -fsS http://127.0.0.1/api/health
echo
echo "Desplegada $IMAGE en color $next mediante el puerto interno $port."
