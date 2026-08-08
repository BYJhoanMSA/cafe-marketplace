const fs = require('fs')
const path = require('path')

const serverPath = path.join(__dirname, '..', '.next', 'standalone', 'server.js')
if (!fs.existsSync(serverPath)) {
  console.warn('[inject-env-loader] server.js not found, skipping')
  process.exit(0)
}

const loaderCode = `// === INYECTADO: carga .env.production.local antes de arrancar ===
const fs$env = require('fs')
const path$env = require('path')
const placeholderRe$env = /openssl-rand|placeholder|pendiente|^tu-|usuario:password/i
function setEnvFromFile$env(filePath, override) {
  if (!fs$env.existsSync(filePath)) return
  const content = fs$env.readFileSync(filePath, 'utf-8')
  for (const line of content.split('\\n')) {
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
    // Nunca sobrescribir con valores vacíos o placeholders: rompen secrets
    // (ej. AUTH_SECRET vacío => "MissingSecret" en Auth.js).
    if (!value || placeholderRe$env.test(value)) continue
    if (override || !process.env[key]) {
      process.env[key] = value
    }
  }
}
setEnvFromFile$env(path$env.join(__dirname, '.env.production.local'), true)
// Fallback al .env.production.local de la raíz del repo (al subir del standalone)
setEnvFromFile$env(path$env.join(__dirname, '..', '..', '.env.production.local'), false)
// ================================================================
`

let content = fs.readFileSync(serverPath, 'utf-8')

if (content.startsWith('// === INYECTADO')) {
  console.log('[inject-env-loader] already injected, skipping')
  process.exit(0)
}

fs.writeFileSync(serverPath, loaderCode + content)
console.log('[inject-env-loader] env loading injected into server.js')
