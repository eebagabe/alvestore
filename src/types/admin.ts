export type Platform = 'Facebook' | 'Instagram' | 'Olx'

export const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Olx', label: 'OLX' },
]

export const platformLabel = (platform: Platform) =>
  PLATFORMS.find((p) => p.value === platform)?.label ?? platform

export interface ProductImage {
  id: string
  url: string
}

export interface ProductListing {
  platform: Platform
  url: string | null
  publishedAt: string
}

export interface AdminProduct {
  id: string
  name: string
  description: string
  category: string
  unitCost: number
  salePrice: number
  stock: number
  isActive: boolean
  images: ProductImage[]
  listings: ProductListing[]
  createdAt: string
  updatedAt: string
}

export interface SaveProductPayload {
  name: string
  description: string
  category: string
  unitCost: number
  salePrice: number
  isActive: boolean
  initialStock?: number
  listings: { platform: Platform; url: string | null }[]
}

export type StockMovementType = 'Entry' | 'Exit' | 'Adjustment' | 'Sale' | 'SaleCancellation'

export const MOVEMENT_LABELS: Record<StockMovementType, string> = {
  Entry: 'Entrada',
  Exit: 'Saída',
  Adjustment: 'Ajuste',
  Sale: 'Venda',
  SaleCancellation: 'Venda cancelada',
}

export interface StockMovement {
  id: string
  productId: string
  productName: string
  type: StockMovementType
  quantity: number
  stockAfter: number
  note: string | null
  createdAt: string
}

export type SaleStatus = 'Completed' | 'Cancelled'

export interface SaleItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  unitCost: number
  total: number
}

export interface Sale {
  id: string
  number: number
  soldAt: string
  channel: Platform | null
  customerName: string | null
  note: string | null
  status: SaleStatus
  cancelledAt: string | null
  total: number
  totalCost: number
  profit: number
  items: SaleItem[]
}

export interface CreateSalePayload {
  items: { productId: string; quantity: number; unitPrice: number }[]
  channel: Platform | null
  customerName: string | null
  note: string | null
  soldAt: string | null
}
