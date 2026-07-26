#!/usr/bin/env bash
set -euo pipefail

echo "=== Construyendo aplicacion ==="
NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 npm run build

echo "=== Deteniendo proceso anterior (graceful) ==="
pm2 stop cafe-marketplace 2>/dev/null || true
# Esperar a que el puerto se libere (max 10s)
for i in $(seq 1 10); do
  if ! ss -tlnp | grep -q ':3000 '; then
    break
  fi
  sleep 1
done
# Si sigue ocupado, forzar
if ss -tlnp | grep -q ':3000 '; then
  echo "=== Forzando cierre del puerto 3000 ==="
  fuser -k 3000/tcp 2>/dev/null || true
  sleep 2
fi

echo "=== Iniciando servidor ==="
pm2 delete cafe-marketplace 2>/dev/null || true
NODE_ENV=production pm2 start pm2.ecosystem.config.cjs

echo "=== Despliegue completado ==="
pm2 status
