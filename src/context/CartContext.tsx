import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Product } from '../data/products'
import { coverUrl } from '../services/catalog'

export interface CartItem {
  productId: string
  name: string
  price: number
  image: string | null
  stock: number
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  count: number
  quantityOf: (productId: string) => number
  add: (product: Product) => void
  setQuantity: (productId: string, quantity: number) => void
  remove: (productIds: string[]) => void
  /** Atualiza preço/estoque com os dados atuais do catálogo; remove o que saiu dele. */
  sync: (products: Product[]) => void
}

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = 'alvestore.cart'

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Sem storage (modo privado): o carrinho vale só para esta aba.
    }
  }, [items])

  const quantityOf = useCallback(
    (productId: string) => items.find((i) => i.productId === productId)?.quantity ?? 0,
    [items],
  )

  const add = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id)
      if (!existing) {
        if (product.stock <= 0) return prev
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            image: coverUrl(product),
            stock: product.stock,
            quantity: 1,
          },
        ]
      }
      if (existing.quantity >= product.stock) return prev
      return prev.map((i) =>
        i.productId === product.id ? { ...i, quantity: i.quantity + 1, stock: product.stock, price: product.price } : i,
      )
    })
  }, [])

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i,
      ),
    )
  }, [])

  const remove = useCallback((productIds: string[]) => {
    setItems((prev) => prev.filter((i) => !productIds.includes(i.productId)))
  }, [])

  const sync = useCallback((products: Product[]) => {
    setItems((prev) =>
      prev.flatMap((item) => {
        const product = products.find((p) => p.id === item.productId)
        if (!product || product.stock <= 0) return []
        return [
          {
            ...item,
            name: product.name,
            price: product.price,
            image: coverUrl(product),
            stock: product.stock,
            quantity: Math.min(item.quantity, product.stock),
          },
        ]
      }),
    )
  }, [])

  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, count, quantityOf, add, setQuantity, remove, sync }}>
      {children}
    </CartContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart deve ser usado dentro de CartProvider')
  return ctx
}
