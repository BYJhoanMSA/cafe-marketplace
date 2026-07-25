import type { Metadata } from 'next'
import {
  Heart,
  Users,
  Leaf,
  Package,
  Camera,
  Truck,
  MessageSquare,
  Clock,
  Shield,
  Mail,
  Phone,
  CheckCircle,
} from 'lucide-react'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Centro de Ayuda — Cafe Seleccion',
  description:
    'Bienvenido a nuestro Centro de Ayuda. Resuelve tus dudas sobre compras, envios, tiempos y mas.',
}

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
    desc: 'Despachamos tu pedido mediante empresas transportadoras reconocidas como Servientrega, Envia o Inter Rapidisimo. Te enviaremos una fotografia de la guia para que puedas realizar el seguimiento.',
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

export default function AyudaPage() {
  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroDecor} />
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>
            <span className={styles.heroEyebrowLine} />
            Estamos aqui para ti
          </p>
          <h1 className={styles.heroTitle}>Centro de Ayuda</h1>
          <p className={styles.heroGratitude}>Gracias por confiar en nosotros.</p>
          <p className={styles.heroSubtitle}>
            Sabemos que comprar por internet puede generar preguntas,
            especialmente cuando se trata de cafe artesanal y de pequenos
            productores. Por eso hemos creado este Centro de Ayuda.
          </p>
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
                Aqui encontraras como funciona nuestra tienda, como realizamos los
                envios, como procesamos los pedidos y que puedes esperar durante
                cada etapa de tu compra.
              </p>
              <p>
                Nuestro objetivo es que siempre sepas que esta ocurriendo con tu
                pedido. Porque creemos que la confianza se construye con informacion
                clara y una comunicacion cercana.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className={styles.philosophySection}>
        <div className={styles.sectionInner}>
          <div className={styles.splitLayout}>
            <div className={styles.splitImage}>
              <div className={styles.philosophyIllustration} />
            </div>
            <div className={styles.splitText}>
              <p className={styles.sectionEyebrow}>Nuestra filosofia</p>
              <h2 className={styles.sectionTitle}>
                Por que nuestra tienda funciona diferente?
              </h2>
              <p>
                No somos un almacen con miles de productos esperando en una bodega.
              </p>
              <p>
                Somos un puente entre personas que aman el cafe y pequenos
                productores que han construido su propia marca.
              </p>
              <div className={styles.highlight}>
                Cada cafe tiene una historia. Cada productor tiene sus propios
                tiempos. Y nosotros respetamos ese proceso.
              </div>
              <p>
                Por eso verificamos personalmente la disponibilidad de cada producto
                antes de solicitar cualquier pago. Puede parecer un paso adicional,
                pero preferimos confirmar primero y cobrar despues.
              </p>
              <p className={styles.boldText}>
                Creemos que esa es la forma mas honesta de hacer comercio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Proceso</p>
            <h2 className={styles.sectionTitle}>
              Como funciona una compra?
            </h2>
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

      {/* FAQ */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeaderCentered}>
            <p className={styles.sectionEyebrow}>Preguntas frecuentes</p>
            <h2 className={styles.sectionTitle}>
              Todo lo que necesitas saber
            </h2>
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

      {/* PROMISE */}
      <section className={styles.promiseSection}>
        <div className={styles.promiseBg} />
        <div className={styles.sectionInner}>
          <div className={styles.promiseContent}>
            <Heart size={32} className={styles.promiseHeart} />
            <h2 className={styles.promiseTitle}>Nuestra promesa</h2>
            <p>
              Queremos que disfrutes un excelente cafe, pero tambien una
              excelente experiencia.
            </p>
            <p>
              No buscamos ser la tienda mas rapida de internet. Queremos ser una
              de las mas transparentes, cercanas y confiables.
            </p>
            <p>
              Porque detras de cada paquete hay un productor, una historia y
              personas comprometidas con hacer las cosas bien.
            </p>
            <p className={styles.promiseClosing}>
              Gracias por apoyar el cafe colombiano y por permitirnos acompanarte
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
            <h2 className={styles.sectionTitle}>Escribenos cuando quieras</h2>
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
