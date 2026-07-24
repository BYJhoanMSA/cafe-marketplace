import { getHomepageSettings } from '@/server/actions/settings.actions'
import { InicioEditor } from './InicioEditor'

export const metadata = {
  title: 'Editar Inicio | Admin',
}

export default async function InicioAdminPage() {
  const initialConfig = await getHomepageSettings()

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-ink-primary)' }}>
          Editor de la Página de Inicio
        </h1>
        <p style={{ color: 'var(--color-ink-secondary)', marginTop: 'var(--space-2)' }}>
          Modifica los textos principales y los beneficios de la página principal sin tocar el código.
        </p>
      </div>

      <InicioEditor initialConfig={initialConfig} />
    </div>
  )
}
