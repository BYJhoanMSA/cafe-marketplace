'use client'

// src/components/admin/StaffForm.tsx
// Formulario de creación/edición de usuarios staff (admin/vendor).
// - Crear: nombre, email, teléfono, contraseña, rol.
// - Editar: nombre, teléfono, rol, estado.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { createStaffUser, updateStaffUser } from '@/server/actions/admin/user.actions'

interface StaffFormProps {
  initialData?: {
    id: string
    email: string
    firstName: string
    lastName: string
    phone: string | null
    role: string
    status: string
  } | null
}

const ROLE_OPTIONS = [
  { label: 'Admin (acceso total)', value: 'admin' },
  { label: 'Vendor (solo sus productos)', value: 'vendor' },
]

const STATUS_OPTIONS = [
  { label: 'Activo', value: 'active' },
  { label: 'Inactivo', value: 'inactive' },
  { label: 'Bloqueado', value: 'banned' },
]

export function StaffForm({ initialData }: StaffFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: '',
    phone: initialData?.phone || '',
    password: '',
    role: initialData?.role || 'vendor',
    status: initialData?.status || 'active',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isEditing) {
        const result = await updateStaffUser(initialData!.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || null,
          role: formData.role as 'admin' | 'vendor',
          status: formData.status as 'active' | 'inactive' | 'banned',
        })
        if (result.success) {
          router.push('/admin/usuarios')
          router.refresh()
          return
        }
        setError(result.error || 'Error al actualizar el usuario')
      } else {
        const result = await createStaffUser({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || null,
          password: formData.password,
          role: formData.role as 'admin' | 'vendor',
        })
        if (result.success) {
          router.push('/admin/usuarios')
          router.refresh()
          return
        }
        setError(result.error || 'Error al crear el usuario')
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        maxWidth: '800px',
      }}
    >
      {error && (
        <div
          style={{
            color: 'var(--terra-500)',
            padding: '1rem',
            background: 'var(--terra-50)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <Input label="Nombre" name="firstName" value={formData.firstName} onChange={handleChange} required />
        <Input label="Apellido" name="lastName" value={formData.lastName} onChange={handleChange} required />
      </div>

      {!isEditing && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
          <Input
            label="Contraseña"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            hint="Mínimo 8 caracteres"
          />
        </div>
      )}

      {isEditing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
            Email
          </label>
          <div
            style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-default)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-ink-secondary)',
            }}
          >
            {initialData!.email} (no se puede cambiar)
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <Input
          label="Teléfono (WhatsApp)"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="3001234567"
        />
        {isEditing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
              Estado
            </label>
            <Select
              options={STATUS_OPTIONS}
              value={formData.status}
              onChange={(val) => handleSelectChange('status', val)}
            />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
          Rol
        </label>
        <Select
          options={ROLE_OPTIONS}
          value={formData.role}
          onChange={(val) => handleSelectChange('role', val)}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 'var(--space-4)',
          marginTop: 'var(--space-6)',
        }}
      >
        <Button type="button" variant="secondary" onClick={() => router.back()} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={loading}>
          {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
        </Button>
      </div>
    </form>
  )
}
