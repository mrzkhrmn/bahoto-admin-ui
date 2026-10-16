import { Fragment, useEffect, useMemo, useState } from 'react'
import {
  FiChevronDown,
  FiChevronRight,
  FiEdit2,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
} from 'react-icons/fi'
import {
  useCreateCariMutation,
  useCreateCariWithProductMutation,
  useDeleteCariBrandMutation,
  useDeleteCariItemMutation,
  useDeleteCariMutation,
  useGetCariListQuery,
  useUpdateCariMutation,
} from '../api/cariApi'
import { useAppDispatch } from '../app/hooks'
import { CariCreateForm } from '../components/CariCreateForm'
import { CariEntryAddForm } from '../components/CariEntryAddForm'
import { CariEntryEditForm } from '../components/CariEntryEditForm'
import { setGlobalLoading } from '../features/ui/uiSlice'
import type {
  Cari,
  CariCreateRequest,
  CariCreateWithProductRequest,
  CariProductGroup,
  CariUpdateRequest,
} from '../types/cari'
import '../components/DataTable.css'
import './YaglamaServisiPage.css'
import './CariPage.css'

const FETCH_PAGE_SIZE = 1000
const BRAND_PAGE_SIZE = 15

type BrandGroup = {
  brand: string
  products: CariProductGroup[]
}

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('tr-TR')
}

function formatDisplayDate(value: string): string {
  const [year, month, day] = value.split('-')
  if (!year || !month || !day) return value
  return `${day}.${month}.${year}`
}

