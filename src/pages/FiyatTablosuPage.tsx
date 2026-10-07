import { useEffect, useState } from 'react'
import type { DragEvent } from 'react'
import { FiEdit2, FiPlus, FiSearch, FiTrash2, FiTrendingUp } from 'react-icons/fi'
import {
  useApplyPriceIncreaseMutation,
  useCreateProductMutation,
  useDeleteBrandMutation,
  useDeleteProductMutation,
  useGetProductListQuery,
  useReorderBrandsMutation,
  useUpdateProductMutation,
} from '../api/productApi'
import { useAppDispatch } from '../app/hooks'
import { PriceIncreaseForm } from '../components/PriceIncreaseForm'
import { ProductForm } from '../components/ProductForm'
import { setGlobalLoading } from '../features/ui/uiSlice'
import type {
  PriceIncreaseScope,
  Product,
  ProductApplyPriceIncreaseRequest,
  ProductBrandGroup,
  ProductCreateRequest,
  ProductUpdateRequest,
} from '../types/product'
import '../components/DataTable.css'
import './YaglamaServisiPage.css'
import './FiyatTablosuPage.css'

const PAGE_SIZE = 20

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatAmount(value: number): string {
  return value.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (
    err &&
    typeof err === 'object' &&
    'data' in err &&
    err.data &&
    typeof err.data === 'object' &&
    'message' in err.data &&
    typeof err.data.message === 'string'
  ) {
    return err.data.message
  }
  return fallback
}

