'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateHomepageSettings, type HomepageConfig, type HomepageFeature } from '@/server/actions/settings.actions'
import { ImageUploader, type UploadedImage } from '@/components/admin/ImageUploader'
import { Button } from '@/components/ui/Button'

export function InicioEditor({ initialConfig }: { initialConfig: HomepageConfig }) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [config, setConfig] = useState<HomepageConfig>(initialConfig)

  const [heroImages, setHeroImages] = useState<UploadedImage[]>(
    initialConfig.heroImageUrl
      ? [{ url: initialConfig.heroImageUrl, alt: 'Hero imagen principal', position: 0 }]
      : []
  )
  const [heroMobileImages, setHeroMobileImages] = useState<UploadedImage[]>(
    initialConfig.heroImageUrlMobile
      ? [{ url: initialConfig.heroImageUrlMobile, alt: 'Hero imagen móvil', position: 0 }]
      : []
  )

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMsg('')
    try {
      const finalConfig: HomepageConfig = {
        ...config,
        heroImageUrl: heroImages[0]?.url || config.heroImageUrl,
        heroImageUrlMobile: heroMobileImages[0]?.url || config.heroImageUrlMobile || config.heroImageUrl,
      }
      const res = await updateHomepageSettings(finalConfig)
      if (res.success) {
        setSaveMsg('✅ Cambios guardados exitosamente')
        router.refresh()
      } else {
        setSaveMsg('❌ Error al guardar la configuración')
      }
    } catch (e) {
      console.error(e)
      setSaveMsg('❌ Error de conexión')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveMsg(''), 4000)
    }
  }

  const handleFeatureChange = (index: number, field: string, value: string) => {
    const newFeatures = [...config.features]
    newFeatures[index] = { ...newFeatures[index], [field]: value } as HomepageFeature
    setConfig({ ...config, features: newFeatures })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: 'var(--space-2) var(--space-3)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border-default)',
    background: 'var(--color-bg-primary)',
    fontFamily: 'inherit',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-ink-primary)',
  }

  const sectionStyle: React.CSSProperties = {
    background: 'var(--color-bg-secondary)',
    padding: 'var(--space-6)',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--color-border-default)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: 'var(--space-1)',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--color-ink-primary)',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '860px' }}>

      {/* SECCIÓN HERO */}
      <section style={sectionStyle}>
        <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)', margin: 0 }}>
          🏔️ Sección Hero (Banner Principal)
        </h3>

        <ImageUploader
          images={heroImages}
          onChange={setHeroImages}
          type="hero"
          maxImages={1}
          label="Imagen de fondo del Hero — Escritorio (1920×1080)"
        />

        <ImageUploader
          images={heroMobileImages}
          onChange={setHeroMobileImages}
          type="hero"
          maxImages={1}
          label="Imagen de fondo del Hero — Móvil (640×960)"
        />

        {heroImages[0] && (
          <div style={{
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: '1px solid var(--color-border-default)',
            position: 'relative',
            aspectRatio: '16/5',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImages[0].url} alt="Preview hero" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to right, rgba(0,0,0,0.55), rgba(0,0,0,0.1))',
              display: 'flex', alignItems: 'center', padding: 'var(--space-6)',
            }}>
              <p style={{ color: 'white', fontSize: 'var(--text-lg)', fontWeight: 'bold', margin: 0, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                {config.heroTitle}
              </p>
            </div>
          </div>
        )}

        <div>
          <label style={labelStyle}>Título del Hero</label>
          <textarea
            value={config.heroTitle}
            onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
            style={{ ...inputStyle, minHeight: '70px' }}
          />
        </div>

        <div>
          <label style={labelStyle}>Subtítulo del Hero</label>
          <textarea
            value={config.heroSubtitle}
            onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
            style={{ ...inputStyle, minHeight: '70px' }}
          />
        </div>
      </section>

      {/* SECCIÓN POR QUÉ ELEGIRNOS */}
      <section style={sectionStyle}>
        <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)', margin: 0 }}>
          ⭐ Por qué elegirnos (Beneficios)
        </h3>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)' }}>
          Edita cada bloque de forma independiente. Los cambios se guardan todos al presionar el botón.
        </p>

        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          {config.features.map((feature, idx) => (
            <div key={idx} style={{
              padding: 'var(--space-5)',
              background: 'var(--color-bg-primary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border-default)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}>
              <h4 style={{ margin: 0, fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-ink-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Beneficio {idx + 1}
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 'var(--space-3)' }}>
                <div>
                  <label style={labelStyle}>Emoji</label>
                  <input
                    type="text"
                    value={feature.icon}
                    onChange={(e) => handleFeatureChange(idx, 'icon', e.target.value)}
                    style={{ ...inputStyle, fontSize: '1.5rem', textAlign: 'center' }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Título</label>
                  <input
                    type="text"
                    value={feature.title}
                    onChange={(e) => handleFeatureChange(idx, 'title', e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Descripción</label>
                <textarea
                  value={feature.desc}
                  onChange={(e) => handleFeatureChange(idx, 'desc', e.target.value)}
                  style={{ ...inputStyle, minHeight: '60px' }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BOTÓN GUARDAR */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-10)' }}>
        {saveMsg && (
          <span style={{ fontSize: 'var(--text-sm)', color: saveMsg.startsWith('✅') ? 'green' : 'red' }}>
            {saveMsg}
          </span>
        )}
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

    </div>
  )
}
