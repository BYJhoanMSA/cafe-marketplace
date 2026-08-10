'use client'

// src/components/turismo/SolicitarInfoForm.tsx
// Formulario de "solicitar información" para un recorrido. Al enviar, abre
// WhatsApp con el mensaje prellenado (patrón de pedido directo del proyecto).

import { useState } from 'react'
import { Send, MessageCircle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { normalizeWhatsAppNumber } from '@/lib/utils'
import styles from './SolicitarInfoForm.module.css'

interface SolicitarInfoFormProps {
  recorridoNombre: string
  recorridoSlug: string
}

const FIELDS = {
  nombre: '',
  email: '',
  telefono: '',
  fecha: '',
  personas: '',
  mensaje: '',
}

export function SolicitarInfoForm({ recorridoNombre, recorridoSlug }: SolicitarInfoFormProps) {
  const [form, setForm] = useState(FIELDS)
  const [error, setError] = useState('')

  const phone =
    normalizeWhatsAppNumber(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '573008717377') ??
    '573008717377'

  function set<K extends keyof typeof FIELDS>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.nombre.trim() || !form.telefono.trim()) {
      setError('Por favor ingresa tu nombre y un teléfono de contacto.')
      return
    }

    const lineas = [
      `🌟 *Solicitud de información — ${recorridoNombre}*`,
      '',
      `👤 *Nombre:* ${form.nombre.trim()}`,
      form.email.trim() ? `📧 *Email:* ${form.email.trim()}` : '',
      form.telefono.trim() ? `📱 *Teléfono:* ${form.telefono.trim()}` : '',
      form.fecha.trim() ? `📅 *Fecha preferida:* ${form.fecha.trim()}` : '',
      form.personas.trim() ? `👥 *Personas:* ${form.personas.trim()}` : '',
      '',
      form.mensaje.trim() ? `💬 *Mensaje:*\n${form.mensaje.trim()}` : '',
      '',
      `Estoy interesado en el recorrido: /turismo/${recorridoSlug}`,
    ]
      .filter(Boolean)
      .join('\n')

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(lineas)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    setForm(FIELDS)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.fieldRow}>
        <Input
          label="Nombre"
          required
          value={form.nombre}
          onChange={(e) => set('nombre', e.target.value)}
          autoComplete="name"
        />
        <Input
          label="Teléfono"
          required
          type="tel"
          value={form.telefono}
          onChange={(e) => set('telefono', e.target.value)}
          autoComplete="tel"
        />
      </div>

      <div className={styles.fieldRow}>
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          autoComplete="email"
        />
        <Input
          label="Fecha preferida"
          type="text"
          placeholder="Ej: próxima semana"
          value={form.fecha}
          onChange={(e) => set('fecha', e.target.value)}
        />
      </div>

      <Input
        label="¿Cuántas personas?"
        type="text"
        placeholder="Ej: 2 adultos"
        value={form.personas}
        onChange={(e) => set('personas', e.target.value)}
        wrapperClassName={styles.fullRow}
      />

      <div className={styles.fullRow}>
        <label htmlFor="mensaje" className={styles.textareaLabel}>
          Mensaje
        </label>
        <textarea
          id="mensaje"
          className={styles.textarea}
          rows={4}
          placeholder="Cuéntanos tus dudas o lo que te gustaría incluir..."
          value={form.mensaje}
          onChange={(e) => set('mensaje', e.target.value)}
        />
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button type="submit" className={styles.submit}>
        <MessageCircle size={18} aria-hidden="true" />
        Enviar solicitud por WhatsApp
      </button>

      <p className={styles.note}>
        <Send size={12} aria-hidden="true" />
        Al enviar se abrirá WhatsApp con tu mensaje prellenado.
      </p>
    </form>
  )
}
