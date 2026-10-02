import { Link, useParams } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { StockBadge } from '../components/StockBadge'
import { useCart } from '../context/CartContext'
import { getProduct } from '../data/products'
import { formatPrice } from '../utils/format'
import './ProductDetail.css'

export function ProductDetail() {
  const { id = '' } = useParams()
  const product = getProduct(id)
  const { items, add } = useCart()

  if (!product) {
    return (
      <>
        <Header />
        <main className="container detail detail--missing">
          <h1>Produto não encontrado</h1>
          <Link to="/" className="btn btn-primary">
            Voltar ao catálogo
          </Link>
        </main>
        <Footer />
      </>
    )
  }

  const inCart = items[product.id] ?? 0
  const outOfStock = product.stock === 0
  const maxedOut = inCart >= product.stock

  return (
    <>
      <Header />
      <main className="container detail">
        <nav className="detail__breadcrumb">
          <Link to="/">Catálogo</Link>
          <span>›</span>
          <span>{product.category}</span>
          <span>›</span>
          <span>{product.name}</span>
        </nav>

        <div className="detail__grid">
          <div className="detail__image">
            <img src={product.image} alt={product.name} />
          </div>

          <div className="detail__info">
            <span className="detail__category">{product.category}</span>
            <h1>{product.name}</h1>
            <StockBadge stock={product.stock} />
            <p className="detail__price">{formatPrice(product.price)}</p>
            <p className="detail__desc">{product.description}</p>

            <div className="detail__buy">
              <button
                className="btn btn-primary"
                disabled={maxedOut}
                onClick={() => add(product)}
              >
                {outOfStock ? 'Indisponível' : maxedOut ? 'Limite do estoque' : 'Adicionar ao carrinho'}
              </button>
              {inCart > 0 && <small>{inCart} no carrinho</small>}
            </div>

            <ul className="detail__perks">
              <li>Entrega rápida em toda Maceió</li>
              <li>Compra segura</li>
              <li>Diversas formas de pagamento</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
