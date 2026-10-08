import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { WHATSAPP_NUMBER } from '../config'
import { useCart, type CartItem } from '../context/CartContext'
import { fetchProducts } from '../services/catalog'
import { formatPrice } from '../utils/format'
import './Cart.css'

function buildMessage(items: CartItem[], customerName: string, note: string) {
  const lines = items.map(
    (i) =>
      `• ${i.quantity}x ${i.name} — ${formatPrice(i.price)} cada (${formatPrice(i.price * i.quantity)})\n  ${window.location.origin}/produto/${i.productId}`,
  )
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return [
    customerName.trim()
      ? `Olá, sou ${customerName.trim()} e tenho interesse em comprar esses itens:`
      : 'Olá, tenho interesse em comprar esses itens:',
    '',
    ...lines,
    '',
    `Total: ${formatPrice(total)}`,
    ...(note.trim() ? ['', `Observação: ${note.trim()}`] : []),
  ].join('\n')
}

export function Cart() {
  const { items, setQuantity, remove, sync } = useCart()
  const [deselected, setDeselected] = useState<Set<string>>(new Set())
  const [customerName, setCustomerName] = useState('')
  const [note, setNote] = useState('')
  const [sentIds, setSentIds] = useState<string[] | null>(null)

  // Confere preço e estoque atuais antes de montar o pedido.
  useEffect(() => {
    fetchProducts()
      .then(sync)
      .catch(() => undefined)
  }, [sync])

  const selected = items.filter((i) => !deselected.has(i.productId))
  const total = selected.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const units = selected.reduce((sum, i) => sum + i.quantity, 0)

  const toggle = (productId: string) =>
    setDeselected((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })

  const toggleAll = () =>
    setDeselected(selected.length === items.length ? new Set(items.map((i) => i.productId)) : new Set())

  const sendOrder = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage(selected, customerName, note))}`
    window.open(url, '_blank', 'noopener')
    setSentIds(selected.map((i) => i.productId))
  }

  const clearSent = () => {
    if (sentIds) remove(sentIds)
    setSentIds(null)
  }

  return (
    <>
      <Header />
      <main className="container cart">
        <h1>Meu carrinho</h1>

        {sentIds && (
          <div className="cart__notice">
            <span>Pedido aberto no WhatsApp. Já enviou a mensagem?</span>
            <div>
              <button type="button" className="btn btn-primary" onClick={clearSent}>
                Sim, limpar itens enviados
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setSentIds(null)}>
                Ainda não
              </button>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="cart__empty">
            <p>Seu carrinho está vazio.</p>
            <Link to="/" className="btn btn-primary">
              Ver produtos
            </Link>
          </div>
        ) : (
          <div className="cart__layout">
            <section className="cart__list">
              <label className="cart__select-all">
                <input type="checkbox" checked={selected.length === items.length} onChange={toggleAll} />
                Selecionar todos ({items.length})
              </label>

              {items.map((item) => (
                <article key={item.productId} className="cart-item">
                  <input
                    type="checkbox"
                    aria-label={`Incluir ${item.name} no pedido`}
                    checked={!deselected.has(item.productId)}
                    onChange={() => toggle(item.productId)}
                  />
                  <Link to={`/produto/${item.productId}`} className="cart-item__image">
                    {item.image ? <img src={item.image} alt={item.name} /> : <span>Sem foto</span>}
                  </Link>
                  <div className="cart-item__info">
                    <Link to={`/produto/${item.productId}`} className="cart-item__name">
                      {item.name}
                    </Link>
                    <small>
                      {formatPrice(item.price)} cada · {item.stock} disponíveis
                    </small>
                    <button type="button" className="cart-item__remove" onClick={() => remove([item.productId])}>
                      Remover
                    </button>
                  </div>
                  <div className="qty">
                    <button
                      type="button"
                      aria-label="Diminuir"
                      disabled={item.quantity <= 1}
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="Aumentar"
                      disabled={item.quantity >= item.stock}
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <strong className="cart-item__total">{formatPrice(item.price * item.quantity)}</strong>
                </article>
              ))}
            </section>

            <aside className="cart__summary">
              <h2>Resumo do pedido</h2>
              <div className="cart__row">
                <span>Itens selecionados</span>
                <span>{units}</span>
              </div>
              <div className="cart__row cart__row--total">
                <span>Total</span>
                <strong>{formatPrice(total)}</strong>
              </div>

              <label>
                Seu nome (opcional)
                <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} maxLength={80} />
              </label>
              <label>
                Observação (opcional)
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  maxLength={300}
                  placeholder="Bairro para entrega, forma de pagamento..."
                />
              </label>

              <button type="button" className="btn btn-whatsapp" disabled={selected.length === 0} onClick={sendOrder}>
                Enviar pedido pelo WhatsApp
              </button>
              <small>Você será direcionado ao WhatsApp para combinar pagamento e entrega.</small>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
