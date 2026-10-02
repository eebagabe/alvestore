import { useMemo, useState } from 'react'
import banner from '../assets/banner.png'
import { CatalogSidebar, type CategoryFilter } from '../components/CatalogSidebar'
import { Header } from '../components/Header'
import { ProductCard } from '../components/ProductCard'
import { products, type PriceRange } from '../data/products'
import './Catalog.css'

const CURRENT_YEAR = new Date().getFullYear()

export function Catalog() {
  const [category, setCategory] = useState<CategoryFilter>('Todos')
  const [priceRange, setPriceRange] = useState<PriceRange | null>(null)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [search, setSearch] = useState('')

  const categories = useMemo(() => {
    const counts = new Map<CategoryFilter, number>([['Todos', products.length]])
    for (const p of products) counts.set(p.category, (counts.get(p.category) ?? 0) + 1)
    return [...counts].map(([name, count]) => ({ name, count }))
  }, [])

  const visible = products.filter((p) => {
    const matchCategory = category === 'Todos' || p.category === category
    const matchSearch = p.name.toLowerCase().includes(search.trim().toLowerCase())
    const matchPrice = !priceRange || (p.price >= priceRange.min && p.price < priceRange.max)
    const matchStock = !inStockOnly || p.stock > 0
    return matchCategory && matchSearch && matchPrice && matchStock
  })

  return (
    <>
      <Header />
      <section className="hero">
        <img src={banner} alt="AlveStore — Qualidade, praticidade, sempre com você" />
      </section>

      <main className="container catalog">
        <div className="catalog__head">
          <h1>Catálogo</h1>
          <input
            type="search"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="catalog__filters">
          {categories.map((c) => (
            <button
              key={c.name}
              className={`chip ${category === c.name ? 'chip--active' : ''}`}
              onClick={() => setCategory(c.name)}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="catalog__layout">
          <CatalogSidebar
            categories={categories}
            category={category}
            onCategory={setCategory}
            priceRange={priceRange}
            onPriceRange={setPriceRange}
            inStockOnly={inStockOnly}
            onInStockOnly={setInStockOnly}
          />

          {visible.length === 0 ? (
            <p className="catalog__empty">Nenhum produto encontrado.</p>
          ) : (
            <div className="catalog__grid">
              {visible.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          © {CURRENT_YEAR} AlveStore · Maceió - AL · Qualidade • Praticidade • Sempre com você
        </div>
      </footer>
    </>
  )
}
