// src/app/(admin)/admin/catalogo/page.tsx
// Configuración del feed del catálogo móvil (intercalado de turismo).
// Solo accesible para el rol admin.
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { auth } from '@/lib/auth'
import { getFeedTurismoCadence, updateFeedTurismoCadence } from '@/server/actions/settings.actions'
import { getActiveProducts } from '@/server/actions/catalog.actions'
import { getRecorridos } from '@/server/actions/turismo.actions'

export const metadata = {
  title: 'Catálogo | Panel Admin',
}

const CADENCE_OPTIONS = [
  { value: '3', label: '1 recorrido cada 3 cafés' },
  { value: '4', label: '1 recorrido cada 4 cafés' },
  { value: '5', label: '1 recorrido cada 5 cafés' },
  { value: 'random', label: 'Aleatorio (distribución al azar)' },
]

export default async function AdminCatalogoPage() {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    redirect('/admin')
  }

  const [cadence, products, recorridos] = await Promise.all([
    getFeedTurismoCadence(),
    getActiveProducts(),
    getRecorridos(),
  ])

  const interleaved =
    cadence === 'random' ? null : Math.min(Math.floor(products.length / Number(cadence)), recorridos.length)

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Link
          href="/admin"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            color: 'var(--color-ink-secondary)',
            textDecoration: 'none',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <ArrowLeft size={16} />
          Volver al dashboard
        </Link>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
          Feed del Catálogo
        </h1>
      </div>

      <div
        style={{
          maxWidth: '640px',
          backgroundColor: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
        }}
      >
        <form action={updateFeedTurismoCadence} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label htmlFor="cadence" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
              ¿Cada cuántos cafés intercalar un recorrido de turismo en el feed móvil del catálogo?
            </label>
            <select
              id="cadence"
              name="cadence"
              defaultValue={cadence}
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-default)',
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-ink-primary)',
                fontSize: 'var(--text-base)',
              }}
            >
              {CADENCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)', margin: 0 }}>
            Con {products.length} café(s) y {recorridos.length} recorrido(s):{' '}
            {cadence === 'random' ? (
              'los recorridos se distribuyen al azar entre los cafés.'
            ) : (
              <>
                se intercalan {interleaved} recorrido(s) y los que sobren van al final del catálogo.
              </>
            )}{' '}
            Con filtros de café activos no se intercala turismo.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              style={{
                backgroundColor: 'var(--color-interactive)',
                color: 'var(--color-ink-inverted)',
                padding: 'var(--space-2) var(--space-5)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                fontWeight: 'var(--font-weight-medium)',
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
              }}
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}