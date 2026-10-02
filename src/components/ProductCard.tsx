import { useCart } from '../context/CartContext'
import { LOW_STOCK_THRESHOLD, type Product } from '../data/products'
import { formatPrice } from '../utils/format'
import './ProductCard.css'

interface Props {
  product: Product
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <span className="stock stock--out">Esgotado</span>
  if (stock <= LOW_STOCK_THRESHOLD)
    return <span className="stock stock--low">Últimas {stock} unidades</span>
  return <span className="stock stock--ok">{stock} em estoque</span>
}

export function ProductCard({ product }: Props) {
  const { items, add } = useCart()
  const outOfStock = product.stock === 0
  const maxedOut = (items[product.id] ?? 0) >= product.stock

  return (
    <article className={`card ${outOfStock ? 'card--out' : ''}`}>
      <div className="card__image">
        <img src={product.image} alt={product.name} loading="lazy" />
        <span className="card__category">{product.category}</span>
      </div>
      <div className="card__body">
        <h3>{product.name}</h3>
        <p className="card__desc">{product.description}</p>
        <StockBadge stock={product.stock} />
        <div className="card__footer">
          <span className="card__price">{formatPrice(product.price)}</span>
          <button className="btn btn-primary" disabled={maxedOut} onClick={() => add(product)}>
            {outOfStock ? 'Indisponível' : 'Comprar'}
          </button>
        </div>
      </div>
    </article>
  )
}
