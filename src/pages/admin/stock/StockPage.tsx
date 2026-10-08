import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { LOW_STOCK_THRESHOLD } from '../../../data/products'
import { useAdminApi } from '../../../hooks/useAdminApi'
import { MOVEMENT_LABELS, type AdminProduct, type StockMovement } from '../../../types/admin'
import { formatDateTime, formatPrice } from '../../../utils/format'

type ManualMovement = 'Entry' | 'Exit' | 'Adjustment'

const QUANTITY_LABELS: Record<ManualMovement, string> = {
  Entry: 'Quantidade que entrou',
  Exit: 'Quantidade que saiu',
  Adjustment: 'Estoque contado',
}

export function StockPage() {
  const api = useAdminApi()
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [filter, setFilter] = useState('')
  const [productId, setProductId] = useState('')
  const [type, setType] = useState<ManualMovement>('Entry')
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const loadProducts = useCallback(
    () =>
      api<AdminProduct[]>('/products')
        .then(setProducts)
        .catch((err: Error) => setError(err.message)),
    [api],
  )

  const loadMovements = useCallback(
    () =>
      api<StockMovement[]>(`/stock-movements?take=200${filter ? `&productId=${filter}` : ''}`)
        .then(setMovements)
        .catch((err: Error) => setError(err.message)),
    [api, filter],
  )

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    loadMovements()
  }, [loadMovements])

  const selected = products.find((p) => p.id === productId)
  const totalUnits = products.reduce((sum, p) => sum + p.stock, 0)
  const costValue = products.reduce((sum, p) => sum + p.stock * p.unitCost, 0)
  const saleValue = products.reduce((sum, p) => sum + p.stock * p.salePrice, 0)
  const lowStock = products.filter((p) => p.isActive && p.stock <= LOW_STOCK_THRESHOLD).length

  const selectProduct = (id: string) => {
    setProductId(id)
    setFilter(id)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await api<StockMovement>('/stock-movements', {
        method: 'POST',
        body: JSON.stringify({ productId, type, quantity: Number(quantity), note: note.trim() || null }),
      })
      setQuantity('')
      setNote('')
      await Promise.all([loadProducts(), loadMovements()])
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <h1>Estoque</h1>

      <div className="stats">
        <div className="stat">
          <span>Produtos</span>
          <strong>{products.length}</strong>
        </div>
        <div className="stat">
          <span>Unidades</span>
          <strong>{totalUnits}</strong>
        </div>
        <div className="stat">
          <span>Estoque a preço de custo</span>
          <strong>{formatPrice(costValue)}</strong>
        </div>
        <div className="stat">
          <span>Estoque a preço de venda</span>
          <strong>{formatPrice(saleValue)}</strong>
        </div>
        <div className="stat stat--alert">
          <span>Baixo / esgotado</span>
          <strong>{lowStock}</strong>
        </div>
      </div>

      <form className="form panel form--wide" onSubmit={handleSubmit}>
        <h2>Registrar movimentação</h2>
        <div className="form__grid form__grid--4">
          <label>
            Produto
            <select value={productId} onChange={(e) => setProductId(e.target.value)} required>
              <option value="">Selecione...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.stock} un.)
                </option>
              ))}
            </select>
          </label>
          <label>
            Tipo
            <select value={type} onChange={(e) => setType(e.target.value as ManualMovement)}>
              <option value="Entry">Entrada (compra/reposição)</option>
              <option value="Exit">Saída (perda, brinde, uso)</option>
              <option value="Adjustment">Ajuste (contagem)</option>
            </select>
          </label>
          <label>
            {QUANTITY_LABELS[type]}
            <input
              type="number"
              min={type === 'Adjustment' ? 0 : 1}
              max={type === 'Exit' ? selected?.stock : undefined}
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </label>
          <label>
            Observação
            <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
          </label>
        </div>
        {selected && (
          <p className="admin__hint">
            Estoque atual de {selected.name}: <strong>{selected.stock}</strong>
          </p>
        )}
        {error && <p className="form__error">{error}</p>}
        <div className="form__actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Salvando...' : 'Registrar'}
          </button>
        </div>
      </form>

      <div className="split">
        <div>
          <h2>Saldo por produto</h2>
          <div className="table-wrap">
            <table className="table table--clickable">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th className="num">Estoque</th>
                  <th className="num">Valor (custo)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className={filter === p.id ? 'is-selected' : ''}
                    onClick={() => selectProduct(p.id)}
                  >
                    <td>
                      {p.name}
                      {!p.isActive && <small className="table__sub">Inativo</small>}
                    </td>
                    <td
                      className={`num ${p.stock === 0 ? 'qty--out' : p.stock <= LOW_STOCK_THRESHOLD ? 'qty--low' : ''}`}
                    >
                      {p.stock}
                    </td>
                    <td className="num">{formatPrice(p.stock * p.unitCost)}</td>
                    <td className="actions-cell">
                      <Link
                        to={`/admin/painel/compras?produto=${p.id}`}
                        className="link-primary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Comprar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="admin__head admin__head--sub">
            <h2>Histórico</h2>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">Todos os produtos</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          {movements.length === 0 ? (
            <p className="admin__hint">Nenhuma movimentação registrada.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Produto</th>
                    <th>Tipo</th>
                    <th className="num">Qtd.</th>
                    <th className="num">Saldo</th>
                    <th>Obs.</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id}>
                      <td>{formatDateTime(m.createdAt)}</td>
                      <td>{m.productName}</td>
                      <td>{MOVEMENT_LABELS[m.type]}</td>
                      <td className={`num ${m.quantity < 0 ? 'profit--neg' : 'profit--pos'}`}>
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </td>
                      <td className="num">{m.stockAfter}</td>
                      <td>{m.note ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
