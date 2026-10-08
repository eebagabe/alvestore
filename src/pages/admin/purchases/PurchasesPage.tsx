import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAdminApi } from '../../../hooks/useAdminApi'
import { PURCHASE_STATUS, type AdminProduct, type Purchase } from '../../../types/admin'
import { formatDateTime, formatPrice } from '../../../utils/format'

const formatDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('pt-BR') : '—')

export function PurchasesPage() {
  const api = useAdminApi()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [purchases, setPurchases] = useState<Purchase[] | null>(null)
  const [productId, setProductId] = useState(() => searchParams.get('produto') ?? '')
  const [quantity, setQuantity] = useState('')
  const [unitCost, setUnitCost] = useState('')
  const [supplier, setSupplier] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(
    () =>
      Promise.all([
        api<AdminProduct[]>('/products').then(setProducts),
        api<Purchase[]>('/purchases?take=300').then(setPurchases),
      ]).catch((err: Error) => setError(err.message)),
    [api],
  )

  useEffect(() => {
    load()
  }, [load])

  const selected = products.find((p) => p.id === productId)

  const selectProduct = (id: string) => {
    setProductId(id)
    setUnitCost('')
    setSearchParams(id ? { produto: id } : {}, { replace: true })
  }

  const run = async (action: () => Promise<unknown>) => {
    setError('')
    try {
      await action()
      await load()
      return true
    } catch (err) {
      setError((err as Error).message)
      return false
    }
  }

  const handleRequest = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const ok = await run(() =>
      api<Purchase>('/purchases', {
        method: 'POST',
        body: JSON.stringify({
          productId,
          quantity: Number(quantity),
          unitCost: unitCost === '' ? null : Number(unitCost),
          supplier: supplier.trim() || null,
          note: note.trim() || null,
        }),
      }),
    )
    setSaving(false)
    if (ok) {
      setQuantity('')
      setUnitCost('')
      setNote('')
    }
  }

  const receive = (p: Purchase) => {
    if (!confirm(`Receber compra #${p.number}? Entram ${p.quantity} un. de ${p.productName} no estoque.`)) return
    const updateProductCost =
      p.unitCost !== p.productUnitCost &&
      confirm(
        `Atualizar o custo unitário de ${p.productName} de ${formatPrice(p.productUnitCost)} para ${formatPrice(p.unitCost)}?`,
      )
    run(() =>
      api(`/purchases/${p.id}/receive`, { method: 'POST', body: JSON.stringify({ updateProductCost }) }),
    )
  }

  const cancel = (p: Purchase) => {
    if (!confirm(`Cancelar ${PURCHASE_STATUS[p.status].label.toLowerCase()} #${p.number}?`)) return
    run(() => api(`/purchases/${p.id}/cancel`, { method: 'POST' }))
  }

  const requested = (purchases ?? []).filter((p) => p.status === 'Requested')
  const scheduled = (purchases ?? []).filter((p) => p.status === 'Scheduled')
  const history = (purchases ?? []).filter((p) => p.status === 'Received' || p.status === 'Cancelled')

  return (
    <section>
      <h1>Compras</h1>

      <div className="stats">
        <div className="stat">
          <span>Requisições aguardando</span>
          <strong>{requested.length}</strong>
        </div>
        <div className="stat stat--alert">
          <span>Compras programadas</span>
          <strong>
            {scheduled.length} <small>({formatPrice(scheduled.reduce((sum, p) => sum + p.total, 0))})</small>
          </strong>
        </div>
        <div className="stat">
          <span>Recebidas</span>
          <strong>{history.filter((p) => p.status === 'Received').length}</strong>
        </div>
      </div>

      <form className="form panel form--wide" onSubmit={handleRequest}>
        <h2>Nova requisição de compra</h2>
        <div className="form__grid form__grid--4">
          <label>
            Produto
            <select value={productId} onChange={(e) => selectProduct(e.target.value)} required>
              <option value="">Selecione...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.stock} un.)
                </option>
              ))}
            </select>
          </label>
          <label>
            Quantidade
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </label>
          <label>
            Custo unit. (R$)
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder={selected ? String(selected.unitCost) : ''}
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
            />
          </label>
          <label>
            Fornecedor
            <input value={supplier} onChange={(e) => setSupplier(e.target.value)} maxLength={150} />
          </label>
          <label className="form__full">
            Observação
            <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
          </label>
        </div>
        {selected && (
          <p className="admin__hint">
            Estoque atual: <strong>{selected.stock}</strong> · custo cadastrado {formatPrice(selected.unitCost)}
            {quantity && ` · estimativa ${formatPrice(Number(quantity) * (unitCost === '' ? selected.unitCost : Number(unitCost)))}`}
          </p>
        )}
        {error && <p className="form__error">{error}</p>}
        <div className="form__actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Enviando...' : 'Criar requisição'}
          </button>
        </div>
      </form>

      <h2>Requisições aguardando confirmação</h2>
      {requested.length === 0 ? (
        <p className="admin__hint">Nenhuma requisição pendente.</p>
      ) : (
        <div className="request-list">
          {requested.map((p) => (
            <RequestCard
              key={p.id}
              purchase={p}
              onConfirm={(body) =>
                run(() => api(`/purchases/${p.id}/confirm`, { method: 'POST', body: JSON.stringify(body) }))
              }
              onCancel={() => cancel(p)}
            />
          ))}
        </div>
      )}

      <h2>Compras programadas</h2>
      {scheduled.length === 0 ? (
        <p className="admin__hint">Nenhuma compra programada.</p>
      ) : (
        <div className="table-wrap section-gap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Produto</th>
                <th className="num">Qtd.</th>
                <th className="num">Custo unit.</th>
                <th className="num">Total</th>
                <th>Previsão</th>
                <th>Fornecedor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {scheduled.map((p) => (
                <tr key={p.id}>
                  <td>{p.number}</td>
                  <td>
                    {p.productName}
                    <small className="table__sub">Estoque atual: {p.productStock}</small>
                  </td>
                  <td className="num">{p.quantity}</td>
                  <td className="num">{formatPrice(p.unitCost)}</td>
                  <td className="num">{formatPrice(p.total)}</td>
                  <td>{formatDate(p.expectedAt)}</td>
                  <td>{p.supplier ?? '—'}</td>
                  <td className="actions-cell">
                    <button type="button" className="link-primary" onClick={() => receive(p)}>
                      Receber
                    </button>
                    <button type="button" className="link-danger" onClick={() => cancel(p)}>
                      Cancelar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2>Histórico</h2>
      {history.length === 0 ? (
        <p className="admin__hint">Nada por aqui ainda.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Produto</th>
                <th className="num">Qtd.</th>
                <th className="num">Total</th>
                <th>Data</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((p) => (
                <tr key={p.id} className={p.status === 'Cancelled' ? 'is-cancelled' : ''}>
                  <td>{p.number}</td>
                  <td>{p.productName}</td>
                  <td className="num">{p.quantity ?? p.requestedQuantity}</td>
                  <td className="num">{formatPrice(p.total)}</td>
                  <td>{formatDateTime(p.receivedAt ?? p.cancelledAt ?? p.createdAt)}</td>
                  <td>
                    <span className={`tag ${PURCHASE_STATUS[p.status].tag}`}>{PURCHASE_STATUS[p.status].label}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

interface ConfirmBody {
  quantity: number
  unitCost: number
  expectedAt: string | null
  supplier: string | null
}

function RequestCard({
  purchase,
  onConfirm,
  onCancel,
}: {
  purchase: Purchase
  onConfirm: (body: ConfirmBody) => Promise<boolean>
  onCancel: () => void
}) {
  const [quantity, setQuantity] = useState(String(purchase.requestedQuantity))
  const [unitCost, setUnitCost] = useState(String(purchase.unitCost))
  const [expectedAt, setExpectedAt] = useState('')
  const [supplier, setSupplier] = useState(purchase.supplier ?? '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onConfirm({
      quantity: Number(quantity),
      unitCost: Number(unitCost),
      expectedAt: expectedAt ? new Date(`${expectedAt}T12:00:00`).toISOString() : null,
      supplier: supplier.trim() || null,
    })
    setSaving(false)
  }

  return (
    <form className="form panel request-card" onSubmit={handleSubmit}>
      <div className="request-card__head">
        <strong>
          #{purchase.number} · {purchase.productName}
        </strong>
        <small>
          Pedido: {purchase.requestedQuantity} un. em {formatDateTime(purchase.createdAt)} · estoque atual{' '}
          {purchase.productStock}
        </small>
        {purchase.note && <small>{purchase.note}</small>}
      </div>
      <div className="form__grid form__grid--4">
        <label>
          Quantidade a comprar
          <input type="number" min="1" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        </label>
        <label>
          Custo unit. (R$)
          <input type="number" min="0" step="0.01" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} required />
        </label>
        <label>
          Previsão de chegada
          <input type="date" value={expectedAt} onChange={(e) => setExpectedAt(e.target.value)} />
        </label>
        <label>
          Fornecedor
          <input value={supplier} onChange={(e) => setSupplier(e.target.value)} maxLength={150} />
        </label>
      </div>
      <div className="form__actions">
        <span className="request-card__total">Total: {formatPrice((Number(quantity) || 0) * (Number(unitCost) || 0))}</span>
        <button type="button" className="btn btn-danger" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          Confirmar e programar
        </button>
      </div>
    </form>
  )
}
