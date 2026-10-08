import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminApi } from '../../../hooks/useAdminApi'
import type { Dashboard } from '../../../types/admin'
import { formatPercent, formatPrice, profitOf } from '../../../utils/format'

const PERIODS = [
  { days: 7, label: '7 dias' },
  { days: 30, label: '30 dias' },
  { days: 90, label: '90 dias' },
  { days: 0, label: 'Tudo' },
]

const buyLink = (productId: string) => `/admin/painel/compras?produto=${productId}`

export function DashboardPage() {
  const api = useAdminApi()
  const [days, setDays] = useState(30)
  const [data, setData] = useState<Dashboard | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api<Dashboard>(`/dashboard?days=${days}`)
      .then(setData)
      .catch((err: Error) => setError(err.message))
  }, [api, days])

  const margin = data ? profitOf(data.cost, data.revenue).percent : null

  return (
    <section>
      <div className="admin__head">
        <h1>Dashboard</h1>
        <div className="filters filters--inline">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              type="button"
              className={`filter ${days === p.days ? 'filter--active' : ''}`}
              onClick={() => setDays(p.days)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="form__error">{error}</p>}
      {!data && !error && <p className="admin__hint">Carregando...</p>}

      {data && (
        <>
          <div className="stats">
            <div className="stat">
              <span>Faturamento</span>
              <strong>{formatPrice(data.revenue)}</strong>
            </div>
            <div className="stat">
              <span>Lucro</span>
              <strong className={data.profit < 0 ? 'profit--neg' : 'profit--pos'}>
                {formatPrice(data.profit)} <small>({formatPercent(margin)})</small>
              </strong>
            </div>
            <div className="stat">
              <span>Vendas realizadas</span>
              <strong>
                {data.salesCount} <small>({data.unitsSold} un.)</small>
              </strong>
            </div>
            <div className="stat stat--alert">
              <span>Vendas em espera</span>
              <strong>{data.pendingSalesCount}</strong>
            </div>
          </div>

          <div className="stats">
            <div className="stat">
              <span>Saldo em caixa</span>
              <strong className={data.cashBalance < 0 ? 'profit--neg' : ''}>{formatPrice(data.cashBalance)}</strong>
            </div>
            <div className="stat">
              <span>A receber / a pagar</span>
              <strong>
                <span className="profit--pos">{formatPrice(data.pendingInflow)}</span>
                {' / '}
                <span className="profit--neg">{formatPrice(data.pendingOutflow)}</span>
              </strong>
            </div>
            <div className="stat">
              <span>Estoque (custo)</span>
              <strong>
                {formatPrice(data.stockCostValue)} <small>({data.stockUnits} un.)</small>
              </strong>
            </div>
            <div className="stat">
              <span>Compras</span>
              <strong>
                <Link to="/admin/painel/compras">
                  {data.purchaseRequestsCount} req. · {data.scheduledPurchasesCount} prog.
                </Link>
              </strong>
            </div>
          </div>

          <div className="split split--dashboard">
            <div>
              <h2>Mais vendidos</h2>
              <p className="admin__hint">Vendas realizadas e em espera no período.</p>
              {data.topProducts.length === 0 ? (
                <p className="admin__hint">Nenhuma venda no período.</p>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Produto</th>
                        <th className="num">Qtd.</th>
                        <th className="num">Faturamento</th>
                        <th className="num">Lucro</th>
                        <th className="num">Estoque</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topProducts.map((p, index) => (
                        <tr key={p.productId}>
                          <td>{index + 1}</td>
                          <td>{p.productName}</td>
                          <td className="num">{p.quantity}</td>
                          <td className="num">{formatPrice(p.revenue)}</td>
                          <td className={`num ${p.profit < 0 ? 'profit--neg' : 'profit--pos'}`}>
                            {formatPrice(p.profit)}
                          </td>
                          <td className="num">{p.currentStock}</td>
                          <td className="actions-cell">
                            <Link to={buyLink(p.productId)} className="link-primary">
                              Comprar
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div>
              <h2>Estoque baixo</h2>
              <p className="admin__hint">Produtos ativos com 5 unidades ou menos.</p>
              {data.lowStock.length === 0 ? (
                <p className="admin__hint">Tudo abastecido.</p>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <tbody>
                      {data.lowStock.map((p) => (
                        <tr key={p.productId}>
                          <td>{p.productName}</td>
                          <td className={`num ${p.stock === 0 ? 'qty--out' : 'qty--low'}`}>{p.stock}</td>
                          <td className="actions-cell">
                            <Link to={buyLink(p.productId)} className="link-primary">
                              Comprar
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  )
}
