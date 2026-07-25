import type { Metadata } from 'next'
import { Package, Truck, Clock, ShieldCheck, CreditCard, MapPin } from '@phosphor-icons/react'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Estrategia de Envío — Cafe Seleccion',
  description:
    'Conoce nuestras opciones de envío: cobertura nacional, tiempos de entrega, costos y política de empaque. Café de especialidad directo a tu puerta.',
}

const SHIPPING_INFO = {
  colombia: {
    title: 'Envíos Nacionales',
    description:
      'Cubrimos todo el territorio colombiano con aliados logísticos de confianza. Tu café viaja protegido y llega fresco.',
    options: [
      {
        icon: Truck,
        title: 'Estándar',
        time: '3–5 días hábiles',
        cost: '$8.900 COP',
        note: 'Gratis en pedidos mayores a $120.000 COP',
      },
      {
        icon: Clock,
        title: 'Express',
        time: '1–2 días hábiles',
        cost: '$15.900 COP',
        note: 'Disponible en principales ciudades',
      },
      {
        icon: ShieldCheck,
        title: 'Same Day',
        time: 'Mismo día',
        cost: '$22.900 COP',
        note: 'Solo Bogotá, Medellín y Cali',
      },
    ],
  },
  internacional: {
    title: 'Envíos Internacionales',
    description:
      'Llevamos el mejor café colombiano a más de 15 países. Todos los envíos incluyen tracking y seguro.',
    options: [
      {
        icon: Package,
        title: 'Américas',
        time: '5–10 días hábiles',
        cost: 'Desde $25 USD',
        note: 'Seguro incluido',
      },
      {
        icon: Truck,
        title: 'Europa',
        time: '7–14 días hábiles',
        cost: 'Desde $35 USD',
        note: 'Seguro incluido',
      },
      {
        icon: MapPin,
        title: 'Resto del mundo',
        time: '10–20 días hábiles',
        cost: 'Desde $45 USD',
        note: 'Seguro incluido',
      },
    ],
  },
}

const PACKAGING_FEATURES = [
  { icon: Package, title: 'Empaque al vacío', desc: 'Sellado al vacío para preservar frescura y aroma por más tiempo.' },
  { icon: ShieldCheck, title: 'Protección triple', desc: 'Caja corrugada + empaque hermético + bolsa exterior impermeable.' },
  { icon: ShieldCheck, title: 'Sin impacto ambiental', desc: 'Empaques 100% reciclables y biodegradables certificados.' },
]

export default function EnvioPage() {
  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>
            <span className={styles.heroEyebrowLine} />
            Logística y Cobertura
          </p>
          <h1 className={styles.heroTitle}>Estrategia de Envío</h1>
          <p className={styles.heroSubtitle}>
            Desde el tostador hasta tu taza. Así cuidamos cada paso para que disfrutes
            el café más fresco, sin importar dónde estés.
          </p>
        </div>
      </section>

      {/* COBERTURA NACIONAL */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Cobertura</p>
            <h2 className={styles.sectionTitle}>{SHIPPING_INFO.colombia.title}</h2>
            <p className={styles.sectionDesc}>{SHIPPING_INFO.colombia.description}</p>
          </div>
          <div className={styles.cardGrid}>
            {SHIPPING_INFO.colombia.options.map((opt) => (
              <div key={opt.title} className={styles.shippingCard}>
                <div className={styles.cardIcon}>
                  <opt.icon size={24} />
                </div>
                <h3 className={styles.cardTitle}>{opt.title}</h3>
                <p className={styles.cardTime}>
                  <Clock size={14} />
                  {opt.time}
                </p>
                <p className={styles.cardCost}>{opt.cost}</p>
                <p className={styles.cardNote}>{opt.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COBERTURA INTERNACIONAL */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Internacional</p>
            <h2 className={styles.sectionTitle}>{SHIPPING_INFO.internacional.title}</h2>
            <p className={styles.sectionDesc}>{SHIPPING_INFO.internacional.description}</p>
          </div>
          <div className={styles.cardGrid}>
            {SHIPPING_INFO.internacional.options.map((opt) => (
              <div key={opt.title} className={styles.shippingCard}>
                <div className={styles.cardIcon}>
                  <opt.icon size={24} />
                </div>
                <h3 className={styles.cardTitle}>{opt.title}</h3>
                <p className={styles.cardTime}>
                  <Clock size={14} />
                  {opt.time}
                </p>
                <p className={styles.cardCost}>{opt.cost}</p>
                <p className={styles.cardNote}>{opt.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EMPAQUE */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Protección</p>
            <h2 className={styles.sectionTitle}>Empaque y Cuidado</h2>
            <p className={styles.sectionDesc}>
              Cada grano merece un viaje seguro. Nuestro sistema de empaque garantiza que
              el café llegue en las mismas condiciones que salió del tostador.
            </p>
          </div>
          <div className={styles.valueGrid}>
            {PACKAGING_FEATURES.map((feat) => (
              <div key={feat.title} className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <feat.icon size={28} />
                </div>
                <h3 className={styles.valueTitle}>{feat.title}</h3>
                <p className={styles.valueDesc}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POLÍTICAS */}
      <section className={`${styles.section} ${styles.sectionPolicy}`}>
        <div className={styles.sectionInner}>
          <div className={styles.policyGrid}>
            <div className={styles.policyCard}>
              <h3 className={styles.policyTitle}>Seguimiento de pedidos</h3>
              <p className={styles.policyText}>
                Recibirás un número de guía por email y SMS en cuanto tu pedido sea
                despachado. Puedes rastrear en tiempo real desde tu cuenta.
              </p>
            </div>
            <div className={styles.policyCard}>
              <h3 className={styles.policyTitle}>Cambios y devoluciones</h3>
              <p className={styles.policyText}>
                Si el producto llega dañado o incorrecto, lo reemplazamos sin costo.
                Contáctanos dentro de los primeros 7 días hábiles.
              </p>
            </div>
            <div className={styles.policyCard}>
              <h3 className={styles.policyTitle}>Pago contra entrega</h3>
              <p className={styles.policyText}>
                Disponible en Bogotá, Medellín, Cali y Barranquilla. Pagas en efectivo
                o datáfono al recibir tu pedido.
              </p>
            </div>
            <div className={styles.policyCard}>
              <h3 className={styles.policyTitle}>Zonas sin cobertura</h3>
              <p className={styles.policyText}>
                Si tu dirección está fuera de nuestra zona de cobertura, te notificaremos
                antes de procesar el pago para acordar una solución.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}