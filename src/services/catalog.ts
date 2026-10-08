import type { Product } from '../data/products'
import { apiRequest, assetUrl } from './api'

export const fetchProducts = () => apiRequest<Product[]>('/api/products')

export const fetchProduct = (id: string) => apiRequest<Product>(`/api/products/${encodeURIComponent(id)}`)

/** URL da foto de capa, ou null quando o produto não tem fotos. */
export const coverUrl = (product: Product) => (product.images[0] ? assetUrl(product.images[0].url) : null)
