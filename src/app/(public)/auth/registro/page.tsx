// src/app/(public)/auth/registro/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { RegisterForm } from '@/components/auth/RegisterForm'
import styles from '../layout.module.css'

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description: 'Únete a Cafe Seleccion y descubre los mejores granos de especialidad',
}

export default async function RegisterPage() {
  const session = await auth()
  
  if (session?.user) {
    redirect('/')
  }

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.header}>
          <h1 className={styles.title}>Crea tu cuenta</h1>
          <p className={styles.subtitle}>Únete y descubre los mejores cafés</p>
        </div>
        
        <RegisterForm />

        <div className={styles.footer}>
          ¿Ya tienes una cuenta?{' '}
          <Link href="/auth/login" className={styles.link}>
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  )
}
