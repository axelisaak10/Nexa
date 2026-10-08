#!/usr/bin/env bash
set -euo pipefail
image="${1:?Uso: bash run-ec2.sh TU_USUARIO/webapp:latest}"
if sudo docker container inspect webapp-container >/dev/null 2>&1; then
  echo 'Ya existe webapp-container. Revisa y conserva sus datos antes de reemplazarlo.' >&2
  exit 1
fi
read -rsp 'Token administrativo nuevo (mínimo 24 caracteres): ' ADMIN_TOKEN
echo
if [ "${#ADMIN_TOKEN}" -lt 24 ]; then echo 'Token demasiado corto.' >&2; exit 1; fi
export ADMIN_TOKEN
sudo docker pull "$image"
# sudo recibe solo esta variable; el secreto no se escribe en el script.
sudo --preserve-env=ADMIN_TOKEN docker run -d --name webapp-container \
  --restart unless-stopped -p 8080:80 -p 6061:6061 -e ADMIN_TOKEN \
  -v webapp-data:/data "$image"
unset ADMIN_TOKEN
sudo docker ps --filter name=webapp-container
