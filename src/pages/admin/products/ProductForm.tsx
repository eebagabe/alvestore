import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAdminApi } from '../../../hooks/useAdminApi'
import { assetUrl } from '../../../services/api'
import { PLATFORMS, type AdminProduct, type Platform, type SaveProductPayload } from '../../../types/admin'
import { formatPercent, formatPrice, profitOf } from '../../../utils/format'

type ListingState = Record<Platform, { enabled: boolean; url: string }>

const emptyListings = (): ListingState => ({
  Facebook: { enabled: false, url: '' },
  Instagram: { enabled: false, url: '' },
  Olx: { enabled: false, url: '' },
})

const parseMoney = (value: string) => Number(value.replace(',', '.'))

export function ProductForm() {
  const { id } = useParams()
  const isNew = !id
  const api = useAdminApi()
  const navigate = useNavigate()

  const [product, setProduct] = useState<AdminProduct | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [unitCost, setUnitCost] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [initialStock, setInitialStock] = useState('0')
  const [listings, setListings] = useState<ListingState>(emptyListings)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    api<AdminProduct[]>('/products')
      .then((all) => setCategories([...new Set(all.map((p) => p.category))].sort()))
      .catch(() => setCategories([]))
  }, [api])

  useEffect(() => {
    if (!id) return
    api<AdminProduct>(`/products/${id}`)
      .then((p) => {
        setProduct(p)
        setName(p.name)
        setCategory(p.category)
        setDescription(p.description)
        setUnitCost(String(p.unitCost))
        setSalePrice(String(p.salePrice))
        setIsActive(p.isActive)
        const state = emptyListings()
        for (const l of p.listings) state[l.platform] = { enabled: true, url: l.url ?? '' }
        setListings(state)
      })
      .catch((err: Error) => setError(err.message))
  }, [api, id])

  const previews = useMemo(() => pendingFiles.map((f) => URL.createObjectURL(f)), [pendingFiles])
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews])

  const cost = parseMoney(unitCost) || 0
  const price = parseMoney(salePrice) || 0
  const profit = profitOf(cost, price)

  const uploadImages = async (productId: string, files: File[]) => {
    const body = new FormData()
    files.forEach((f) => body.append('files', f))
    return api<AdminProduct>(`/products/${productId}/images`, { method: 'POST', body })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (Number.isNaN(parseMoney(unitCost)) || Number.isNaN(parseMoney(salePrice))) {
      setError('Informe valores numéricos para custo e preço.')
      return
    }

    const payload: SaveProductPayload = {
      name,
      description,
      category,
      unitCost: cost,
      salePrice: price,
      isActive,
      listings: PLATFORMS.filter((p) => listings[p.value].enabled).map((p) => ({
        platform: p.value,
        url: listings[p.value].url.trim() || null,
      })),
    }
    if (isNew) payload.initialStock = Number(initialStock) || 0

    setSaving(true)
    try {
      const saved = await api<AdminProduct>(isNew ? '/products' : `/products/${id}`, {
        method: isNew ? 'POST' : 'PUT',
        body: JSON.stringify(payload),
      })
      if (isNew && pendingFiles.length > 0) {
        try {
          await uploadImages(saved.id, pendingFiles)
        } catch (err) {
          alert(`Produto salvo, mas as fotos não foram enviadas: ${(err as Error).message}`)
          navigate(`/admin/painel/produtos/${saved.id}`, { replace: true })
          return
        }
      }
      navigate('/admin/painel/produtos')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const list = [...files]
    if (!product) {
      setPendingFiles((prev) => [...prev, ...list])
      return
    }
    setError('')
    setUploading(true)
    try {
      setProduct(await uploadImages(product.id, list))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = async (imageId: string) => {
    if (!product || !confirm('Remover esta foto?')) return
    try {
      setProduct(await api<AdminProduct>(`/products/${product.id}/images/${imageId}`, { method: 'DELETE' }))
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const makeCover = async (imageId: string) => {
    if (!product) return
    const order = [imageId, ...product.images.map((i) => i.id).filter((i) => i !== imageId)]
    try {
      setProduct(
        await api<AdminProduct>(`/products/${product.id}/images/order`, {
          method: 'PUT',
          body: JSON.stringify(order),
        }),
      )
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleDelete = async () => {
    if (!product || !confirm(`Excluir "${product.name}"? Esta ação não pode ser desfeita.`)) return
    try {
      await api(`/products/${product.id}`, { method: 'DELETE' })
      navigate('/admin/painel/produtos')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  if (!isNew && !product && !error) return <p className="admin__hint">Carregando...</p>

  return (
    <section>
      <div className="admin__head">
        <h1>{isNew ? 'Novo produto' : 'Editar produto'}</h1>
        <Link to="/admin/painel/produtos" className="btn btn-ghost">
          Voltar
        </Link>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <div className="panel">
          <h2>Dados do produto</h2>
          <div className="form__grid">
            <label className="form__full">
              Nome
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={150} required />
            </label>
            <label>
              Categoria
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                list="product-categories"
                maxLength={60}
                required
              />
              <datalist id="product-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
            <label className="form__check">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Visível no catálogo
            </label>
            <label className="form__full">
              Descrição
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                rows={4}
              />
            </label>
          </div>
        </div>

        <div className="panel">
          <h2>Preço</h2>
          <div className="form__grid form__grid--3">
            <label>
              Custo unitário (R$)
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                required
              />
            </label>
            <label>
              Preço de venda (R$)
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                required
              />
            </label>
            <div className={`profit-box ${profit.value < 0 ? 'profit--neg' : 'profit--pos'}`}>
              <span>Lucro por unidade</span>
              <strong>{formatPrice(profit.value)}</strong>
              <small>{formatPercent(profit.percent)} sobre o custo</small>
            </div>
          </div>
          {isNew && (
            <div className="form__grid form__grid--3">
              <label>
                Estoque inicial
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={initialStock}
                  onChange={(e) => setInitialStock(e.target.value)}
                />
              </label>
            </div>
          )}
          {!isNew && product && (
            <p className="admin__hint">
              Estoque atual: <strong>{product.stock}</strong>. Para alterar, use a tela de{' '}
              <Link to="/admin/painel/estoque">Estoque</Link>.
            </p>
          )}
        </div>

        <div className="panel">
          <h2>Divulgação</h2>
          <p className="admin__hint">Marque onde o produto foi anunciado. O link é opcional.</p>
          <div className="listings">
            {PLATFORMS.map((p) => (
              <div key={p.value} className="listings__row">
                <label className="form__check">
                  <input
                    type="checkbox"
                    checked={listings[p.value].enabled}
                    onChange={(e) =>
                      setListings((prev) => ({ ...prev, [p.value]: { ...prev[p.value], enabled: e.target.checked } }))
                    }
                  />
                  {p.label}
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  disabled={!listings[p.value].enabled}
                  value={listings[p.value].url}
                  maxLength={500}
                  onChange={(e) =>
                    setListings((prev) => ({ ...prev, [p.value]: { ...prev[p.value], url: e.target.value } }))
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>Fotos</h2>
          <p className="admin__hint">JPG, PNG, WEBP ou GIF até 5 MB. A primeira foto é a capa no catálogo.</p>
          <div className="gallery">
            {product?.images.map((img, index) => (
              <figure key={img.id} className="gallery__item">
                <img src={assetUrl(img.url)} alt="" />
                {index === 0 && <span className="gallery__badge">Capa</span>}
                <figcaption>
                  {index > 0 && (
                    <button type="button" onClick={() => makeCover(img.id)}>
                      Tornar capa
                    </button>
                  )}
                  <button type="button" className="danger" onClick={() => removeImage(img.id)}>
                    Remover
                  </button>
                </figcaption>
              </figure>
            ))}
            {previews.map((url, index) => (
              <figure key={url} className="gallery__item">
                <img src={url} alt="" />
                {index === 0 && <span className="gallery__badge">Capa</span>}
                <figcaption>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => setPendingFiles((prev) => prev.filter((_, i) => i !== index))}
                  >
                    Remover
                  </button>
                </figcaption>
              </figure>
            ))}
            <label className="gallery__add">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                disabled={uploading}
                onChange={(e) => {
                  handleFiles(e.target.files)
                  e.target.value = ''
                }}
              />
              {uploading ? 'Enviando...' : '+ Adicionar fotos'}
            </label>
          </div>
        </div>

        {error && <p className="form__error">{error}</p>}

        <div className="form__actions">
          {!isNew && (
            <button type="button" className="btn btn-danger" onClick={handleDelete}>
              Excluir
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </section>
  )
}
