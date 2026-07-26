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

const root = __dirname

loadEnvFile(path.join(root, '.env.production'), false)
loadEnvFile(path.join(root, '.env.production.local'), true)

require('./.next/standalone/server.js')
