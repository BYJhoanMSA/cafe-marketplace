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
const envLocalPath = path$env.join(__dirname, '.env.production.local')
if (fs$env.existsSync(envLocalPath)) {
  const content = fs$env.readFileSync(envLocalPath, 'utf-8')
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
    process.env[key] = value
  }
}
// ================================================================

`

let content = fs.readFileSync(serverPath, 'utf-8')

if (content.startsWith('// === INYECTADO')) {
  console.log('[inject-env-loader] already injected, skipping')
  process.exit(0)
}

fs.writeFileSync(serverPath, loaderCode + content)
console.log('[inject-env-loader] env loading injected into server.js')
