import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminApi } from '../../../hooks/useAdminApi'
import { platformLabel, type Sale, type SaleStatus } from '../../../types/admin'
import { formatDateTime, formatPercent, formatPrice, profitOf } from '../../../utils/format'

const STATUS: Record<SaleStatus, { label: string; tag: string }> = {
  Pending: { label: 'Em espera', tag: 'tag--warn' },
  Completed: { label: 'Realizada', tag: 'tag--ok' },
  Cancelled: { label: 'Cancelada', tag: 'tag--danger' },
}

export function SalesPage() {
  const api = useAdminApi()
  const [sales, setSales] = useState<Sale[] | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(
    () =>
      api<Sale[]>('/sales?take=200')
        .then(setSales)
        .catch((err: Error) => setError(err.message)),
    [api],
  )

  useEffect(() => {
    load()
  }, [load])

  const confirmSale = async (sale: Sale) => {
    if (!confirm(`Confirmar a venda #${sale.number} como realizada? O valor entra no saldo do caixa.`)) return
    setError('')
    try {
      await api<Sale>(`/sales/${sale.id}/confirm`, { method: 'POST' })
      await load()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const cancel = async (sale: Sale) => {
    if (!confirm(`Cancelar a venda #${sale.number}? Os produtos voltarão para o estoque.`)) return
    setError('')
    try {
      await api<Sale>(`/sales/${sale.id}/cancel`, { method: 'POST' })
      await load()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const completed = (sales ?? []).filter((s) => s.status === 'Completed')
  const pending = (sales ?? []).filter((s) => s.status === 'Pending')
  const revenue = completed.reduce((sum, s) => sum + s.total, 0)
  const cost = completed.reduce((sum, s) => sum + s.totalCost, 0)
  const profit = profitOf(cost, revenue)

  return (
    <section>
      <div className="admin__head">
        <h1>Vendas</h1>
        <Link to="nova" className="btn btn-primary">
          Nova venda
        </Link>
      </div>

      <div className="stats">
        <div className="stat">
          <span>Vendas concluídas</span>
          <strong>{completed.length}</strong>
        </div>
        <div className="stat stat--alert">
          <span>Em espera</span>
          <strong>
            {pending.length} <small>({formatPrice(pending.reduce((sum, s) => sum + s.total, 0))})</small>
          </strong>
        </div>
        <div className="stat">
          <span>Faturamento</span>
          <strong>{formatPrice(revenue)}</strong>
        </div>
        <div className="stat">
          <span>Lucro</span>
          <strong>
            {formatPrice(profit.value)} <small>({formatPercent(profit.percent)})</small>
          </strong>
        </div>
      </div>

      {error && <p className="form__error">{error}</p>}
      {!sales && !error && <p className="admin__hint">Carregando...</p>}
      {sales?.length === 0 && <p className="admin__hint">Nenhuma venda registrada ainda.</p>}

      {sales && sales.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Data</th>
                <th>Itens</th>
                <th>Cliente</th>
                <th>Canal</th>
                <th className="num">Total</th>
                <th className="num">Lucro</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => {
                const cancelled = s.status === 'Cancelled'
                return (
                  <tr key={s.id} className={cancelled ? 'is-cancelled' : ''}>
                    <td>{s.number}</td>
                    <td>{formatDateTime(s.soldAt)}</td>
                    <td>
                      {s.items.map((i) => (
                        <small key={i.productId} className="table__line">
                          {i.quantity}× {i.productName} · {formatPrice(i.unitPrice)}
                        </small>
                      ))}
                      {s.note && <small className="table__sub">{s.note}</small>}
                    </td>
                    <td>{s.customerName ?? '—'}</td>
                    <td>{s.channel ? platformLabel(s.channel) : 'Direto'}</td>
                    <td className="num">{formatPrice(s.total)}</td>
                    <td className={`num ${s.profit < 0 ? 'profit--neg' : 'profit--pos'}`}>
                      {formatPrice(s.profit)}
                      <small className="table__sub">{formatPercent(profitOf(s.totalCost, s.total).percent)}</small>
                    </td>
                    <td>
                      <span className={`tag ${STATUS[s.status].tag}`}>{STATUS[s.status].label}</span>
                    </td>
                    <td className="actions-cell">
                      {s.status === 'Pending' && (
                        <button type="button" className="link-primary" onClick={() => confirmSale(s)}>
                          Confirmar
                        </button>
                      )}
                      {!cancelled && (
                        <button type="button" className="link-danger" onClick={() => cancel(s)}>
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
