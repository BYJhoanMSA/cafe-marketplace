import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Heart,
  Clock,
  Truck,
  MessageSquare,
  Shield,
  Mail,
  Phone,
  Users,
} from 'lucide-react'
import { Ornament } from '@/components/ui/Ornament'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Centro de Ayuda — Cafe Seleccion',
  description:
    'Bienvenido a nuestro Centro de Ayuda. Resuelve tus dudas sobre compras, envios, tiempos y mas.',
}

// Marquesina decorativa de marca (solo visual)
const MARQUEE_ITEMS = [
  'Cómo funciona la compra',
  'Compras transparentes',
  'Pagos confirmados',
  'Envíos con seguimiento',
  'Atención humana',
  'Resolvemos tus dudas',
]

const PROCESS_STEPS = [
  {
    number: 1,
    title: 'Realizas tu pedido',
    desc: 'Escoges los cafes que deseas desde nuestra tienda.',
    image: 'farm',
  },
  {
    number: 2,
    title: 'Confirmamos disponibilidad',
    desc: 'Nos comunicamos con el productor para verificar que el producto realmente se encuentre disponible. Solo cuando esta informacion esta confirmada continuamos con el proceso.',
    image: 'beans',
  },
  {
    number: 3,
    title: 'Confirmamos el pago',
    desc: 'Una vez el pedido esta asegurado, compartimos contigo las instrucciones para realizar el pago. Asi evitamos cobros por productos agotados y posibles devoluciones de dinero.',
    image: 'cup',
  },
  {
    number: 4,
    title: 'Preparamos tu pedido',
    desc: 'Antes de empacar tu compra verificamos que todo corresponda exactamente con lo solicitado. Ademas, te enviaremos una fotografia de los productos que seran enviados.',
    image: 'package',
  },
  {
    number: 5,
    title: 'Realizamos el envio',
    desc: 'Despachamos tu pedido mediante empresas transportadoras reconocidas. Te enviaremos una fotografia de la guia para que puedas realizar el seguimiento.',
    image: 'truck',
  },
  {
    number: 6,
    title: 'Te acompanamos hasta la entrega',
    desc: 'Nuestro trabajo no termina cuando entregamos el paquete. Seguiremos disponibles para ayudarte durante todo el proceso hasta que tu cafe llegue a tus manos.',
    image: 'hands',
  },
]

const FAQ_ITEMS = [
  {
    icon: Clock,
    title: 'Por que no tenemos pagos automaticos?',
    desc: 'No queremos cobrarte por un producto que aun no hemos confirmado con el productor. Trabajamos con marcas independientes y pequenos emprendimientos que elaboran cafe artesanal. Antes de solicitar cualquier pago verificamos personalmente la disponibilidad del producto. Este proceso requiere un poco mas de tiempo, pero evita cancelaciones, devoluciones y promesas que no podamos cumplir. Preferimos una compra mas transparente antes que una compra automatica.',
  },
  {
    icon: Truck,
    title: 'Los tiempos pueden variar?',
    desc: 'Si. Cada productor tiene sus propios procesos de preparacion y despacho. Nuestro compromiso es mantenerte informado durante todo el proceso para que siempre conozcas el estado de tu pedido. La transparencia es parte de nuestro servicio.',
  },
  {
    icon: MessageSquare,
    title: 'Que pasa si tengo una duda?',
    desc: 'Nos encanta responder preguntas. Puedes escribirnos por nuestros canales oficiales y estaremos felices de ayudarte. No utilizamos respuestas automaticas para todo. Preferimos conversar contigo, entender tu caso y ofrecerte una solucion clara.',
  },
  {
    icon: Shield,
    title: 'Y si ocurre algun inconveniente?',
    desc: 'Aunque ponemos mucho cuidado en cada pedido, pueden presentarse situaciones inesperadas. Si recibes un producto diferente al solicitado, observas danos ocasionados durante el transporte o tienes alguna inquietud sobre tu compra, comunicate con nosotros. Revisaremos tu caso personalmente y trabajaremos contigo para encontrar la mejor solucion.',
  },
]

const CONTACT_CHANNELS = [
  {
    icon: Mail,
    title: 'Correo electronico',
    value: 'ayuda@cafeseleccion.co',
    desc: 'Respuesta en 24-72 horas habiles',
  },
  {
    icon: Phone,
    title: 'WhatsApp',
    value: '+57 300 123 45 67',
    desc: 'Respuesta inmediata en horario laboral',
  },
]

const RELATED_LINKS = [
  {
    icon: Truck,
    href: '/envio',
    title: 'Cómo llega tu pedido',
    desc: 'Transportadoras, cobertura y tiempos de entrega.',
  },
  {
    icon: Users,
    href: '/nosotros',
    title: 'Quiénes somos',
    desc: 'Nuestra visión, valores y compromiso con el café.',
  },
]

