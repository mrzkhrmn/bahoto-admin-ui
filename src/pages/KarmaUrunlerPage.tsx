import { useEffect, useMemo, useState } from 'react'
import { FiEdit2, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi'
import {
  useCreateKarmaProductMutation,
  useDeleteKarmaProductMutation,
  useGetKarmaProductListQuery,
  useUpdateKarmaProductMutation,
} from '../api/karmaProductApi'
import { useAppDispatch } from '../app/hooks'
import { KarmaProductForm } from '../components/KarmaProductForm'
import { setGlobalLoading } from '../features/ui/uiSlice'
import type {
  KarmaProduct,
  KarmaProductCreateRequest,
  KarmaProductUpdateRequest,
} from '../types/karmaProduct'
import '../components/DataTable.css'
import './YaglamaServisiPage.css'
import './KarmaUrunlerPage.css'

interface BrandGroup {
  brand: string
  products: KarmaProduct[]
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

function groupByBrand(items: KarmaProduct[]): BrandGroup[] {
  const map = new Map<string, KarmaProduct[]>()
  for (const item of items) {
    const key = item.brand
    const list = map.get(key)
    if (list) list.push(item)
    else map.set(key, [item])
  }

  return Array.from(map.entries())
    .map(([brand, products]) => ({
      brand,
      products: [...products].sort((a, b) =>
        a.name.localeCompare(b.name, 'tr'),
      ),
    }))
    .sort((a, b) => a.brand.localeCompare(b.brand, 'tr'))
}

export function KarmaUrunlerPage() {
  const dispatch = useAppDispatch()
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [initialBrand, setInitialBrand] = useState('')
  const [editing, setEditing] = useState<KarmaProduct | null>(null)

  const { data, isFetching, isError, error } = useGetKarmaProductListQuery({
    search: search || null,
  })
  const [createProduct, { isLoading: isCreating }] =
    useCreateKarmaProductMutation()
  const [updateProduct, { isLoading: isUpdating }] =
    useUpdateKarmaProductMutation()
  const [deleteProduct, { isLoading: isDeleting }] =
    useDeleteKarmaProductMutation()

  useEffect(() => {
    dispatch(
      setGlobalLoading(isFetching || isCreating || isUpdating || isDeleting),
    )
    return () => {
      dispatch(setGlobalLoading(false))
    }
  }, [dispatch, isFetching, isCreating, isUpdating, isDeleting])

  const items = useMemo(() => data?.items ?? [], [data?.items])
  const groups = useMemo(() => groupByBrand(items), [items])

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

  const handleSearchSubmit = () => {
    setSearch(searchInput.trim())
  }

  const openCreate = (brand = '') => {
    setFormMode('create')
    setInitialBrand(brand)
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (product: KarmaProduct) => {
    setFormMode('edit')
    setInitialBrand('')
    setEditing(product)
    setFormOpen(true)
  }

  const handleCreate = async (payload: KarmaProductCreateRequest) => {
    await createProduct(payload).unwrap()
  }

  const handleUpdate = async (payload: KarmaProductUpdateRequest) => {
    await updateProduct(payload).unwrap()
  }

  const handleDelete = async (product: KarmaProduct) => {
    const ok = window.confirm(
      `"${product.brand} / ${product.name}" ürününü silmek istediğinize emin misiniz?`,
    )
    if (!ok) return

    try {
      await deleteProduct({ id: product.id }).unwrap()
    } catch (err) {
      alert(getErrorMessage(err, 'Ürün silinemedi.'))
    }
  }

  return (
    <div className="yaglama-page karma-page">
      <header className="karma-page__header">
        <h1>Karma Ürünler</h1>
        <div className="karma-page__toolbar">
          <label className="data-table__search karma-page__search">
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
            className="btn btn--ghost btn--sm"
            onClick={handleSearchSubmit}
          >
            Ara
          </button>
          <span className="karma-page__count">
            {groups.length} marka · {items.length} ürün
          </span>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => openCreate()}
          >
            <FiPlus aria-hidden />
            Yeni Ürün
          </button>
        </div>
      </header>

      {listError ? (
        <div className="yaglama-page__error" role="alert">
          {listError}
        </div>
      ) : null}

      {groups.length === 0 && !listError ? (
        <div className="karma-page__empty">
          {search
            ? 'Aramanızla eşleşen kayıt bulunamadı.'
            : 'Henüz karma ürün yok. Yeni ürün ekleyerek başlayın.'}
        </div>
      ) : (
        <div className="karma-page__board">
          {groups.map((group) => (
            <section key={group.brand} className="karma-page__column">
              <header className="karma-page__column-head">
                <div className="karma-page__column-title">
                  <h2>{group.brand}</h2>
                  <span>{group.products.length} ürün</span>
                </div>
                <button
                  type="button"
                  className="btn btn--edit"
                  aria-label="Bu markaya ürün ekle"
                  title="Bu markaya ürün ekle"
                  onClick={() => openCreate(group.brand)}
                >
                  <FiPlus aria-hidden />
                </button>
              </header>

              <ul className="karma-page__product-list">
                {group.products.map((product) => (
                  <li key={product.id} className="karma-page__product">
                    <div className="karma-page__product-main">
                      <strong className="karma-page__name" title={product.name}>
                        {product.name}
                      </strong>
                      <span className="karma-page__price">
                        {product.price != null
                          ? formatAmount(product.price)
                          : '—'}
                      </span>
                    </div>
                    <div className="karma-page__card-actions">
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
                        onClick={() => void handleDelete(product)}
                      >
                        <FiTrash2 aria-hidden />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <KarmaProductForm
        open={formOpen}
        mode={formMode}
        initialBrand={initialBrand}
        product={editing}
        onClose={() => setFormOpen(false)}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        isSubmitting={isCreating || isUpdating}
      />
    </div>
  )
}
