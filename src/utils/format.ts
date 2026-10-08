const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const formatPrice = (value: number) => brl.format(value)

const percent = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 })
const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

/** Lucro sobre o custo (markup). Sem custo, não há percentual. */
export const profitOf = (cost: number, price: number) => ({
  value: price - cost,
  percent: cost > 0 ? (price - cost) / cost : null,
})

export const formatPercent = (value: number | null) => (value === null ? '—' : percent.format(value))

export const formatDateTime = (iso: string) => dateTime.format(new Date(iso))

/** Data/hora local no formato aceito por <input type="datetime-local">. */
export const nowLocalInput = () => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}
