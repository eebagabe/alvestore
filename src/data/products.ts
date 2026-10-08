export type Category = string

export interface ProductImage {
  id: string
  url: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: Category
  images: ProductImage[]
}

export const LOW_STOCK_THRESHOLD = 5

export interface PriceRange {
  label: string
  min: number
  max: number
}

export const PRICE_RANGES: PriceRange[] = [
  { label: 'Até R$ 50', min: 0, max: 50 },
  { label: 'R$ 50 a R$ 100', min: 50, max: 100 },
  { label: 'R$ 100 a R$ 200', min: 100, max: 200 },
  { label: 'Acima de R$ 200', min: 200, max: Infinity },
]
