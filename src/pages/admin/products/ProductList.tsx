import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LOW_STOCK_THRESHOLD } from '../../../data/products'
import { useAdminApi } from '../../../hooks/useAdminApi'
import { assetUrl } from '../../../services/api'
import { platformLabel, type AdminProduct } from '../../../types/admin'
import { formatPercent, formatPrice, profitOf } from '../../../utils/format'

export function ProductList() {
  const api = useAdminApi()
  const navigate = useNavigate()
  const [products, setProducts] = useState<AdminProduct[] | null>(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api<AdminProduct[]>('/products')
      .then(setProducts)
      .catch((err: Error) => setError(err.message))
  }, [api])

  const term = search.trim().toLowerCase()
  const visible = (products ?? []).filter(
    (p) => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term),
  )

  return (
    <section>
      <div className="admin__head">
        <h1>Produtos</h1>
        <Link to="novo" className="btn btn-primary">
          Novo produto
        </Link>
      </div>

      <input
        type="search"
        className="admin__search"
        placeholder="Buscar por nome ou categoria..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error && <p className="form__error">{error}</p>}
      {!products && !error && <p className="admin__hint">Carregando...</p>}
      {products?.length === 0 && <p className="admin__hint">Nenhum produto cadastrado ainda.</p>}

      {visible.length > 0 && (
        <div className="table-wrap">
          <table className="table table--clickable">
            <thead>
              <tr>
                <th></th>
                <th>Produto</th>
                <th className="num">Custo unit.</th>
                <th className="num">Preço de venda</th>
                <th className="num">Lucro</th>
                <th className="num">Estoque</th>
                <th>Divulgado em</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => {
                const profit = profitOf(p.unitCost, p.salePrice)
                return (
                  <tr key={p.id} onClick={() => navigate(p.id)}>
                    <td className="thumb-cell">
                      {p.images[0] ? (
                        <img className="thumb" src={assetUrl(p.images[0].url)} alt="" />
                      ) : (
                        <span className="thumb thumb--empty" />
                      )}
                    </td>
                    <td>
                      <Link to={p.id} className="table__title">
                        {p.name}
                      </Link>
                      <small className="table__sub">{p.category}</small>
                    </td>
                    <td className="num">{formatPrice(p.unitCost)}</td>
                    <td className="num">{formatPrice(p.salePrice)}</td>
                    <td className={`num ${profit.value < 0 ? 'profit--neg' : 'profit--pos'}`}>
                      {formatPrice(profit.value)}
                      <small className="table__sub">{formatPercent(profit.percent)}</small>
                    </td>
                    <td
                      className={`num ${p.stock === 0 ? 'qty--out' : p.stock <= LOW_STOCK_THRESHOLD ? 'qty--low' : ''}`}
                    >
                      {p.stock}
                    </td>
                    <td>
                      <div className="tags">
                        {p.listings.length === 0 && <span className="admin__hint">—</span>}
                        {p.listings.map((l) => (
                          <span key={l.platform} className={`tag tag--${l.platform.toLowerCase()}`}>
                            {platformLabel(l.platform)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`tag ${p.isActive ? 'tag--ok' : 'tag--muted'}`}>
                        {p.isActive ? 'Ativo' : 'Inativo'}
                      </span>
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
