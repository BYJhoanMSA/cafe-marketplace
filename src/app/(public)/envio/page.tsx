import type { Metadata } from 'next'
import Link from 'next/link'
import { Camera, Package, MessageSquare, CheckCircle, Truck, Clock, MapPin, Building2 } from 'lucide-react'
import { Ornament } from '@/components/ui/Ornament'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Estrategia de Envío — Cafe Seleccion',
  description:
    'Conoce cómo llega tu café a casa: proceso de envío, transportadoras, cobertura y tiempos de entrega.',
}

// Marquesina decorativa de marca (solo visual)
const MARQUEE_ITEMS = [
  'Envío a todo Colombia',
  'Verificación visual',
  'Foto de la guía',
  'Seguimiento',
  'Tueste a pedido',
  'Frescura garantizada',
]

const LOGISTICS_STEPS = [
  {
    number: 1,
    title: 'Coordinamos contigo',
    desc: 'Confirmamos los detalles de tu pedido por WhatsApp antes de despachar. La comunicación directa hace parte de nuestra experiencia de servicio.',
  },
  {
    number: 2,
    title: 'Preparamos tu envío',
    desc: 'Antes de empacar te enviamos una fotografía de los productos que recibirás. Así verificas que todo corresponde exactamente a tu compra.',
  },
  {
    number: 3,
    title: 'Entregamos a la transportadora',
    desc: 'Despachamos tu pedido mediante empresas reconocidas como Servientrega, Envía e Inter Rapidísimo.',
  },
  {
    number: 4,
    title: 'Te enviamos la guía',
    desc: 'Recibes una fotografía de la guía de envío el mismo día del despacho para que puedas realizar el seguimiento de tu pedido.',
  },
  {
    number: 5,
    title: 'Seguimiento hasta la entrega',
    desc: 'Permanecimos atentos durante el transporte para ayudarte en caso de cualquier novedad. Nuestro compromiso no termina cuando despachamos.',
  },
]

const CARRIERS = [
  {
    icon: Truck,
    title: 'Servientrega',
    desc: 'Cobertura nacional con seguimiento en línea.',
  },
  {
    icon: Package,
    title: 'Envía',
    desc: 'Entrega confiable para zonas urbanas y rurales.',
  },
  {
    icon: Building2,
    title: 'Inter Rapidísimo',
    desc: 'Alternativa ágil con múltiples puntos de entrega.',
  },
]

const SHIPPING_GUARANTEES = [
  {
    icon: Camera,
    title: 'Verificación visual',
    desc: 'Ves el producto real antes de que salga hacia tu casa.',
  },
  {
    icon: Package,
    title: 'Guía al instante',
    desc: 'Recibes la foto de la guía de envío el mismo día del despacho.',
  },
  {
    icon: MessageSquare,
    title: 'Atención personalizada',
    desc: 'Hablas con personas, no con un chatbot.',
  },
  {
    icon: CheckCircle,
    title: 'Acompañamiento completo',
    desc: 'Te acompañamos desde que despachamos hasta que recibes tu café.',
  },
]

