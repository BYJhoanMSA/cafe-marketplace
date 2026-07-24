// src/app/(public)/origenes/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Orígenes del Café',
  description: 'Explora el mapa mundial de nuestros cafés de especialidad. Descubre los perfiles de sabor de Colombia, Etiopía, Guatemala y más.',
}

// Datos mockeados de orígenes (se moverán a la DB)
const ORIGINS_DATA = [
  {
    country: 'Colombia',
    slug: 'colombia',
    description: 'Conocido por su cuerpo sedoso, acidez brillante y notas a chocolate, caramelo y frutas tropicales. El terroir andino ofrece una inmensa diversidad de microclimas.',
    productCount: 48,
    color1: '#eab308', // yellow
    color2: '#ef4444', // red
  },
  {
    country: 'Etiopía',
    slug: 'etiopia',
    description: 'La cuna del café. Famoso por sus complejos perfiles florales, notas a jazmín, bergamota y acidez cítrica tipo té. Una experiencia delicada y elegante.',
    productCount: 32,
    color1: '#22c55e', // green
    color2: '#eab308', // yellow
  },
  {
    country: 'Guatemala',
    slug: 'guatemala',
    description: 'Cafés de gran altitud cultivados en suelos volcánicos. Se caracterizan por su cuerpo completo, notas ricas a chocolate amargo, especias y manzana.',
    productCount: 24,
    color1: '#3b82f6', // blue
    color2: '#ffffff', // white
  },
  {
    country: 'Perú',
    slug: 'peru',
    description: 'El gigante orgánico de los Andes. Ofrece cafés suaves, dulces y equilibrados, con notas a nueces, vainilla y una acidez media muy agradable.',
    productCount: 18,
    color1: '#ef4444', // red
    color2: '#ffffff', // white
  },
  {
    country: 'Kenia',
    slug: 'kenia',
    description: 'Acidez brillante y jugosa. Sus cafés son famosos por las intensas notas a frutos rojos, mora, grosella negra y tomate dulce, con gran cuerpo.',
    productCount: 15,
    color1: '#000000', // black
    color2: '#ef4444', // red
  },
  {
    country: 'Costa Rica',
    slug: 'costa-rica',
    description: 'Pioneros en el procesamiento "Honey". Cafés limpios, muy dulces, con notas a miel, cítricos dulces y un final prolongado y agradable.',
    productCount: 12,
    color1: '#ffffff', // white
    color2: '#1d4ed8', // blue
  },
]

export default function OriginsPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Orígenes del mundo</h1>
        <p className={styles.description}>
          El lugar donde se cultiva el café (el terroir) define su alma. 
          Explora nuestra selección global y descubre cómo la altitud, el clima y los suelos 
          volcánicos dan forma a perfiles de sabor completamente distintos.
        </p>
      </header>

      <div className={styles.grid}>
        {ORIGINS_DATA.map((origin) => (
          <Link 
            key={origin.slug} 
            href={`/origenes/${origin.slug}`} 
            className={styles.card}
            aria-label={`Ver cafés de ${origin.country}`}
          >
            <div className={styles.imageWrapper}>
              {/* Placeholder usando un gradiente basado en los colores de su bandera/cultura */}
              <div 
                className={styles.image}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  background: `linear-gradient(135deg, ${origin.color1}, ${origin.color2})`,
                  opacity: 0.8
                }} 
              />
            </div>
            
            <div className={styles.content}>
              <h2 className={styles.country}>{origin.country}</h2>
              <p className={styles.profile}>{origin.description}</p>
              
              <div className={styles.footer}>
                <span className={styles.stats}>{origin.productCount} cafés</span>
                <span className={styles.link}>Explorar →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
