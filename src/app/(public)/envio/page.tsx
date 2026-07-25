import type { Metadata } from 'next'
import { Package, CheckCircle, MessageSquare, Camera, Heart, Users } from 'lucide-react'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Estrategia de Envío — Cafe Seleccion',
  description:
    'Conoce nuestra forma de trabajar: café directo del productor, proceso personalizado y atención cercana.',
}

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

    </>
  )
}
