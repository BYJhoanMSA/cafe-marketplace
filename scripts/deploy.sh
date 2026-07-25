#!/usr/bin/env bash
set -euo pipefail

echo "=== Deteniendo proceso anterior ==="
pm2 stop cafe-marketplace 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
sleep 2

echo "=== Construyendo aplicacion ==="
npm run build

echo "=== Iniciando servidor ==="
NODE_ENV=production pm2 start pm2.ecosystem.config.cjs

echo "=== Despliegue completado ==="
pm2 status
