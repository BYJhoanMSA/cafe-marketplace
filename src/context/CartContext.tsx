'use client'

// src/context/CartContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface CartItem {
  id: string // Identificador único del ítem en carrito (variantId o productId)
  productId: string
  variantId?: string
  title: string
  variantTitle?: string
  imageUrl?: string
  priceInCents: number
  currency: string
  quantity: number
  deleted?: boolean  // true si el producto fue eliminado
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  openCart: () => void
  closeCart: () => void
  totalItemsCount: number
  subtotalInCents: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const STORAGE_KEY = 'cafe_marketplace_cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Cargar del localStorage al inicializar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setItems(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Error loading cart from localStorage:', e)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Guardar en localStorage ante cualquier cambio
  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (e) {
      console.error('Error saving cart to localStorage:', e)
    }
  }, [items, isLoaded])

  const addToCart = (newItem: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === newItem.id)
      if (existingIndex > -1) {
        const updated = [...prev]
        const item = updated[existingIndex]
        if (item) item.quantity += quantity
        return updated
      }
      return [...prev, { ...newItem, quantity }]
    })
    setIsCartOpen(true) // Abrir el drawer automáticamente al agregar
  }

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)

  const totalItemsCount = items.reduce((acc, i) => acc + i.quantity, 0)
  const subtotalInCents = items.reduce((acc, i) => acc + i.priceInCents * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        totalItemsCount,
        subtotalInCents,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
