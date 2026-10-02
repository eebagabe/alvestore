import { LOW_STOCK_THRESHOLD } from '../data/products'
import './StockBadge.css'

export function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <span className="stock stock--out">Esgotado</span>
  if (stock <= LOW_STOCK_THRESHOLD)
    return <span className="stock stock--low">Últimas {stock} unidades</span>
  return <span className="stock stock--ok">{stock} em estoque</span>
}