export function FiyatTablosuPage() {
  const dispatch = useAppDispatch()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [initialBrand, setInitialBrand] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [groups, setGroups] = useState<ProductBrandGroup[]>([])
  const [visibleBrands, setVisibleBrands] = useState<Record<string, boolean>>(
    {},
  )
  const [dragBrand, setDragBrand] = useState<string | null>(null)
  const [dragOverBrand, setDragOverBrand] = useState<string | null>(null)
  const [zamOpen, setZamOpen] = useState(false)
  const [zamScope, setZamScope] = useState<PriceIncreaseScope>('all')
  const [zamBrand, setZamBrand] = useState('')
  const [zamProduct, setZamProduct] = useState<Product | null>(null)

  const { data, isFetching, isError, error } = useGetProductListQuery({
    page,
    pageSize: PAGE_SIZE,
    search: search || null,
  })
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation()
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation()
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation()
  const [deleteBrand, { isLoading: isDeletingBrand }] = useDeleteBrandMutation()
  const [reorderBrands, { isLoading: isReordering }] = useReorderBrandsMutation()
  const [applyPriceIncrease, { isLoading: isApplyingZam }] =
    useApplyPriceIncreaseMutation()

  useEffect(() => {
    const items = data?.items ?? []
    setGroups(items)
    setVisibleBrands((prev) => {
      const next = { ...prev }
      const current = new Set(items.map((g) => g.brand))
      for (const group of items) {
        if (next[group.brand] === undefined) next[group.brand] = true
      }
      for (const brand of Object.keys(next)) {
        if (!current.has(brand)) delete next[brand]
      }
      return next
    })
  }, [data])

  useEffect(() => {
    dispatch(
      setGlobalLoading(
        isFetching ||
          isCreating ||
          isUpdating ||
          isDeleting ||
          isDeletingBrand ||
          isReordering ||
          isApplyingZam,
      ),
    )
    return () => {
      dispatch(setGlobalLoading(false))
    }
  }, [
    dispatch,
    isFetching,
    isCreating,
    isUpdating,
    isDeleting,
    isDeletingBrand,
    isReordering,
    isApplyingZam,
  ])

  const totalPages = Math.max(
    1,
    Math.ceil((data?.totalCount ?? 0) / (data?.pageSize ?? PAGE_SIZE)),
  )

  const visibleGroups = groups.filter(
    (group) => visibleBrands[group.brand] !== false,
  )

  const toggleBrandVisible = (brand: string) => {
    setVisibleBrands((prev) => ({
      ...prev,
      [brand]: !(prev[brand] !== false),
    }))
  }

  const showAllBrands = () => {
    setVisibleBrands((prev) => {
      const next = { ...prev }
      for (const group of groups) next[group.brand] = true
      return next
    })
  }

  const hideAllBrands = () => {
    setVisibleBrands((prev) => {
      const next = { ...prev }
      for (const group of groups) next[group.brand] = false
      return next
    })
  }

  const openCreate = (brand = '') => {
    setFormMode('create')
    setInitialBrand(brand)
    setEditingProduct(null)
    setFormOpen(true)
  }

  const openEdit = (product: Product) => {
    setFormMode('edit')
    setInitialBrand('')
    setEditingProduct(product)
    setFormOpen(true)
  }

  const openZam = (
    scope: PriceIncreaseScope,
    options?: { brand?: string; product?: Product },
  ) => {
    setZamScope(scope)
    setZamBrand(options?.brand ?? '')
    setZamProduct(options?.product ?? null)
    setZamOpen(true)
  }

  const handleApplyZam = async (payload: ProductApplyPriceIncreaseRequest) => {
    const result = await applyPriceIncrease(payload).unwrap()
    const skipped =
      result.skippedCount > 0
        ? ` (${result.skippedCount} ürün atlandı)`
        : ''
    alert(`${result.updatedCount} ürünün fiyatı güncellendi.${skipped}`)
  }

  const handleSearchSubmit = () => {
    setSearch(searchInput.trim())
    setPage(1)
  }

  const handleCreate = async (payload: ProductCreateRequest) => {
    await createProduct(payload).unwrap()
    setPage(1)
  }

  const handleUpdate = async (payload: ProductUpdateRequest) => {
    await updateProduct(payload).unwrap()
  }

  const handleDeleteProduct = async (product: Product) => {
    const ok = window.confirm(
      `"${product.brand} / ${product.name}" ürününü silmek istediğinize emin misiniz?`,
    )
    if (!ok) return

    try {
      await deleteProduct({ id: product.id }).unwrap()
      if ((data?.items.length ?? 0) <= 1 && page > 1) {
        setPage((p) => p - 1)
      }
    } catch (err) {
      alert(getErrorMessage(err, 'Ürün silinemedi.'))
    }
  }

  const handleDeleteBrand = async (brand: string) => {
    const ok = window.confirm(
      `"${brand}" markasını ve tüm ürünlerini silmek istediğinize emin misiniz?`,
    )
    if (!ok) return

    try {
      await deleteBrand({ brand }).unwrap()
      if ((data?.items.length ?? 0) <= 1 && page > 1) {
        setPage((p) => p - 1)
      }
    } catch (err) {
      alert(getErrorMessage(err, 'Marka silinemedi.'))
    }
  }

  const handleDragStart = (brand: string) => (e: DragEvent<HTMLElement>) => {
    setDragBrand(brand)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', brand)
  }

  const handleDragOver = (brand: string) => (e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverBrand !== brand) setDragOverBrand(brand)
  }

  const handleDragLeave = (brand: string) => () => {
    if (dragOverBrand === brand) setDragOverBrand(null)
  }

  const handleDrop = (targetBrand: string) => async (e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    const sourceBrand = dragBrand ?? e.dataTransfer.getData('text/plain')
    setDragBrand(null)
    setDragOverBrand(null)

    if (!sourceBrand || sourceBrand === targetBrand) return

    const fromIndex = groups.findIndex((g) => g.brand === sourceBrand)
    const toIndex = groups.findIndex((g) => g.brand === targetBrand)
    if (fromIndex < 0 || toIndex < 0) return

    const next = [...groups]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    setGroups(next)

    try {
      await reorderBrands({ brands: next.map((g) => g.brand) }).unwrap()
    } catch (err) {
      setGroups(data?.items ?? [])
      alert(getErrorMessage(err, 'Sıralama kaydedilemedi.'))
    }
  }

  const handleDragEnd = () => {
    setDragBrand(null)
    setDragOverBrand(null)
  }

  const listError =
    isError &&
    error &&
    typeof error === 'object' &&
    'data' in error &&
    error.data &&
    typeof error.data === 'object' &&
    'message' in error.data &&
    typeof error.data.message === 'string'
      ? error.data.message
      : isError
        ? 'Liste yüklenemedi.'
        : null

  return (
    <div className="yaglama-page fiyat-page">
      <header className="yaglama-page__header">
        <div>
          <h1>Fiyat Tablosu</h1>
          <p>
            Markaları sürükleyerek yan yana sıralayın; ürün ve fiyatlar dikey
            listelenir.
          </p>
        </div>
      </header>

      {listError ? (
        <div className="yaglama-page__error" role="alert">
          {listError}
        </div>
      ) : null}

      <div className="fiyat-page__toolbar">
        <div className="fiyat-page__toolbar-left">
          <label className="data-table__search">
            <FiSearch aria-hidden />
            <input
              type="search"
              placeholder="Marka veya ürün ara..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchSubmit()
              }}
            />
          </label>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={handleSearchSubmit}
          >
            Ara
          </button>
        </div>
        <div className="fiyat-page__toolbar-actions">
          <span className="data-table__count">
            {data?.totalCount ?? 0} marka
          </span>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => openZam('all')}
            disabled={groups.length === 0}
            title="Tüm ürünlere zam uygula"
          >
            <FiTrendingUp aria-hidden />
            Toplu Zam
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => openZam('brand')}
            disabled={groups.length === 0}
            title="Marka bazlı zam uygula"
          >
            <FiTrendingUp aria-hidden />
            Marka Zamı
          </button>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => openCreate()}
          >
            <FiPlus aria-hidden />
            Yeni Ürün
          </button>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="fiyat-page__empty">
          {search
            ? 'Aramanızla eşleşen kayıt bulunamadı.'
            : 'Henüz ürün yok. Yeni ürün ekleyerek başlayın.'}
        </div>
      ) : (
        <>
          <div className="fiyat-page__brand-filters">
            <div className="fiyat-page__brand-filters-head">
              <span>Görünür markalar</span>
              <div className="fiyat-page__brand-filters-actions">
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={showAllBrands}
                >
                  Tümü
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={hideAllBrands}
                >
                  Hiçbiri
                </button>
              </div>
            </div>
            <div className="fiyat-page__brand-checks">
              {groups.map((group) => {
                const checked = visibleBrands[group.brand] !== false
                return (
                  <label key={group.brand} className="fiyat-page__brand-check">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleBrandVisible(group.brand)}
                    />
                    <span>{group.brand}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {visibleGroups.length === 0 ? (
            <div className="fiyat-page__empty">
              Görünür marka seçilmedi. Yukarıdan en az bir marka işaretleyin.
            </div>
          ) : (
            <div className="fiyat-page__board">
              {visibleGroups.map((group) => {
                const isDragging = dragBrand === group.brand
                const isDropTarget =
                  dragOverBrand === group.brand && dragBrand !== group.brand

                return (
                  <section
                    key={group.brand}
                    className={`fiyat-page__column${isDragging ? ' is-dragging' : ''}${isDropTarget ? ' is-drop-target' : ''}`}
                    draggable
                    onDragStart={handleDragStart(group.brand)}
                    onDragOver={handleDragOver(group.brand)}
                    onDragLeave={handleDragLeave(group.brand)}
                    onDrop={(e) => void handleDrop(group.brand)(e)}
                    onDragEnd={handleDragEnd}
                  >
                    <header className="fiyat-page__column-head">
                      <div className="fiyat-page__column-title">
                        <h2 title="Sürükleyerek sıralayın">{group.brand}</h2>
                        <span>{group.productCount} ürün</span>
                      </div>
                      <div
                        className="fiyat-page__column-actions"
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="btn btn--edit"
                          aria-label="Markaya zam"
                          title="Markaya zam"
                          onClick={() =>
                            openZam('brand', { brand: group.brand })
                          }
                        >
                          <FiTrendingUp aria-hidden />
                        </button>
                        <button
                          type="button"
                          className="btn btn--edit"
                          aria-label="Ürün ekle"
                          title="Ürün ekle"
                          onClick={() => openCreate(group.brand)}
                        >
                          <FiPlus aria-hidden />
                        </button>
                        <button
                          type="button"
                          className="btn btn--danger"
                          aria-label="Markayı sil"
                          title="Markayı sil"
                          onClick={() => void handleDeleteBrand(group.brand)}
                        >
                          <FiTrash2 aria-hidden />
                        </button>
                      </div>
                    </header>

                    <ul className="fiyat-page__product-list">
                      {group.products.length === 0 ? (
                        <li className="fiyat-page__product-empty">Ürün yok</li>
                      ) : (
                        group.products.map((product) => (
                          <li key={product.id} className="fiyat-page__product">
                            <div className="fiyat-page__product-name-wrap">
                              <strong className="fiyat-page__product-name">
                                {product.name}
                              </strong>
                              <span className="fiyat-page__product-date">
                                {product.lastPriceDate
                                  ? formatDateTime(product.lastPriceDate)
                                  : '—'}
                              </span>
                            </div>
                            <div className="fiyat-page__product-side">
                              <span className="fiyat-page__product-price">
                                {product.price != null
                                  ? formatAmount(product.price)
                                  : '—'}
                              </span>
                              <div
                                className="data-table__actions"
                                onPointerDown={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  className="btn btn--edit"
                                  aria-label="Zam uygula"
                                  title="Zam uygula"
                                  onClick={() =>
                                    openZam('product', { product })
                                  }
                                >
                                  <FiTrendingUp aria-hidden />
                                </button>
                                <button
                                  type="button"
                                  className="btn btn--edit"
                                  aria-label="Düzenle"
                                  title="Düzenle"
                                  onClick={() => openEdit(product)}
                                >
                                  <FiEdit2 aria-hidden />
                                </button>
                                <button
                                  type="button"
                                  className="btn btn--danger"
                                  aria-label="Sil"
                                  title="Sil"
                                  onClick={() =>
                                    void handleDeleteProduct(product)
                                  }
                                >
                                  <FiTrash2 aria-hidden />
                                </button>
                              </div>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </section>
                )
              })}
            </div>
          )}
        </>
      )}

      {totalPages > 1 ? (
        <div className="data-table__pagination">
          <button
            type="button"
            className="btn btn--ghost"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Önceki
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            type="button"
            className="btn btn--ghost"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Sonraki
          </button>
        </div>
      ) : null}

      <ProductForm
        open={formOpen}
        mode={formMode}
        initialBrand={initialBrand}
        product={editingProduct}
        onClose={() => setFormOpen(false)}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        isSubmitting={isCreating || isUpdating}
      />

      <PriceIncreaseForm
        open={zamOpen}
        scope={zamScope}
        brand={zamBrand}
        product={zamProduct}
        brands={groups.map((g) => g.brand)}
        onClose={() => setZamOpen(false)}
        onSubmit={handleApplyZam}
        isSubmitting={isApplyingZam}
      />
    </div>
  )
}
