import { LOW_STOCK_THRESHOLD, products } from '../../data/products'
import { formatPrice } from '../../utils/format'

export function Financeiro() {
  return (
    <section>
      <h1>Financeiro</h1>
      <p className="admin__hint">Em breve: faturamento, pedidos, fluxo de caixa e repasses.</p>
    </section>
  )
}

export function Marketing() {
  return (
    <section>
      <h1>Marketing</h1>
      <p className="admin__hint">Em breve: cupons, banners, campanhas e promoções por bairro.</p>
    </section>
  )
}

export function Estoque() {
  const totalUnits = products.reduce((sum, p) => sum + p.stock, 0)
  const totalValue = products.reduce((sum, p) => sum + p.stock * p.price, 0)
  const lowStock = products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD).length

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
          <span>Valor em estoque</span>
          <strong>{formatPrice(totalValue)}</strong>
        </div>
        <div className="stat stat--alert">
          <span>Baixo / esgotado</span>
          <strong>{lowStock}</strong>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Categoria</th>
              <th className="num">Preço</th>
              <th className="num">Estoque</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td className="num">{formatPrice(p.price)}</td>
                <td
                  className={`num ${p.stock === 0 ? 'qty--out' : p.stock <= LOW_STOCK_THRESHOLD ? 'qty--low' : ''}`}
                >
                  {p.stock}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
