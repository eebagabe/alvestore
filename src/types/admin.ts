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

export type StockMovementType = 'Entry' | 'Exit' | 'Adjustment' | 'Sale' | 'SaleCancellation' | 'Purchase'

export const MOVEMENT_LABELS: Record<StockMovementType, string> = {
  Entry: 'Entrada',
  Exit: 'Saída',
  Adjustment: 'Ajuste',
  Sale: 'Venda',
  SaleCancellation: 'Venda cancelada',
  Purchase: 'Compra recebida',
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

export type CashMovementType = 'Inflow' | 'Outflow'
export type CashMovementStatus = 'Pending' | 'Completed' | 'Cancelled'
export type CashMovementSource = 'Manual' | 'Sale' | 'Purchase'

export const CASH_STATUS_LABELS: Record<CashMovementStatus, string> = {
  Pending: 'Em espera',
  Completed: 'Realizada',
  Cancelled: 'Cancelada',
}

export const STATUS_TAG: Record<CashMovementStatus, string> = {
  Pending: 'tag--warn',
  Completed: 'tag--ok',
  Cancelled: 'tag--danger',
}

export interface CashMovement {
  id: string
  type: CashMovementType
  source: CashMovementSource
  status: CashMovementStatus
  amount: number
  description: string
  occurredAt: string
  createdAt: string
  updatedAt: string
  saleId: string | null
  saleNumber: number | null
  purchaseId: string | null
  purchaseNumber: number | null
}

export interface CashSummary {
  balance: number
  completedInflow: number
  completedOutflow: number
  pendingInflow: number
  pendingOutflow: number
}
