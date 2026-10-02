import { PRICE_RANGES, type Category, type PriceRange } from '../data/products'
import './CatalogSidebar.css'

export type CategoryFilter = 'Todos' | Category

interface Props {
  categories: { name: CategoryFilter; count: number }[]
  category: CategoryFilter
  onCategory: (c: CategoryFilter) => void
  priceRange: PriceRange | null
  onPriceRange: (r: PriceRange | null) => void
  inStockOnly: boolean
  onInStockOnly: (v: boolean) => void
}

export function CatalogSidebar({
  categories,
  category,
  onCategory,
  priceRange,
  onPriceRange,
  inStockOnly,
  onInStockOnly,
}: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar__group">
        <h2>Categorias</h2>
        <ul>
          {categories.map((c) => (
            <li key={c.name}>
              <button
                className={category === c.name ? 'is-active' : ''}
                onClick={() => onCategory(c.name)}
              >
                {c.name}
                <span>({c.count})</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar__group">
        <h2>Preço</h2>
        <ul>
          {PRICE_RANGES.map((r) => (
            <li key={r.label}>
              <button
                className={priceRange?.label === r.label ? 'is-active' : ''}
                onClick={() => onPriceRange(priceRange?.label === r.label ? null : r)}
              >
                {r.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar__group">
        <h2>Disponibilidade</h2>
        <label className="sidebar__check">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onInStockOnly(e.target.checked)}
          />
          Somente em estoque
        </label>
      </div>
    </aside>
  )
}
