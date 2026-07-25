#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/tmp/cafe-uploads-backup"
UPLOADS_DIR="public/uploads"

echo "=== Respaldando imagenes subidas ==="
if [ -d "$UPLOADS_DIR" ] && [ "$(find "$UPLOADS_DIR" -type f 2>/dev/null | head -1)" ]; then
  rm -rf "$BACKUP_DIR"
  cp -r "$UPLOADS_DIR" "$BACKUP_DIR"
  echo "  Respaldadas $(find "$UPLOADS_DIR" -type f | wc -l) imagenes"
else
  echo "  No hay imagenes que respaldar"
fi

echo "=== Deteniendo proceso anterior ==="
pm2 stop cafe-marketplace 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
sleep 2

echo "=== Construyendo aplicacion ==="
NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 npm run build

echo "=== Restaurando imagenes subidas ==="
if [ -d "$BACKUP_DIR" ]; then
  mkdir -p "$UPLOADS_DIR"
  cp -r "$BACKUP_DIR"/* "$UPLOADS_DIR"/
  rm -rf "$BACKUP_DIR"
  echo "  Imagenes restauradas"
fi

echo "=== Iniciando servidor ==="
NODE_ENV=production pm2 start pm2.ecosystem.config.cjs

echo "=== Despliegue completado ==="
pm2 status
