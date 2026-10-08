import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAdminApi } from '../../../hooks/useAdminApi'
import type { Dashboard } from '../../../types/admin'
import { formatPercent, formatPrice, profitOf } from '../../../utils/format'
import {
  IconAlert,
  IconArrowIn,
  IconArrowOut,
  IconBag,
  IconBox,
  IconCart,
  IconClock,
  IconTicket,
  IconWallet,
} from './icons'
import './Dashboard.css'

const PERIODS = [
  { days: 7, label: '7 dias' },
  { days: 30, label: '30 dias' },
  { days: 90, label: '90 dias' },
  { days: 0, label: 'Tudo' },
]

const PANEL = '/admin/painel'
const buyLink = (productId: string) => `${PANEL}/compras?produto=${productId}`

function Tile({
  icon,
  label,
  value,
  hint,
  to,
}: {
  icon: ReactNode
  label: string
  value: ReactNode
  hint?: ReactNode
  to?: string
}) {
  const body = (
    <>
      <span className="kpi__icon">{icon}</span>
      <span className="kpi__label">{label}</span>
      <strong className="kpi__value">{value}</strong>
      {hint && <span className="kpi__hint">{hint}</span>}
    </>
  )
  return to ? (
    <Link to={to} className="kpi kpi--link">
      {body}
    </Link>
  ) : (
    <div className="kpi">{body}</div>
  )
}

function Empty({ icon, text, action }: { icon: ReactNode; text: string; action?: ReactNode }) {
  return (
    <div className="dash-empty">
      <span className="dash-empty__icon">{icon}</span>
      <p>{text}</p>
      {action}
    </div>
  )
}

export function DashboardPage() {
  const api = useAdminApi()
  const [days, setDays] = useState(30)
  const [data, setData] = useState<Dashboard | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api<Dashboard>(`/dashboard?days=${days}`)
      .then((d) => {
        setData(d)
        setError('')
      })
      .catch((err: Error) => setError(err.message))
  }, [api, days])

  const period = PERIODS.find((p) => p.days === days)!
  const periodText = days ? `nos últimos ${period.label}` : 'em todo o período'

  return (
    <section className="dash">
      <header className="dash__head">
        <div>
          <h1>Dashboard</h1>
          <p>Visão geral da loja {periodText}.</p>
        </div>
        <div className="segmented" role="group" aria-label="Período">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              type="button"
              aria-pressed={days === p.days}
              className={days === p.days ? 'is-active' : ''}
              onClick={() => setDays(p.days)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      {error && <p className="form__error">{error}</p>}
      {!data && !error && <p className="admin__hint">Carregando...</p>}

      {data && <DashboardBody data={data} periodText={periodText} />}
    </section>
  )
}

