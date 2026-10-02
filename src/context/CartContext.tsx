import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Product } from '../data/products'

interface CartContextValue {
  items: Record<string, number>
  count: number
  add: (product: Product) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Record<string, number>>({})

  const add = (product: Product) => {
    setItems((prev) => {
      const qty = prev[product.id] ?? 0
      if (qty >= product.stock) return prev
      return { ...prev, [product.id]: qty + 1 }
    })
  }

  const count = Object.values(items).reduce((sum, qty) => sum + qty, 0)

  return <CartContext.Provider value={{ items, count, add }}>{children}</CartContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart deve ser usado dentro de CartProvider')
  return ctx
}
