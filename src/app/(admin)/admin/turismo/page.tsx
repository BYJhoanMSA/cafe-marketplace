// src/app/(admin)/admin/turismo/page.tsx
// Listado de recorridos turísticos. Solo accesible para el rol admin.
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Plus, Edit2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { RecorridoDeleteButton } from '@/components/admin/RecorridoDeleteButton'
import { getAdminRecorridos } from '@/server/actions/turismo.actions'
import { formatPesos, getImageUrl } from '@/lib/utils'
import { auth } from '@/lib/auth'

export const metadata = {
  title: 'Turismo | Panel Admin',
}

export default async function AdminTurismoPage() {
  const session = await auth()
  // Gestión de turismo es exclusiva del Administrador General
  if (session?.user?.role !== 'admin') {
    redirect('/admin')
  }

  const result = await getAdminRecorridos()
  if (!('recorridos' in result)) {
    redirect('/admin')
  }
  const recorridos = result.recorridos

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)' }}>Recorridos Turísticos</h1>
        <Link
          href="/admin/turismo/nuevo"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            backgroundColor: 'var(--color-interactive)',
            color: 'var(--color-ink-inverted)',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            fontWeight: 'var(--font-weight-medium)',
            fontSize: 'var(--text-sm)',
          }}
        >
          <Plus size={16} />
          Nuevo Recorrido
        </Link>
      </div>

      <div style={{
        backgroundColor: 'var(--color-bg-primary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border-default)', backgroundColor: 'var(--color-bg-secondary)' }}>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Recorrido</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Ubicación</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Precio</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Estado</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {recorridos.map((r: any) => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--color-border-default)' }}>
                <td style={{ padding: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative', flexShrink: 0, backgroundColor: 'var(--neutral-100)' }}>
                      <Image
                        src={getImageUrl(r.imagen, { width: 96 })}
                        alt={r.nombre}
                        fill
                        sizes="48px"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div>
                      <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{r.nombre}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-tertiary)' }}>{r.slug}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
                  {r.region}, {r.municipio}
                </td>
                <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatPesos(r.precio)}
                </td>
                <td style={{ padding: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
                    {r.destacado && <Badge variant="forest">Destacado</Badge>}
                    <Badge variant={r.activo ? 'success' : 'dark'}>
                      {r.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </td>
                <td style={{ padding: 'var(--space-4)', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Link
                      href={`/admin/turismo/${r.id}`}
                      style={{ color: 'var(--color-ink-secondary)', padding: 'var(--space-2)' }}
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </Link>
                    <RecorridoDeleteButton recorridoId={r.id} nombre={r.nombre} />
                  </div>
                </td>
              </tr>
            ))}
            {recorridos.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-ink-secondary)' }}>
                  No hay recorridos turísticos. Crea el primero.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
