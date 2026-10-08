import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { StockBadge } from '../components/StockBadge'
import { useCart } from '../context/CartContext'
import type { Product } from '../data/products'
import { assetUrl, ApiError } from '../services/api'
import { fetchProduct } from '../services/catalog'
import { formatPrice } from '../utils/format'
import './ProductDetail.css'

export function ProductDetail() {
  const { id = '' } = useParams()
  // key remonta a página ao trocar de produto, zerando estado e foto ativa
  return <ProductDetailView key={id} id={id} />
}

function ProductDetailView({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [status, setStatus] = useState<'loading' | 'ok' | 'missing' | 'error'>('loading')
  const [activeImage, setActiveImage] = useState(0)
  const { quantityOf, add } = useCart()

  useEffect(() => {
    fetchProduct(id)
      .then((p) => {
        setProduct(p)
        setStatus('ok')
      })
      .catch((err) => setStatus(err instanceof ApiError && err.status === 404 ? 'missing' : 'error'))
  }, [id])

  if (status === 'loading') {
    return (
      <>
        <Header />
        <main className="container detail">
          <p>Carregando...</p>
        </main>
        <Footer />
      </>
    )
  }

  if (status !== 'ok' || !product) {
    return (
      <>
        <Header />
        <main className="container detail detail--missing">
          <h1>{status === 'missing' ? 'Produto não encontrado' : 'Não foi possível carregar o produto'}</h1>
          <Link to="/" className="btn btn-primary">
            Voltar ao catálogo
          </Link>
        </main>
        <Footer />
      </>
    )
  }

  const inCart = quantityOf(product.id)
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
          <div className="detail__gallery">
            <div className="detail__image">
              {product.images.length > 0 ? (
                <img src={assetUrl(product.images[activeImage]?.url ?? product.images[0].url)} alt={product.name} />
              ) : (
                <span className="detail__noimage">Sem foto</span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="detail__thumbs">
                {product.images.map((img, index) => (
                  <button
                    key={img.id}
                    type="button"
                    className={index === activeImage ? 'is-active' : ''}
                    onClick={() => setActiveImage(index)}
                  >
                    <img src={assetUrl(img.url)} alt="" />
                  </button>
                ))}
              </div>
            )}
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
              {inCart > 0 && (
                <Link to="/carrinho" className="detail__cart-link">
                  {inCart} no carrinho · ver carrinho
                </Link>
              )}
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
