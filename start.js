const fs = require('fs')
const path = require('path')

function loadEnvFile(filePath, override = true) {
  if (!fs.existsSync(filePath)) return
  const content = fs.readFileSync(filePath, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex).trim()
    let value = trimmed.slice(eqIndex + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (override || !process.env[key]) {
      process.env[key] = value
    }
  }
}

process.on('SIGINT', () => process.exit(0))
process.on('SIGTERM', () => process.exit(0))

const root = __dirname

loadEnvFile(path.join(root, '.env.production'), false)
loadEnvFile(path.join(root, '.env.production.local'), true)

// Validar que los secrets críticos no sean placeholders
const REQUIRED_SECRETS = ['AUTH_SECRET', 'DATABASE_URL']
for (const key of REQUIRED_SECRETS) {
  const val = process.env[key]
  if (!val || val.includes('openssl-rand') || val.includes('placeholder') || val.includes('usuario:password')) {
    console.error(`[start] ERROR: ${key} no está configurado correctamente (placeholder detectado)`)
    console.error(`[start] Asegúrate de que .env.production.local exista y tenga los valores reales`)
    process.exit(1)
  }
}

require('./.next/standalone/server.js')
