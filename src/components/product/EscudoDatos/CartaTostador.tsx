// src/components/product/EscudoDatos/CartaTostador.tsx
// VERSIÓN PREVIEW (reversible) — Replica de la "carta del tostador" de
// styledk/producto.html (Casa del Cafeto). Presenta la descripción del café.

import styles from './EscudoDatos.module.css'

interface CartaTostadorProps {
  text: string
  roaster?: string
}

export function CartaTostador({ text, roaster }: CartaTostadorProps) {
  return (
    <blockquote className={styles.carta}>
      <p>«{text}»</p>
      {roaster && (
        <footer>— {roaster}, maestro tostador</footer>
      )}
    </blockquote>
  )
}