function formatAmount(value: number): string {
  return value.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatQuantity(quantity: number, unit: string): string {
  const label = unit?.toLowerCase() === 'koli' ? 'koli' : 'adet'
  return `${quantity} ${label}`
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

function balanceClassName(balance: number): string {
  if (balance > 0) return 'is-debt'
  if (balance < 0) return 'is-credit'
  return 'is-zero'
}

export function CariPage() {
  const dispatch = useAppDispatch()
  const [brandPage, setBrandPage] = useState(1)
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null)
  const [expandedProductId, setExpandedProductId] = useState<string | null>(
    null,
  )
  const [formOpen, setFormOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Cari | null>(null)
  const [addingProduct, setAddingProduct] = useState<CariProductGroup | null>(
    null,
  )

  const dateFilterActive = Boolean(startDate || endDate)

  const { data, isFetching, isError, error } = useGetCariListQuery({
    page: 1,
    pageSize: FETCH_PAGE_SIZE,
    startDate: startDate || null,
    endDate: endDate || null,
  })
  const [createWithProduct, { isLoading: isCreatingProduct }] =
    useCreateCariWithProductMutation()
  const [createCari, { isLoading: isCreatingEntry }] = useCreateCariMutation()
  const [updateCari, { isLoading: isUpdating }] = useUpdateCariMutation()
  const [deleteCari, { isLoading: isDeleting }] = useDeleteCariMutation()
  const [deleteCariItem, { isLoading: isDeletingItem }] =
    useDeleteCariItemMutation()
  const [deleteCariBrand, { isLoading: isDeletingBrand }] =
    useDeleteCariBrandMutation()

  useEffect(() => {
    dispatch(
      setGlobalLoading(
        isFetching ||
          isCreatingProduct ||
          isCreatingEntry ||
          isUpdating ||
          isDeleting ||
          isDeletingItem ||
          isDeletingBrand,
      ),
    )
    return () => {
      dispatch(setGlobalLoading(false))
    }
  }, [
    dispatch,
    isFetching,
    isCreatingProduct,
    isCreatingEntry,
    isUpdating,
    isDeleting,
    isDeletingItem,
    isDeletingBrand,
  ])

  const groups = data?.items ?? []

  const brandGroups = useMemo((): BrandGroup[] => {
    const q = search.trim().toLocaleLowerCase('tr')
    const byBrand = new Map<string, CariProductGroup[]>()

    for (const group of groups) {
      const brandKey = group.brand.trim() || 'Markasız'
      if (q) {
        const haystack = `${group.brand} ${group.name}`.toLocaleLowerCase('tr')
        if (!haystack.includes(q)) continue
      }
      const list = byBrand.get(brandKey) ?? []
      list.push(group)
      byBrand.set(brandKey, list)
    }

    return Array.from(byBrand.entries())
      .map(([brand, products]) => ({
        brand,
        products: [...products].sort((a, b) =>
          a.name.localeCompare(b.name, 'tr'),
        ),
      }))
      .sort((a, b) => a.brand.localeCompare(b.brand, 'tr'))
  }, [groups, search])

  const totalBrandPages = Math.max(
    1,
    Math.ceil(brandGroups.length / BRAND_PAGE_SIZE),
  )

  const pagedBrands = useMemo(() => {
    const start = (brandPage - 1) * BRAND_PAGE_SIZE
    return brandGroups.slice(start, start + BRAND_PAGE_SIZE)
  }, [brandGroups, brandPage])

  useEffect(() => {
    if (brandPage > totalBrandPages) {
      setBrandPage(totalBrandPages)
    }
  }, [brandPage, totalBrandPages])

  const rangeLabel = (() => {
    if (startDate && endDate) {
      return `${formatDisplayDate(startDate)} – ${formatDisplayDate(endDate)}`
    }
    if (startDate) return `${formatDisplayDate(startDate)} ve sonrası`
    if (endDate) return `${formatDisplayDate(endDate)} ve öncesi`
    return null
  })()

  const handleStartDateChange = (date: string) => {
    setStartDate(date)
    setBrandPage(1)
    if (endDate && date && date > endDate) setEndDate(date)
  }

  const handleEndDateChange = (date: string) => {
    setEndDate(date)
    setBrandPage(1)
    if (startDate && date && date < startDate) setStartDate(date)
  }

  const clearDateFilter = () => {
    setStartDate('')
    setEndDate('')
    setBrandPage(1)
  }

  const toggleBrand = (brand: string) => {
    setExpandedBrand((prev) => {
      if (prev === brand) {
        setExpandedProductId(null)
        return null
      }
      setExpandedProductId(null)
      return brand
    })
  }

  const toggleProduct = (cariItemId: string) => {
    setExpandedProductId((prev) => (prev === cariItemId ? null : cariItemId))
  }

  const handleCreateProduct = async (payload: CariCreateWithProductRequest) => {
    await createWithProduct(payload).unwrap()
    setBrandPage(1)
  }

  const handleAddEntry = async (payload: CariCreateRequest) => {
    await createCari(payload).unwrap()
  }

  const handleUpdateEntry = async (payload: CariUpdateRequest) => {
    await updateCari(payload).unwrap()
  }

  const handleDeleteEntry = async (entry: Cari) => {
    const ok = window.confirm(
      `${formatDateTime(entry.createdAt)} tarihli hareketi silmek istediğinize emin misiniz?`,
    )
    if (!ok) return

    try {
      await deleteCari({ id: entry.id }).unwrap()
    } catch (err) {
      alert(getErrorMessage(err, 'Cari kaydı silinemedi.'))
    }
  }

  const handleDeleteProduct = async (group: CariProductGroup) => {
    const label = group.name?.trim()
      ? `${group.brand?.trim() || 'Markasız'} — ${group.name}`
      : group.brand?.trim() || 'Markasız'
    const ok = window.confirm(
      `"${label}" ürününü ve tüm hareketlerini silmek istediğinize emin misiniz?`,
    )
    if (!ok) return

    try {
      await deleteCariItem({ cariItemId: group.cariItemId }).unwrap()
      setExpandedProductId((prev) =>
        prev === group.cariItemId ? null : prev,
      )
    } catch (err) {
      alert(getErrorMessage(err, 'Cari ürünü silinemedi.'))
    }
  }

  const handleDeleteBrand = async (brandGroup: BrandGroup) => {
    const rawBrand = brandGroup.products[0]?.brand?.trim() ?? ''
    const label = brandGroup.brand
    const ok = window.confirm(
      `"${label}" markasını, ürünlerini ve tüm hareketlerini silmek istediğinize emin misiniz?`,
    )
    if (!ok) return

    try {
      await deleteCariBrand({ brand: rawBrand }).unwrap()
      setExpandedBrand((prev) => (prev === brandGroup.brand ? null : prev))
      setExpandedProductId(null)
    } catch (err) {
      alert(getErrorMessage(err, 'Marka silinemedi.'))
    }
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
    <div className="yaglama-page cari-page">
      <header className="yaglama-page__header">
        <div>
          <h1>Cari</h1>
        </div>
        <button
          type="button"
          className="btn btn--primary yaglama-page__add"
          onClick={() => setFormOpen(true)}
        >
          <FiPlus aria-hidden />
          Yeni Kayıt
        </button>
      </header>

      {listError ? (
        <div className="yaglama-page__error" role="alert">
          {listError}
        </div>
      ) : null}

      <div className="data-table">
        <div className="data-table__toolbar">
          <div className="data-table__filters">
            <label className="data-table__search">
              <FiSearch aria-hidden />
              <input
                type="search"
                placeholder="Marka veya ürün ara..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setBrandPage(1)
                }}
              />
            </label>

            <div className="data-table__date-range">
              <label className="data-table__date-filter">
                <span>Başlangıç</span>
                <input
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  aria-label="Başlangıç tarihi"
                />
              </label>
              <label className="data-table__date-filter">
                <span>Bitiş</span>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  aria-label="Bitiş tarihi"
                />
              </label>
              {dateFilterActive ? (
                <button
                  type="button"
                  className="data-table__date-clear"
                  onClick={clearDateFilter}
                  aria-label="Tarih filtresini temizle"
                  title="Filtreyi temizle"
                >
                  <FiX aria-hidden />
                </button>
              ) : null}
            </div>
          </div>
          <span className="data-table__count">
            {brandGroups.length} marka
          </span>
        </div>

        {dateFilterActive && rangeLabel ? (
          <div className="data-table__range-summary">
            <p>
              <strong>{rangeLabel}</strong> tarih aralığındaki hareketler
              gösteriliyor.
            </p>
          </div>
        ) : null}

        <div className="data-table__scroll">
          <table className="cari-brand-table">
            <thead>
              <tr>
                <th aria-label="Aç/Kapa" className="cari-col-toggle" />
                <th>Marka</th>
                <th className="cari-col-num">Ürün</th>
                <th aria-label="İşlemler" className="cari-col-actions" />
              </tr>
            </thead>
            <tbody>
              {pagedBrands.length === 0 ? (
                <tr>
                  <td colSpan={4} className="data-table__empty">
                    {dateFilterActive
                      ? 'Seçilen tarih aralığında cari kaydı bulunamadı.'
                      : 'Henüz cari kaydı yok.'}
                  </td>
                </tr>
              ) : (
                pagedBrands.map((brandGroup) => {
                  const brandOpen = expandedBrand === brandGroup.brand

                  return (
                    <Fragment key={brandGroup.brand}>
                      <tr
                        className={`cari-brand-row${brandOpen ? ' is-open' : ''}`}
                        onClick={() => toggleBrand(brandGroup.brand)}
                      >
                        <td className="cari-col-toggle">
                          <span className="cari-toggle">
                            {brandOpen ? (
                              <FiChevronDown aria-hidden />
                            ) : (
                              <FiChevronRight aria-hidden />
                            )}
                          </span>
                        </td>
                        <td className="cari-brand-row__name">
                          {brandGroup.brand}
                        </td>
                        <td className="cari-col-num">
                          {brandGroup.products.length}
                        </td>
                        <td className="cari-col-actions">
                          <div className="data-table__actions">
                            <button
                              type="button"
                              className="btn btn--danger"
                              aria-label="Markayı sil"
                              title="Markayı sil"
                              onClick={(e) => {
                                e.stopPropagation()
                                void handleDeleteBrand(brandGroup)
                              }}
                            >
                              <FiTrash2 aria-hidden />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {brandOpen ? (
                        <tr className="cari-nest-row">
                          <td colSpan={4}>
                            <div className="cari-nest">
                              <div className="cari-nest__panel cari-nest__panel--product">
                                <div className="cari-nest__label">Ürünler</div>
                                <div className="cari-nest__scroll">
                                  <table className="cari-product-table">
                                    <thead>
                                      <tr>
                                        <th
                                          aria-label="Aç/Kapa"
                                          className="cari-col-toggle"
                                        />
                                        <th>Ürün</th>
                                        <th className="cari-col-num">
                                          Hareket
                                        </th>
                                        <th
                                          aria-label="İşlemler"
                                          className="cari-col-actions"
                                        />
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {brandGroup.products.map((group) => {
                                        const productOpen =
                                          expandedProductId === group.cariItemId

                                        return (
                                          <Fragment key={group.cariItemId}>
                                            <tr
                                              className={`cari-product-row${productOpen ? ' is-open' : ''}`}
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                toggleProduct(group.cariItemId)
                                              }}
                                            >
                                              <td className="cari-col-toggle">
                                                <span className="cari-toggle cari-toggle--sm">
                                                  {productOpen ? (
                                                    <FiChevronDown aria-hidden />
                                                  ) : (
                                                    <FiChevronRight aria-hidden />
                                                  )}
                                                </span>
                                              </td>
                                              <td className="cari-product-row__name">
                                                {group.name?.trim()
                                                  ? group.name
                                                  : '—'}
                                              </td>
                                              <td className="cari-col-num">
                                                {group.entries.length}
                                              </td>
                                              <td className="cari-col-actions">
                                                <div className="data-table__actions">
                                                  <button
                                                    type="button"
                                                    className="btn btn--danger"
                                                    aria-label="Ürünü sil"
                                                    title="Ürünü sil"
                                                    onClick={(e) => {
                                                      e.stopPropagation()
                                                      void handleDeleteProduct(
                                                        group,
                                                      )
                                                    }}
                                                  >
                                                    <FiTrash2 aria-hidden />
                                                  </button>
                                                </div>
                                              </td>
                                            </tr>

                                            {productOpen ? (
                                              <tr className="cari-nest-row">
                                                <td colSpan={4}>
                                                  <div className="cari-nest cari-nest--inner">
                                                    <div className="cari-nest__panel cari-nest__panel--entry">
                                                      <div className="cari-nest__bar">
                                                        <span className="cari-nest__label">
                                                          Hareketler
                                                        </span>
                                                        <button
                                                          type="button"
                                                          className="btn btn--primary"
                                                          onClick={(e) => {
                                                            e.stopPropagation()
                                                            setAddingProduct(
                                                              group,
                                                            )
                                                          }}
                                                        >
                                                          <FiPlus aria-hidden />{' '}
                                                          Ekle
                                                        </button>
                                                      </div>

                                                      {group.entries.length >
                                                      0 ? (
                                                        <div className="cari-nest__scroll">
                                                          <table className="cari-entry-table">
                                                            <thead>
                                                              <tr>
                                                                <th>Tarih</th>
                                                                <th>Miktar</th>
                                                                <th>Gelen</th>
                                                                <th>Ödenen</th>
                                                                <th>Bakiye</th>
                                                                <th aria-label="İşlemler" />
                                                              </tr>
                                                            </thead>
                                                            <tbody>
                                                              {group.entries.map(
                                                                (entry) => (
                                                                  <tr
                                                                    key={
                                                                      entry.id
                                                                    }
                                                                  >
                                                                    <td className="data-table__cell--date">
                                                                      {formatDateTime(
                                                                        entry.createdAt,
                                                                      )}
                                                                    </td>
                                                                    <td className="data-table__cell--qty">
                                                                      {formatQuantity(
                                                                        entry.quantity,
                                                                        entry.quantityUnit,
                                                                      )}
                                                                    </td>
                                                                    <td className="data-table__cell--incoming">
                                                                      {formatAmount(
                                                                        entry.incomingAmount,
                                                                      )}
                                                                    </td>
                                                                    <td className="data-table__cell--paid">
                                                                      {formatAmount(
                                                                        entry.paidAmount,
                                                                      )}
                                                                    </td>
                                                                    <td
                                                                      className={`data-table__cell--balance ${balanceClassName(entry.balance)}`}
                                                                    >
                                                                      {formatAmount(
                                                                        entry.balance,
                                                                      )}
                                                                    </td>
                                                                    <td>
                                                                      <div className="data-table__actions">
                                                                        <button
                                                                          type="button"
                                                                          className="btn btn--edit"
                                                                          aria-label="Düzenle"
                                                                          title="Düzenle"
                                                                          onClick={(
                                                                            ev,
                                                                          ) => {
                                                                            ev.stopPropagation()
                                                                            setEditingEntry(
                                                                              entry,
                                                                            )
                                                                          }}
                                                                        >
                                                                          <FiEdit2 aria-hidden />
                                                                        </button>
                                                                        <button
                                                                          type="button"
                                                                          className="btn btn--danger"
                                                                          aria-label="Sil"
                                                                          title="Sil"
                                                                          onClick={(
                                                                            ev,
                                                                          ) => {
                                                                            ev.stopPropagation()
                                                                            void handleDeleteEntry(
                                                                              entry,
                                                                            )
                                                                          }}
                                                                        >
                                                                          <FiTrash2 aria-hidden />
                                                                        </button>
                                                                      </div>
                                                                    </td>
                                                                  </tr>
                                                                ),
                                                              )}
                                                            </tbody>
                                                          </table>
                                                        </div>
                                                      ) : (
                                                        <div className="cari-nest__empty">
                                                          Hareket yok.
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                </td>
                                              </tr>
                                            ) : null}
                                          </Fragment>
                                        )
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {brandGroups.length > BRAND_PAGE_SIZE ? (
          <div className="data-table__pagination">
            <button
              type="button"
              className="btn btn--ghost"
              disabled={brandPage <= 1}
              onClick={() => setBrandPage((p) => Math.max(1, p - 1))}
            >
              Önceki
            </button>
            <span>
              Sayfa {brandPage} / {totalBrandPages}
            </span>
            <button
              type="button"
              className="btn btn--ghost"
              disabled={brandPage >= totalBrandPages}
              onClick={() =>
                setBrandPage((p) => Math.min(totalBrandPages, p + 1))
              }
            >
              Sonraki
            </button>
          </div>
        ) : null}
      </div>

      <CariCreateForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onCreate={handleCreateProduct}
        isSubmitting={isCreatingProduct}
      />

      <CariEntryAddForm
        open={addingProduct != null}
        product={addingProduct}
        onClose={() => setAddingProduct(null)}
        onCreate={handleAddEntry}
        isSubmitting={isCreatingEntry}
      />

      <CariEntryEditForm
        open={editingEntry != null}
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
        onUpdate={handleUpdateEntry}
        isSubmitting={isUpdating}
      />
    </div>
  )
}
