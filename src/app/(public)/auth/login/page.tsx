// src/app/(public)/auth/login/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { LoginForm } from '@/components/auth/LoginForm'
import styles from '../layout.module.css'

export const metadata: Metadata = {
  title: 'Iniciar Sesión',
  description: 'Inicia sesión en tu cuenta de Cafe Seleccion',
}

export default async function LoginPage() {
  const session = await auth()
  
  if (session?.user) {
    redirect('/')
  }

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.header}>
          <h1 className={styles.title}>Bienvenido de vuelta</h1>
          <p className={styles.subtitle}>Inicia sesión para continuar</p>
        </div>
        
        <LoginForm />

        <div className={styles.footer}>
          ¿No tienes una cuenta?{' '}
          <Link href="/auth/registro" className={styles.link}>
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  )
}
