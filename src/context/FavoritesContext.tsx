'use client'

// src/context/FavoritesContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface FavoriteItem {
  id: string
  slug: string
  title: string
  price: number
  currency: string
  imageUrl: string
  vendorName: string
  originCountry: string
  originRegion?: string | null
}

interface FavoritesContextType {
  favorites: FavoriteItem[]
  toggleFavorite: (item: FavoriteItem) => void
  isFavorite: (id: string) => boolean
  favoriteCount: number
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

const STORAGE_KEY = 'cafe_marketplace_favorites'

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Cargar del localStorage al iniciar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setFavorites(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Error loading favorites from localStorage:', e)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Guardar en localStorage ante cambios
  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    } catch (e) {
      console.error('Error saving favorites to localStorage:', e)
    }
  }, [favorites, isLoaded])

  const toggleFavorite = (item: FavoriteItem) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === item.id)
      if (exists) {
        return prev.filter((f) => f.id !== item.id)
      } else {
        return [...prev, item]
      }
    })
  }

  const isFavorite = (id: string) => favorites.some((f) => f.id === id)

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        favoriteCount: favorites.length,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
