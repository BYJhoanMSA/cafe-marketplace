// scratch/smoke-web-node.mjs
// Verificación UTF-8 de las páginas públicas de turismo contra un dev server.
// Uso: node scratch/smoke-web-node.mjs http://localhost:3210

const base = process.argv[2] || 'http://localhost:3210'
const checks = [
  {
    path: '/turismo',
    needle: ['Avistamiento', 'Ruta del Café', 'Selva del Pacífico', 'Parque del Café', 'Turismo', 'Filtros'],
  },
  {
    path: '/turismo/ruta-del-cafe-tico',
    needle: ['185.000', '220.000', 'Ruta del Café Tico', 'WhatsApp', 'Solicitar información', '¿Qué incluye?', 'Itinerario', 'No incluye', 'Pereira', 'Andina'],
  },
]

for (const c of checks) {
  const res = await fetch(base + c.path)
  const html = await res.text()
  console.log(`\n=== ${c.path} (HTTP ${res.status}) ===`)
  for (const n of c.needle) {
    console.log(html.includes(n) ? `  OK: ${n}` : `  FALTA: ${n}`)
  }
}
