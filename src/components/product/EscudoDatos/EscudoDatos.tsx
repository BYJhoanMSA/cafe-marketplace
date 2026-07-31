// src/components/product/EscudoDatos/EscudoDatos.tsx
// VERSIÓN PREVIEW (reversible) — Replica del "escudo de datos" de styledk/producto.html
// (Casa del Cafeto · palacio renacentista). CSS, tipografía y colores copiados de styledk.
// Para revertir: eliminar esta carpeta y el bloque "ESCUDO DE DATOS" en el PDP.

import styles from './EscudoDatos.module.css'

export interface EscudoDatosItem {
  label: string
  value: string
}

export function EscudoDatos({ data }: { data: EscudoDatosItem[] }) {
  return (
    <dl className={styles.escudoDatos}>
      {data.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value || '—'}</dd>
        </div>
      ))}
    </dl>
  )
}
