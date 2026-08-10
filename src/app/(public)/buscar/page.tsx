// src/app/(public)/buscar/page.tsx
// Página de búsqueda — Server Component que envuelve la vista cliente en un
// Suspense para que useSearchParams() pueda prerenderizarse estáticamente.

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SearchPage } from './SearchPage'

export const metadata: Metadata = {
  title: 'Buscar café',
  description:
    'Busca entre los cafés de especialidad por origen, tostador, variedad o notas de sabor.',
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SearchPage />
    </Suspense>
  )
}
