import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAdminApi } from '../../../hooks/useAdminApi'
import { PLATFORMS, type AdminProduct, type CreateSalePayload, type Platform, type Sale } from '../../../types/admin'
import { formatPercent, formatPrice, nowLocalInput, profitOf } from '../../../utils/format'

interface Line {
  key: number
  productId: string
  quantity: string
  unitPrice: string
}

let nextKey = 1
const newLine = (): Line => ({ key: nextKey++, productId: '', quantity: '1', unitPrice: '' })

export function SaleForm() {
  const api = useAdminApi()
  const navigate = useNavigate()
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [lines, setLines] = useState<Line[]>(() => [newLine()])
  const [channel, setChannel] = useState<Platform | ''>('')
  const [customerName, setCustomerName] = useState('')
  const [soldAt, setSoldAt] = useState(nowLocalInput)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api<AdminProduct[]>('/products')
      .then(setProducts)
      .catch((err: Error) => setError(err.message))
  }, [api])

  const productOf = (id: string) => products.find((p) => p.id === id)

  const updateLine = (key: number, patch: Partial<Line>) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)))

  const selectProduct = (key: number, productId: string) => {
    const product = productOf(productId)
    updateLine(key, { productId, unitPrice: product ? String(product.salePrice) : '' })
  }

  const computed = lines.map((line) => {
    const product = productOf(line.productId)
    const quantity = Number(line.quantity) || 0
    const unitPrice = Number(line.unitPrice) || 0
    const unitCost = product?.unitCost ?? 0
    return {
      line,
      product,
      quantity,
      unitPrice,
      total: quantity * unitPrice,
      cost: quantity * unitCost,
      profit: profitOf(unitCost, unitPrice),
    }
  })

  const total = computed.reduce((sum, c) => sum + c.total, 0)
  const totalCost = computed.reduce((sum, c) => sum + c.cost, 0)
  const totalProfit = profitOf(totalCost, total)
  const usedIds = new Set(lines.map((l) => l.productId))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    const filled = computed.filter((c) => c.product)
    if (filled.length === 0) {
      setError('Adicione ao menos um produto.')
      return
    }
    const overStock = filled.find((c) => c.quantity > c.product!.stock)
    if (overStock) {
      setError(`Estoque insuficiente para ${overStock.product!.name}. Disponível: ${overStock.product!.stock}.`)
      return
    }

    const payload: CreateSalePayload = {
      items: filled.map((c) => ({ productId: c.line.productId, quantity: c.quantity, unitPrice: c.unitPrice })),
      channel: channel || null,
      customerName: customerName.trim() || null,
      note: note.trim() || null,
      soldAt: soldAt ? new Date(soldAt).toISOString() : null,
    }

    setSaving(true)
    try {
      await api<Sale>('/sales', { method: 'POST', body: JSON.stringify(payload) })
      navigate('/admin/painel/vendas')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <div className="admin__head">
        <h1>Nova venda</h1>
        <Link to="/admin/painel/vendas" className="btn btn-ghost">
          Voltar
        </Link>
      </div>

      <form className="form form--wide" onSubmit={handleSubmit}>
        <div className="panel">
          <h2>Produtos</h2>
          <div className="sale-lines">
            {computed.map(({ line, product, total: lineTotal, profit }) => (
              <div key={line.key} className="sale-line">
                <label className="sale-line__product">
                  Produto
                  <select value={line.productId} onChange={(e) => selectProduct(line.key, e.target.value)} required>
                    <option value="">Selecione...</option>
                    {products
                      .filter((p) => p.id === line.productId || (!usedIds.has(p.id) && p.stock > 0))
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.stock} un.)
                        </option>
                      ))}
                  </select>
                  {product && <small>Disponível: {product.stock}</small>}
                </label>
                <label>
                  Qtd.
                  <input
                    type="number"
                    min="1"
                    max={product?.stock}
                    step="1"
                    value={line.quantity}
                    onChange={(e) => updateLine(line.key, { quantity: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Valor unit. (R$)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.unitPrice}
                    onChange={(e) => updateLine(line.key, { unitPrice: e.target.value })}
                    required
                  />
                  {product && Number(line.unitPrice) !== product.salePrice && (
                    <small>Cadastrado: {formatPrice(product.salePrice)}</small>
                  )}
                </label>
                <div className="sale-line__info">
                  <span>Subtotal</span>
                  <strong>{formatPrice(lineTotal)}</strong>
                </div>
                <div className={`sale-line__info ${profit.value < 0 ? 'profit--neg' : 'profit--pos'}`}>
                  <span>Lucro unit.</span>
                  <strong>
                    {product ? `${formatPrice(profit.value)} (${formatPercent(profit.percent)})` : '—'}
                  </strong>
                </div>
                <button
                  type="button"
                  className="sale-line__remove"
                  title="Remover item"
                  disabled={lines.length === 1}
                  onClick={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-ghost" onClick={() => setLines((prev) => [...prev, newLine()])}>
            + Adicionar produto
          </button>
        </div>

        <div className="panel">
          <h2>Detalhes</h2>
          <div className="form__grid form__grid--3">
            <label>
              Canal da venda
              <select value={channel} onChange={(e) => setChannel(e.target.value as Platform | '')}>
                <option value="">Não informado / direto</option>
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Cliente
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} maxLength={150} />
            </label>
            <label>
              Data da venda
              <input type="datetime-local" value={soldAt} onChange={(e) => setSoldAt(e.target.value)} />
            </label>
            <label className="form__full">
              Observação
              <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
            </label>
          </div>
        </div>

        <div className="panel sale-summary">
          <div>
            <span>Total da venda</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          <div>
            <span>Custo</span>
            <strong>{formatPrice(totalCost)}</strong>
          </div>
          <div className={totalProfit.value < 0 ? 'profit--neg' : 'profit--pos'}>
            <span>Lucro</span>
            <strong>
              {formatPrice(totalProfit.value)} ({formatPercent(totalProfit.percent)})
            </strong>
          </div>
        </div>

        {error && <p className="form__error">{error}</p>}

        <div className="form__actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Registrando...' : 'Registrar venda'}
          </button>
        </div>
      </form>
    </section>
  )
}
