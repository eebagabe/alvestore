import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useAdminApi } from '../../../hooks/useAdminApi'
import {
  CASH_STATUS_LABELS,
  STATUS_TAG,
  type CashMovement,
  type CashMovementStatus,
  type CashMovementType,
  type CashSummary,
} from '../../../types/admin'
import { formatDateTime, formatPrice, nowLocalInput } from '../../../utils/format'

const FILTERS: { value: CashMovementStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'Pending', label: 'Em espera' },
  { value: 'Completed', label: 'Realizadas' },
  { value: 'Cancelled', label: 'Canceladas' },
]

const originOf = (m: CashMovement) =>
  m.saleNumber ? `Venda #${m.saleNumber}` : m.purchaseNumber ? `Compra #${m.purchaseNumber}` : 'Manual'

/** Explica o efeito colateral antes de mudar o status de um lançamento vinculado. */
function confirmMessage(m: CashMovement, status: CashMovementStatus) {
  const action = status === 'Completed' ? 'marcar como realizado' : 'cancelar'
  let message = `Deseja ${action} o lançamento "${m.description}" (${formatPrice(m.amount)})?`
  if (m.source === 'Sale')
    message += status === 'Completed' ? '\nA venda será confirmada.' : '\nA venda será cancelada e os itens voltarão ao estoque.'
  if (m.source === 'Purchase')
    message += status === 'Completed' ? '\nA compra será recebida e os itens entrarão no estoque.' : '\nA compra será cancelada.'
  return message
}

export function CashPage() {
  const api = useAdminApi()
  const [summary, setSummary] = useState<CashSummary | null>(null)
  const [movements, setMovements] = useState<CashMovement[] | null>(null)
  const [filter, setFilter] = useState<CashMovementStatus | ''>('')
  const [type, setType] = useState<CashMovementType>('Inflow')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<CashMovementStatus>('Completed')
  const [occurredAt, setOccurredAt] = useState(nowLocalInput)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(
    () =>
      Promise.all([
        api<CashSummary>('/cash/summary').then(setSummary),
        api<CashMovement[]>(`/cash/movements?take=300${filter ? `&status=${filter}` : ''}`).then(setMovements),
      ]).catch((err: Error) => setError(err.message)),
    [api, filter],
  )

  useEffect(() => {
    load()
  }, [load])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await api<CashMovement>('/cash/movements', {
        method: 'POST',
        body: JSON.stringify({
          type,
          amount: Number(amount),
          description: description.trim(),
          status,
          occurredAt: occurredAt ? new Date(occurredAt).toISOString() : null,
        }),
      })
      setAmount('')
      setDescription('')
      setOccurredAt(nowLocalInput())
      await load()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const changeStatus = async (m: CashMovement, next: CashMovementStatus) => {
    if (!confirm(confirmMessage(m, next))) return
    setError('')
    try {
      await api<CashMovement>(`/cash/movements/${m.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: next }),
      })
      await load()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const projected = summary ? summary.balance + summary.pendingInflow - summary.pendingOutflow : 0

  return (
    <section>
      <h1>Caixa</h1>

      <div className="stats">
        <div className="stat">
          <span>Saldo em caixa</span>
          <strong className={summary && summary.balance < 0 ? 'profit--neg' : ''}>
            {formatPrice(summary?.balance ?? 0)}
          </strong>
        </div>
        <div className="stat">
          <span>A receber (em espera)</span>
          <strong className="profit--pos">{formatPrice(summary?.pendingInflow ?? 0)}</strong>
        </div>
        <div className="stat stat--alert">
          <span>A pagar (em espera)</span>
          <strong className="profit--neg">{formatPrice(summary?.pendingOutflow ?? 0)}</strong>
        </div>
        <div className="stat">
          <span>Saldo projetado</span>
          <strong className={projected < 0 ? 'profit--neg' : ''}>{formatPrice(projected)}</strong>
        </div>
      </div>

      <form className="form panel form--wide" onSubmit={handleSubmit}>
        <h2>Lançamento manual</h2>
        <p className="admin__hint">
          Vendas e compras entram no caixa automaticamente. Use aqui para despesas, aportes e retiradas.
        </p>
        <div className="form__grid form__grid--4">
          <label>
            Tipo
            <select value={type} onChange={(e) => setType(e.target.value as CashMovementType)}>
              <option value="Inflow">Entrada</option>
              <option value="Outflow">Saída</option>
            </select>
          </label>
          <label>
            Valor (R$)
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </label>
          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value as CashMovementStatus)}>
              <option value="Completed">Realizada</option>
              <option value="Pending">Em espera</option>
            </select>
          </label>
          <label>
            Data
            <input type="datetime-local" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} />
          </label>
          <label className="form__full">
            Descrição
            <input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} required />
          </label>
        </div>
        {error && <p className="form__error">{error}</p>}
        <div className="form__actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Salvando...' : 'Lançar'}
          </button>
        </div>
      </form>

      <div className="filters">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`filter ${filter === f.value ? 'filter--active' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!movements && !error && <p className="admin__hint">Carregando...</p>}
      {movements?.length === 0 && <p className="admin__hint">Nenhum lançamento.</p>}

      {movements && movements.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Origem</th>
                <th className="num">Valor</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id} className={m.status === 'Cancelled' ? 'is-cancelled' : ''}>
                  <td>{formatDateTime(m.occurredAt)}</td>
                  <td>{m.description}</td>
                  <td>{originOf(m)}</td>
                  <td className={`num ${m.type === 'Inflow' ? 'profit--pos' : 'profit--neg'}`}>
                    {m.type === 'Inflow' ? '+' : '−'} {formatPrice(m.amount)}
                  </td>
                  <td>
                    <span className={`tag ${STATUS_TAG[m.status]}`}>{CASH_STATUS_LABELS[m.status]}</span>
                  </td>
                  <td className="actions-cell">
                    {m.status === 'Pending' && (
                      <button type="button" className="link-primary" onClick={() => changeStatus(m, 'Completed')}>
                        Realizar
                      </button>
                    )}
                    {m.status !== 'Cancelled' && !(m.source === 'Purchase' && m.status === 'Completed') && (
                      <button type="button" className="link-danger" onClick={() => changeStatus(m, 'Cancelled')}>
                        Cancelar
                      </button>
                    )}
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