export default function AyudaPage() {
  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroDecor} />
        <div className={styles.heroGrain} aria-hidden="true" />
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>
            <span className={styles.heroEyebrowLine} />
            Estamos aqui para ti
          </p>
          <h1 className={styles.heroTitle}>Centro de Ayuda</h1>
          <p className={styles.heroGratitude}>Gracias por confiar en nosotros.</p>
          <p className={styles.heroSubtitle}>
            Aquí resuelves tus dudas sobre cómo funciona una compra, pagos,
            envíos y lo que puedes esperar en cada etapa.
          </p>
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

      {/* WELCOME */}
      <section className={styles.welcomeSection}>
        <div className={styles.sectionInner}>
          <div className={styles.welcomeCard}>
            <div className={styles.welcomeImage}>
              <div className={styles.welcomeIllustration} />
            </div>
            <div className={styles.welcomeText}>
              <h2 className={styles.welcomeTitle}>Bienvenido</h2>
              <p>
                Aquí encontrarás cómo funciona nuestra tienda, cómo procesamos
                los pedidos y qué puedes esperar durante cada etapa de tu compra.
              </p>
              <p>
                Nuestro objetivo es que siempre sepas qué está ocurriendo con tu
                pedido. Porque creemos que la confianza se construye con
                información clara y una comunicación cercana.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESO DE COMPRA */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeaderCentered}>
            <p className={styles.sectionEyebrow}>Proceso</p>
            <h2 className={styles.sectionTitle}>
              Cómo funciona una compra?
            </h2>
            <Ornament className={styles.sectionOrnamentCentered} />
          </div>
          <div className={styles.processGrid}>
            {PROCESS_STEPS.map((step) => (
              <div key={step.number} className={styles.processCard}>
                <div className={`${styles.stepImage} ${styles[`stepImage_${step.image}`]}`}>
                  <span className={styles.stepBadge}>{step.number}</span>
                </div>
                <div className={styles.stepBody}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEMAS RELACIONADOS */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>También te puede interesar</p>
            <h2 className={styles.sectionTitle}>
              Encuentra más información
            </h2>
            <Ornament className={styles.sectionOrnament} />
          </div>
          <div className={styles.relatedGrid}>
            {RELATED_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={styles.relatedCard}>
                <span className={styles.relatedIcon}>
                  <link.icon size={22} strokeWidth={1.8} />
                </span>
                <div className={styles.relatedText}>
                  <h3 className={styles.relatedTitle}>{link.title}</h3>
                  <p className={styles.relatedDesc}>{link.desc}</p>
                </div>
                <span className={styles.relatedArrow} aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeaderCentered}>
            <p className={styles.sectionEyebrow}>Preguntas frecuentes</p>
            <h2 className={styles.sectionTitle}>
              Todo lo que necesitas saber
            </h2>
            <Ornament className={styles.sectionOrnamentCentered} />
          </div>
          <div className={styles.faqGrid}>
            {FAQ_ITEMS.map((item) => (
              <div key={item.title} className={styles.faqCard}>
                <div className={styles.faqIcon}>
                  <item.icon size={22} />
                </div>
                <h3 className={styles.faqTitle}>{item.title}</h3>
                <p className={styles.faqDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROMESA */}
      <section className={styles.promiseSection}>
        <div className={styles.promiseBg} />
        <div className={styles.sectionInner}>
          <div className={styles.promiseContent}>
            <Heart size={32} className={styles.promiseHeart} />
            <h2 className={styles.promiseTitle}>Nuestra promesa</h2>
            <p>
              Queremos que disfrutes un excelente café, pero también una
              excelente experiencia.
            </p>
            <p>
              No buscamos ser la tienda más rápida de internet. Queremos ser una
              de las más transparentes, cercanas y confiables.
            </p>
            <p className={styles.promiseClosing}>
              Gracias por apoyar el café colombiano y por permitirnos acompañarte
              en este recorrido.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeaderCentered}>
            <p className={styles.sectionEyebrow}>Contacto</p>
            <h2 className={styles.sectionTitle}>Escríbenos cuando quieras</h2>
            <Ornament className={styles.sectionOrnamentCentered} />
          </div>
          <div className={styles.contactGrid}>
            {CONTACT_CHANNELS.map((ch) => (
              <div key={ch.title} className={styles.contactCard}>
                <div className={styles.contactIcon}>
                  <ch.icon size={24} />
                </div>
                <h3 className={styles.contactTitle}>{ch.title}</h3>
                <p className={styles.contactValue}>{ch.value}</p>
                <p className={styles.contactDesc}>{ch.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