export default function EnvioPage() {
  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroGrain} aria-hidden="true" />
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>
            <span className={styles.heroEyebrowLine} />
            Envío y entrega
          </p>
          <h1 className={styles.heroTitle}>Estrategia de Envío</h1>
          <p className={styles.heroSubtitle}>
            Tu café sale del origen con un proceso cuidado y llega a tu casa
            con seguimiento, verificación y atención cercana.
          </p>
          <Ornament tone="light" className={styles.heroOrnament} />
        </div>
      </section>

      {/* MARQUESINA DE MARCA (decorativa) */}
      <section className={styles.marquee} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          {[0, 1].map((dup) => (
            <div key={dup} className={styles.marqueeGroup}>
              {MARQUEE_ITEMS.map((item) => (
                <span key={item} className={styles.marqueeItem}>{item}</span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* AVISO IMPORTANTE */}
      <section className={styles.alertBanner}>
        <div className={styles.sectionInner}>
          <div className={styles.alertContent}>
            <p className={styles.alertLabel}>Importante</p>
            <p className={styles.alertText}>
              Nuestros precios no incluyen el envío. El costo de envío se calcula
              al momento de finalizar tu compra según la dirección de entrega y el
              método seleccionado.
            </p>
          </div>
        </div>
      </section>

      {/* CÓMO LLEGA TU PEDIDO */}
      <section className={styles.section} aria-labelledby="logistics-title">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Proceso de envío</p>
            <h2 className={styles.sectionTitle} id="logistics-title">
              Cómo llega tu pedido
            </h2>
            <Ornament className={styles.sectionOrnament} />
          </div>
          <div className={styles.processList}>
            {LOGISTICS_STEPS.map((step) => (
              <div key={step.number} className={styles.processStep}>
                <div className={styles.stepNumber}>{step.number}</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COBERTURA Y TRANSPORTADORAS */}
      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="coverage-title">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Cobertura</p>
            <h2 className={styles.sectionTitle} id="coverage-title">
              Enviamos a todo Colombia
            </h2>
            <Ornament className={styles.sectionOrnament} />
          </div>
          <div className={styles.coverageRow}>
            <div className={styles.coverageNote}>
              <span className={styles.coverageIcon}>
                <MapPin size={22} strokeWidth={1.8} />
              </span>
              <p>
                Trabajamos con empresas transportadoras de cobertura nacional
                para que tu café llegue sin importar dónde te encuentres.
              </p>
            </div>
            <div className={styles.carrierGrid}>
              {CARRIERS.map((carrier) => (
                <div key={carrier.title} className={styles.carrierCard}>
                  <span className={styles.carrierIcon}>
                    <carrier.icon size={22} strokeWidth={1.8} />
                  </span>
                  <h3 className={styles.carrierTitle}>{carrier.title}</h3>
                  <p className={styles.carrierDesc}>{carrier.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TIEMPOS DE ENTREGA */}
      <section className={styles.section} aria-labelledby="times-title">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Tiempos</p>
            <h2 className={styles.sectionTitle} id="times-title">
              Los tiempos de entrega pueden variar?
            </h2>
            <Ornament className={styles.sectionOrnament} />
          </div>
          <div className={styles.timesCard}>
            <span className={styles.timesIcon}>
              <Clock size={24} strokeWidth={1.8} />
            </span>
            <div>
              <p>
                Sí. Al trabajar directamente con productores independientes, algunos
                pedidos pueden requerir un poco más de tiempo para ser preparados.
              </p>
              <p>
                Preferimos invertir unas horas adicionales verificando la calidad y
                disponibilidad del producto antes que enviarte información incorrecta
                o cancelar tu compra después del pago.
              </p>
              <p className={styles.timesClosing}>Creemos que la transparencia genera confianza.</p>
            </div>
          </div>
        </div>
      </section>

      {/* GARANTÍAS DEL ENVÍO */}
      <section className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="guarantees-title">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Garantías</p>
            <h2 className={styles.sectionTitle} id="guarantees-title">
              Tu envío protegido
            </h2>
            <Ornament className={styles.sectionOrnament} />
          </div>
          <div className={styles.valueGrid}>
            {SHIPPING_GUARANTEES.map((prop) => (
              <div key={prop.title} className={styles.valueCard}>
                <span className={styles.valueIcon}>
                  <prop.icon size={22} strokeWidth={1.8} />
                </span>
                <h3 className={styles.valueTitle}>{prop.title}</h3>
                <p className={styles.valueDesc}>{prop.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BANNER CTA */}
      <section className={styles.banner}>
        <div className={styles.bannerBg} aria-hidden="true" />
        <div className={styles.bannerInner}>
          <h2 className={styles.bannerTitle}>¿Tienes dudas sobre tu pedido?</h2>
          <p className={styles.bannerText}>
            Resuelve tus preguntas sobre compras, pagos y envíos en nuestro Centro de Ayuda.
          </p>
          <Link href="/pqr" className={styles.bannerCTA}>
            Ir al Centro de Ayuda →
          </Link>
        </div>
      </section>
    </>
  )
}
