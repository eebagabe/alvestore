import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import type { Product } from '../data/products'
import { coverUrl } from '../services/catalog'
import { formatPrice } from '../utils/format'
import { StockBadge } from './StockBadge'
import './ProductCard.css'

interface Props {
  product: Product
}

export function ProductCard({ product }: Props) {
  const { items, add } = useCart()
  const outOfStock = product.stock === 0
  const maxedOut = (items[product.id] ?? 0) >= product.stock
  const detailUrl = `/produto/${product.id}`
  const cover = coverUrl(product)

  return (
    <article className={`card ${outOfStock ? 'card--out' : ''}`}>
      <div className="card__image">
        {cover ? (
          <img src={cover} alt={product.name} loading="lazy" />
        ) : (
          <span className="card__noimage">Sem foto</span>
        )}
        <span className="card__category">{product.category}</span>
        <Link to={detailUrl} className="card__details">
          Ver detalhes
        </Link>
      </div>
      <div className="card__body">
        <h3 title={product.name}>
          <Link to={detailUrl}>{product.name}</Link>
        </h3>
        <p className="card__desc">{product.description}</p>
        <StockBadge stock={product.stock} />
        <span className="card__price">{formatPrice(product.price)}</span>
        <button className="btn btn-primary" disabled={maxedOut} onClick={() => add(product)}>
          {outOfStock ? 'Indisponível' : 'Comprar'}
        </button>
      </div>
    </article>
  )
}
