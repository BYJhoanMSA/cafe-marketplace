import type { Metadata } from 'next'
import {
  Package,
  Truck,
  Clock,
  Shield,
  CreditCard,
  MapPin,
  CheckCircle,
  MessageSquare,
  Camera,
  Heart,
  Users,
  Leaf,
} from 'lucide-react'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Estrategia de Envío — Cafe Seleccion',
  description:
    'Conoce nuestra forma de trabajar: café directo del productor, proceso personalizado y opciones de envío nacional e internacional.',
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
        icon: Shield,
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
  { icon: Shield, title: 'Protección triple', desc: 'Caja corrugada + empaque hermético + bolsa exterior impermeable.' },
  { icon: Leaf, title: 'Sin impacto ambiental', desc: 'Empaques 100% reciclables y biodegradables certificados.' },
]

const PROCESS_STEPS = [
  {
    number: 1,
    title: 'Realizas tu pedido',
    desc: 'Seleccionas los productos que deseas comprar desde nuestra tienda.',
  },
  {
    number: 2,
    title: 'Confirmamos disponibilidad',
    desc: 'Nos comunicamos con el productor para verificar la existencia del café y asegurarnos de que todo esté listo para ser enviado. Solo cuando esta información ha sido confirmada continuamos con el proceso de pago. De esta manera evitamos cancelaciones, devoluciones innecesarias y falsas expectativas.',
  },
  {
    number: 3,
    title: 'Coordinamos contigo',
    desc: 'Si es necesario, nos comunicaremos contigo por WhatsApp para confirmar cualquier detalle relacionado con tu pedido. La comunicación directa hace parte de nuestra experiencia de servicio.',
  },
  {
    number: 4,
    title: 'Preparamos el envío',
    desc: 'Antes de empacar tu pedido te enviaremos una fotografía de los productos que recibirás. Así podrás verificar que todo corresponde exactamente a tu compra.',
  },
  {
    number: 5,
    title: 'Entregamos a la transportadora',
    desc: 'Una vez entregado el paquete en la empresa transportadora, te enviaremos una fotografía de la guía de envío para que puedas realizar el seguimiento. Trabajamos con empresas reconocidas como Servientrega, Envía e Inter Rapidísimo.',
  },
  {
    number: 6,
    title: 'Seguimiento hasta la entrega',
    desc: 'Permaneceremos atentos durante el proceso de transporte para ayudarte en caso de cualquier novedad. Nuestro compromiso no termina cuando despachamos el paquete.',
  },
]

