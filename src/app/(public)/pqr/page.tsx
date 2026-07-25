import type { Metadata } from 'next'
import { ChatTeardrop, ThumbsUp, Warning, EnvelopeSimple, Phone, Clock } from '@phosphor-icons/react'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'PQR — Cafe Seleccion',
  description:
    'Presenta tus peticiones, quejas, reclamos o sugerencias. Estamos comprometidos con brindarte la mejor experiencia de café de especialidad.',
}

const PQR_CATEGORIES = [
  {
    icon: Warning,
    title: 'Quejas y Reclamos',
    desc: '¿El producto llegó en mal estado, incompleto o incorrecto? Te ayudamos a resolverlo de inmediato.',
    responseTime: 'Respuesta en menos de 24 horas',
  },
  {
    icon: ThumbsUp,
    title: 'Sugerencias',
    desc: '¿Tienes una idea para mejorar? Valoramos tu opinión para ofrecerte un mejor servicio cada día.',
    responseTime: 'Respuesta en menos de 48 horas',
  },
  {
    icon: ChatTeardrop,
    title: 'Peticiones',
    desc: 'Solicita información sobre nuestros productos, procesos de tostión, trazabilidad o cualquier otra inquietud.',
    responseTime: 'Respuesta en menos de 72 horas',
  },
]

const CONTACT_CHANNELS = [
  {
    icon: EnvelopeSimple,
    title: 'Correo electrónico',
    value: 'pqr@cafeseleccion.co',
    desc: 'Respuesta en 24–72 horas hábiles',
  },
  {
    icon: Phone,
    title: 'Línea de atención',
    value: '01-8000-123-456',
    desc: 'Lun–Vie, 8:00 AM – 6:00 PM',
  },
  {
    icon: Clock,
    title: 'WhatsApp',
    value: '+57 300 123 45 67',
    desc: 'Respuesta inmediata en horario laboral',
  },
]

const FAQ_DATA = [
  {
    q: '¿Cuánto tiempo tengo para presentar un reclamo?',
    r: 'Tienes hasta 7 días hábiles después de recibir tu pedido para reportar cualquier novedad.',
  },
  {
    q: '¿Qué datos necesito para radicar una PQR?',
    r: 'Número de pedido, nombre completo, correo electrónico y una descripción detallada del caso. Opcionalmente puedes adjuntar fotos o videos.',
  },
  {
    q: '¿En cuánto tiempo recibo respuesta?',
    r: 'Las quejas y reclamos se responden en máximo 24 horas. Las peticiones y sugerencias en máximo 72 horas.',
  },
  {
    q: '¿Puedo hacer seguimiento a mi PQR?',
    r: 'Sí. Al radicar tu caso recibirás un número de ticket. Puedes darle seguimiento respondiendo al mismo correo o a través de nuestra línea de atención.',
  },
]

export default function PQRPage() {
  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>
            <span className={styles.heroEyebrowLine} />
            Atención al Cliente
          </p>
          <h1 className={styles.heroTitle}>PQR</h1>
          <p className={styles.heroSubtitle}>
            Peticiones, Quejas, Reclamos y Sugerencias. Escuchamos cada voz porque
            cada taza importa. Estamos aquí para ayudarte.
          </p>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>¿Qué necesitas?</p>
            <h2 className={styles.sectionTitle}>Selecciona el tipo de solicitud</h2>
            <p className={styles.sectionDesc}>
              Elige la categoría que mejor describa tu caso para que podamos
              atenderte de forma más ágil y precisa.
            </p>
          </div>
          <div className={styles.cardGrid}>
            {PQR_CATEGORIES.map((cat) => (
              <div key={cat.title} className={styles.pqrCard}>
                <div className={styles.cardIcon}>
                  <cat.icon size={24} />
                </div>
                <h3 className={styles.cardTitle}>{cat.title}</h3>
                <p className={styles.cardDesc}>{cat.desc}</p>
                <p className={styles.cardResponse}>
                  <Clock size={12} />
                  {cat.responseTime}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CANALES DE CONTACTO */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Contáctanos</p>
            <h2 className={styles.sectionTitle}>Canales de Atención</h2>
            <p className={styles.sectionDesc}>
              Puedes radicar tu PQR a través de cualquiera de nuestros canales oficiales.
              Todos reciben el mismo nivel de prioridad y seguimiento.
            </p>
          </div>
          <div className={styles.channelGrid}>
            {CONTACT_CHANNELS.map((ch) => (
              <div key={ch.title} className={styles.channelCard}>
                <div className={styles.channelIcon}>
                  <ch.icon size={24} />
                </div>
                <h3 className={styles.channelTitle}>{ch.title}</h3>
                <p className={styles.channelValue}>{ch.value}</p>
                <p className={styles.channelDesc}>{ch.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORMULARIO RÁPIDO */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.formBanner}>
            <div className={styles.formBannerText}>
              <h2 className={styles.formBannerTitle}>Radica tu PQR en línea</h2>
              <p className={styles.formBannerDesc}>
                Diligencia nuestro formulario web y recibirás un número de ticket
                para hacer seguimiento a tu caso.
              </p>
            </div>
            <a href="mailto:pqr@cafeseleccion.co" className={styles.formBannerCTA}>
              Enviar correo →
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>FAQ</p>
            <h2 className={styles.sectionTitle}>Preguntas Frecuentes</h2>
          </div>
          <div className={styles.faqList}>
            {FAQ_DATA.map((faq, i) => (
              <details key={i} className={styles.faqItem}>
                <summary className={styles.faqQuestion}>{faq.q}</summary>
                <p className={styles.faqAnswer}>{faq.r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}