function DashboardBody({ data, periodText }: { data: Dashboard; periodText: string }) {
  const margin = profitOf(data.cost, data.revenue).percent
  const avgTicket = data.salesCount > 0 ? data.revenue / data.salesCount : 0
  const projected = data.cashBalance + data.pendingInflow - data.pendingOutflow
  const maxQty = Math.max(1, ...data.topProducts.map((p) => p.quantity))

  return (
    <>
      <div className="dash__overview">
        <div className="hero-card">
          <span className="hero-card__label">Faturamento {periodText}</span>
          <strong className="hero-card__value">{formatPrice(data.revenue)}</strong>
          <div className="hero-card__meta">
            <div>
              <span>Lucro</span>
              <strong>{formatPrice(data.profit)}</strong>
            </div>
            <div>
              <span>Margem sobre o custo</span>
              <strong>{formatPercent(margin)}</strong>
            </div>
            <div>
              <span>Custo dos produtos</span>
              <strong>{formatPrice(data.cost)}</strong>
            </div>
          </div>
        </div>

        <div className="kpi-grid kpi-grid--stack">
          <Tile
            icon={<IconBag />}
            label="Vendas realizadas"
            value={data.salesCount}
            hint={`${data.unitsSold} ${data.unitsSold === 1 ? 'unidade vendida' : 'unidades vendidas'}`}
            to={`${PANEL}/vendas`}
          />
          <Tile icon={<IconTicket />} label="Ticket médio" value={formatPrice(avgTicket)} hint="por venda realizada" />
          <Tile
            icon={<IconClock />}
            label="Vendas em espera"
            value={data.pendingSalesCount}
            hint="aguardando confirmação"
            to={`${PANEL}/vendas`}
          />
        </div>
      </div>

      <h2 className="dash__section">Caixa e estoque</h2>
      <div className="kpi-grid">
        <Tile
          icon={<IconWallet />}
          label="Saldo em caixa"
          value={<span className={data.cashBalance < 0 ? 'is-negative' : ''}>{formatPrice(data.cashBalance)}</span>}
          hint={`Projetado: ${formatPrice(projected)}`}
          to={`${PANEL}/caixa`}
        />
        <Tile
          icon={<IconArrowIn />}
          label="A receber"
          value={formatPrice(data.pendingInflow)}
          hint="vendas em espera"
          to={`${PANEL}/caixa`}
        />
        <Tile
          icon={<IconArrowOut />}
          label="A pagar"
          value={formatPrice(data.pendingOutflow)}
          hint={`${data.scheduledPurchasesCount} ${data.scheduledPurchasesCount === 1 ? 'compra programada' : 'compras programadas'}`}
          to={`${PANEL}/compras`}
        />
        <Tile
          icon={<IconBox />}
          label="Estoque a preço de custo"
          value={formatPrice(data.stockCostValue)}
          hint={`${data.stockUnits} ${data.stockUnits === 1 ? 'unidade' : 'unidades'} · ${data.purchaseRequestsCount} ${data.purchaseRequestsCount === 1 ? 'requisição' : 'requisições'} aberta${data.purchaseRequestsCount === 1 ? '' : 's'}`}
          to={`${PANEL}/estoque`}
        />
      </div>

      <div className="dash__panels">
        <article className="dash-card">
          <header className="dash-card__head">
            <div>
              <h2>Mais vendidos</h2>
              <p>Unidades vendidas {periodText} (realizadas e em espera).</p>
            </div>
            <Link to={`${PANEL}/vendas`} className="dash-card__link">
              Ver vendas
            </Link>
          </header>

          {data.topProducts.length === 0 ? (
            <Empty
              icon={<IconBag />}
              text="Nenhuma venda no período."
              action={
                <Link to={`${PANEL}/vendas/nova`} className="btn btn-primary">
                  Registrar venda
                </Link>
              }
            />
          ) : (
            <ol className="ranking">
              {data.topProducts.map((p, index) => (
                <li key={p.productId} className="ranking__row">
                  <span className="ranking__pos">{index + 1}</span>
                  <div className="ranking__main">
                    <div className="ranking__line">
                      <span className="ranking__name">{p.productName}</span>
                      <span className="ranking__qty">{p.quantity} un.</span>
                    </div>
                    <div
                      className="ranking__track"
                      title={`${p.productName}: ${p.quantity} un. · ${formatPrice(p.revenue)} · lucro ${formatPrice(p.profit)}`}
                    >
                      <span className="ranking__bar" style={{ width: `${(p.quantity / maxQty) * 100}%` }} />
                    </div>
                    <div className="ranking__sub">
                      <span>{formatPrice(p.revenue)} faturados</span>
                      <span>lucro {formatPrice(p.profit)}</span>
                      <span>estoque {p.currentStock}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </article>

        <article className="dash-card">
          <header className="dash-card__head">
            <div>
              <h2>Estoque baixo</h2>
              <p>Produtos ativos com 5 unidades ou menos.</p>
            </div>
            <Link to={`${PANEL}/estoque`} className="dash-card__link">
              Ver estoque
            </Link>
          </header>

          {data.lowStock.length === 0 ? (
            <Empty icon={<IconBox />} text="Tudo abastecido por aqui." />
          ) : (
            <ul className="stock-list">
              {data.lowStock.map((p) => (
                <li key={p.productId}>
                  <span className={`stock-list__badge ${p.stock === 0 ? 'is-out' : 'is-low'}`}>
                    <IconAlert />
                    {p.stock === 0 ? 'Esgotado' : `${p.stock} un.`}
                  </span>
                  <span className="stock-list__name">{p.productName}</span>
                  <Link to={buyLink(p.productId)} className="btn btn-ghost btn-sm">
                    <IconCart /> Comprar
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </>
  )
}