const VALUE_PROPS = [
  {
    icon: Users,
    title: 'Café directo del productor',
    desc: 'No vendemos café de bodega; lo coordinamos directamente con quienes lo producen.',
  },
  {
    icon: Camera,
    title: 'Verificación visual',
    desc: 'Ves el producto real antes de que salga hacia tu casa.',
  },
  {
    icon: Package,
    title: 'Guía de envío al instante',
    desc: 'Recibes la foto de la guía de envío el mismo día del despacho.',
  },
  {
    icon: MessageSquare,
    title: 'Atención personalizada',
    desc: 'Hablas con personas, no con un chatbot.',
  },
  {
    icon: Heart,
    title: 'Impacto positivo',
    desc: 'Cada compra apoya a pequeños productores y marcas cafeteras colombianas.',
  },
  {
    icon: CheckCircle,
    title: 'Acompañamiento completo',
    desc: 'Te acompañamos desde que haces el pedido hasta que recibes tu café.',
  },
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
            Un cafe con origen merece un proceso diferente
          </p>
          <h1 className={styles.heroTitle}>Estrategia de Envio</h1>
          <p className={styles.heroSubtitle}>
            No vendemos desde una bodega. Vendemos desde el origen.
            Cada pedido inicia un proceso de seleccion y coordinacion
            con el productor, garantizando frescura, calidad y una
            atencion personalizada.
          </p>
        </div>
      </section>

      {/* NUESTRA FORMA DE TRABAJAR */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Filosofia</p>
            <h2 className={styles.sectionTitle}>Nuestra forma de trabajar</h2>
            <p className={styles.sectionSubtitle}>
              Un cafe artesanal merece un proceso diferente.
            </p>
          </div>
          <div className={styles.textContent}>
            <p>
              En nuestra tienda no trabajamos como un supermercado ni como una
              gran cadena de distribucion.
            </p>
            <p>
              Cada marca de cafe que encuentras aqui pertenece a pequenos
              productores, familias cafeteras y emprendedores que han construido
              su proyecto con dedicacion y pasion. Nuestro trabajo es conectar
              ese cafe con personas que valoran su origen.
            </p>
            <p>
              Por esa razon, antes de procesar un pedido verificamos directamente
              con el productor la disponibilidad del producto.
            </p>
            <h4>Por que lo hacemos?</h4>
            <p>
              Porque preferimos ofrecerte informacion real y transparente antes
              que vender un producto que no este disponible.
            </p>
            <p>
              Esto nos permite trabajar con cafes mas frescos, apoyar a pequenos
              productores y evitar que el cafe permanezca durante largos periodos
              almacenado en una bodega.
            </p>
          </div>
        </div>
      </section>

      {/* PROCESO HUMANIZADO */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Acompanamiento</p>
            <h2 className={styles.sectionTitle}>
              Un proceso mas humano y personalizado
            </h2>
          </div>
          <div className={styles.textContent}>
            <p>
              Cuando realizas una compra, no eres simplemente un numero de pedido.
            </p>
            <p>
              Nuestro equipo te acompana durante todo el proceso mediante WhatsApp,
              donde podremos confirmar la disponibilidad del cafe, resolver cualquier
              duda y mantener una comunicacion cercana.
            </p>
            <p>
              Queremos que tengas la tranquilidad de saber exactamente que esta
              ocurriendo con tu compra.
            </p>
          </div>
        </div>
      </section>

      {/* PROCESO PASO A PASO */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Proceso</p>
            <h2 className={styles.sectionTitle}>Asi es nuestro proceso</h2>
          </div>
          <div className={styles.processList}>
            {PROCESS_STEPS.map((step) => (
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

      {/* TIEMPOS DE ENTREGA */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Tiempos</p>
            <h2 className={styles.sectionTitle}>
              Los tiempos de entrega pueden variar?
            </h2>
          </div>
          <div className={styles.textContent}>
            <p>
              Si. Al trabajar directamente con productores independientes, algunos
              pedidos pueden requerir un poco mas de tiempo para ser preparados.
            </p>
            <p>
              Preferimos invertir unas horas adicionales verificando la calidad y
              disponibilidad del producto antes que enviarte informacion incorrecta
              o cancelar tu compra despues del pago.
            </p>
            <p>Creemos que la transparencia genera confianza.</p>
          </div>
        </div>
      </section>

      {/* COMPROMISO */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Compromiso</p>
            <h2 className={styles.sectionTitle}>Nuestro compromiso</h2>
          </div>
          <div className={styles.textContent}>
            <p>No somos una tienda automatizada.</p>
            <p>
              Somos una comunidad que conecta a consumidores con pequenos
              productores de cafe colombiano.
            </p>
            <p>
              Cada compra ayuda a fortalecer emprendimientos rurales, impulsar
              marcas independientes y llevar cafes de excelente calidad
              directamente hasta tu hogar.
            </p>
            <p>
              Por eso nuestro proceso es mas cercano, mas transparente y mucho
              mas humano.
            </p>
            <p>
              Gracias por hacer parte de esta forma diferente de consumir cafe.
            </p>
          </div>
          <div className={styles.valueGrid}>
            {VALUE_PROPS.map((prop) => (
              <div key={prop.title} className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <prop.icon size={24} />
                </div>
                <h3 className={styles.valueTitle}>{prop.title}</h3>
                <p className={styles.valueDesc}>{prop.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AVISO IMPORTANTE */}
      <section className={styles.alertBanner}>
        <div className={styles.sectionInner}>
          <div className={styles.alertContent}>
            <p className={styles.alertLabel}>Importante</p>
            <p className={styles.alertText}>
              Nuestros precios no incluyen el envio. El costo de envio se calcula
              al momento de finalizar tu compra segun la direccion de entrega y el
              metodo seleccionado.
            </p>
          </div>
        </div>
      </section>

      {/* COBERTURA NACIONAL */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
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
      <section className={styles.section}>
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
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Proteccion</p>
            <h2 className={styles.sectionTitle}>Empaque y Cuidado</h2>
            <p className={styles.sectionDesc}>
              Cada grano merece un viaje seguro. Nuestro sistema de empaque
              garantiza que el cafe llegue en las mismas condiciones que salio
              del tostador.
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

      {/* POLITICAS */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.policyGrid}>
            <div className={styles.policyCard}>
              <h3 className={styles.policyTitle}>Seguimiento de pedidos</h3>
              <p className={styles.policyText}>
                Recibiras un numero de guia por email y SMS en cuanto tu pedido
                sea despachado. Puedes rastrear en tiempo real desde tu cuenta.
              </p>
            </div>
            <div className={styles.policyCard}>
              <h3 className={styles.policyTitle}>Cambios y devoluciones</h3>
              <p className={styles.policyText}>
                Si el producto llega danado o incorrecto, lo reemplazamos sin
                costo. Contactanos dentro de los primeros 7 dias habiles.
              </p>
            </div>
            <div className={styles.policyCard}>
              <h3 className={styles.policyTitle}>Pago contra entrega</h3>
              <p className={styles.policyText}>
                Disponible en Bogota, Medellin, Cali y Barranquilla. Pagas en
                efectivo o datafono al recibir tu pedido.
              </p>
            </div>
            <div className={styles.policyCard}>
              <h3 className={styles.policyTitle}>Zonas sin cobertura</h3>
              <p className={styles.policyText}>
                Si tu direccion esta fuera de nuestra zona de cobertura, te
                notificaremos antes de procesar el pago para acordar una solucion.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
