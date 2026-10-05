import { Fragment, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
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
  useDeleteCariMutation,
  useGetCariListQuery,
  useUpdateCariMutation,
} from '../api/cariApi'
import { useAppDispatch } from '../app/hooks'
import { CariCreateForm } from '../components/CariCreateForm'
import { CariEntryEditForm } from '../components/CariEntryEditForm'
import { setGlobalLoading } from '../features/ui/uiSlice'
import type {
  Cari,
  CariCreateRequest,
  CariCreateWithProductRequest,
  CariProductGroup,
  CariUpdateRequest,
  QuantityUnit,
} from '../types/cari'
import '../components/DataTable.css'
import './YaglamaServisiPage.css'
import './CariPage.css'

const PAGE_SIZE = 10

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

function parseAmount(raw: string): number | 'invalid' {
  const trimmed = raw.trim()
  if (trimmed === '') return 'invalid'
  const normalized = trimmed.replace(',', '.')
  const value = Number(normalized)
  if (!Number.isFinite(value) || value < 0) return 'invalid'
  return value
}

function parseQuantity(raw: string): number | 'invalid' {
  const trimmed = raw.trim()
  if (trimmed === '') return 'invalid'
  if (!/^\d+$/.test(trimmed)) return 'invalid'
  const value = Number(trimmed)
  if (!Number.isInteger(value) || value < 1) return 'invalid'
  return value
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

const emptyAddForm = {
  quantityUnit: 'Adet' as QuantityUnit,
  quantity: '',
  incomingAmount: '',
  paidAmount: '',
}

export function CariPage() {
  const dispatch = useAppDispatch()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Cari | null>(null)
  const [addForms, setAddForms] = useState<
    Record<
      string,
      {
        quantityUnit: QuantityUnit
        quantity: string
        incomingAmount: string
        paidAmount: string
      }
    >
  >({})
  const [addErrors, setAddErrors] = useState<Record<string, string | null>>({})

  const dateFilterActive = Boolean(startDate || endDate)

  const { data, isFetching, isError, error } = useGetCariListQuery({
    page,
    pageSize: PAGE_SIZE,
    startDate: startDate || null,
    endDate: endDate || null,
  })
  const [createWithProduct, { isLoading: isCreatingProduct }] =
    useCreateCariWithProductMutation()
  const [createCari, { isLoading: isCreatingEntry }] = useCreateCariMutation()
  const [updateCari, { isLoading: isUpdating }] = useUpdateCariMutation()
  const [deleteCari, { isLoading: isDeleting }] = useDeleteCariMutation()

  useEffect(() => {
    dispatch(
      setGlobalLoading(
        isFetching ||
          isCreatingProduct ||
          isCreatingEntry ||
          isUpdating ||
          isDeleting,
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
  ])

  const groups = data?.items ?? []

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('tr')
    if (!q) return groups
    return groups.filter((g) =>
      `${g.brand} ${g.name}`.toLocaleLowerCase('tr').includes(q),
    )
  }, [groups, search])

  const totalPages = Math.max(
    1,
    Math.ceil((data?.totalCount ?? 0) / (data?.pageSize ?? PAGE_SIZE)),
  )

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
    setPage(1)
    if (endDate && date && date > endDate) setEndDate(date)
  }

  const handleEndDateChange = (date: string) => {
    setEndDate(date)
    setPage(1)
    if (startDate && date && date < startDate) setStartDate(date)
  }

  const clearDateFilter = () => {
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  const toggleExpand = (productId: string) => {
    setExpandedId((prev) => (prev === productId ? null : productId))
    setAddForms((prev) =>
      prev[productId] ? prev : { ...prev, [productId]: emptyAddForm },
    )
    setAddErrors((prev) => ({ ...prev, [productId]: null }))
  }

  const updateAddForm = <
    K extends 'quantityUnit' | 'quantity' | 'incomingAmount' | 'paidAmount',
  >(
    productId: string,
    key: K,
    value: (typeof emptyAddForm)[K],
  ) => {
    setAddForms((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] ?? emptyAddForm),
        [key]: value,
      },
    }))
  }

  const handleCreateProduct = async (payload: CariCreateWithProductRequest) => {
    await createWithProduct(payload).unwrap()
    setPage(1)
  }

  const handleAddEntry = async (group: CariProductGroup, e: FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const form = addForms[group.productId] ?? emptyAddForm
    setAddErrors((prev) => ({ ...prev, [group.productId]: null }))

    const quantity = parseQuantity(form.quantity)
    const incomingAmount = parseAmount(form.incomingAmount)
    const paidAmount = parseAmount(form.paidAmount)

    if (quantity === 'invalid') {
      setAddErrors((prev) => ({
        ...prev,
        [group.productId]: 'Miktar en az 1 olmalıdır.',
      }))
      return
    }
    if (incomingAmount === 'invalid') {
      setAddErrors((prev) => ({
        ...prev,
        [group.productId]: 'Gelen miktar geçerli bir değer olmalıdır.',
      }))
      return
    }
    if (paidAmount === 'invalid') {
      setAddErrors((prev) => ({
        ...prev,
        [group.productId]: 'Ödenen miktar geçerli bir değer olmalıdır.',
      }))
      return
    }

    try {
      const payload: CariCreateRequest = {
        productId: group.productId,
        quantity,
        quantityUnit: form.quantityUnit,
        incomingAmount,
        paidAmount,
      }
      await createCari(payload).unwrap()
      setAddForms((prev) => ({ ...prev, [group.productId]: emptyAddForm }))
    } catch (err) {
      setAddErrors((prev) => ({
        ...prev,
        [group.productId]: getErrorMessage(err, 'Hareket eklenemedi.'),
      }))
    }
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
      if ((data?.items.length ?? 0) <= 1 && page > 1) {
        setPage((p) => p - 1)
      }
    } catch (err) {
      alert(getErrorMessage(err, 'Cari kaydı silinemedi.'))
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
          <p>
            Ürün bazlı cari kayıtlarını görüntüleyin; aynı ürüne yeni hareket
            ekleyin.
          </p>
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
                onChange={(e) => setSearch(e.target.value)}
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
          <span className="data-table__count">{data?.totalCount ?? 0} ürün</span>
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
          <table>
            <thead>
              <tr>
                <th aria-label="Aç/Kapa" />
                <th>Marka</th>
                <th>Ürün Adı</th>
                <th>Koli / Adet</th>
                <th>Gelen</th>
                <th>Ödenen</th>
                <th>Bakiye</th>
                <th>Hareket</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={8} className="data-table__empty">
                    {dateFilterActive
                      ? 'Seçilen tarih aralığında cari kaydı bulunamadı.'
                      : 'Henüz cari kaydı yok. Yeni kayıt ekleyerek başlayın.'}
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group) => {
                  const open = expandedId === group.productId
                  const addForm = addForms[group.productId] ?? emptyAddForm
                  const incomingPreview = parseAmount(addForm.incomingAmount)
                  const paidPreview = parseAmount(addForm.paidAmount)
                  const balancePreview =
                    incomingPreview === 'invalid' || paidPreview === 'invalid'
                      ? null
                      : incomingPreview - paidPreview
                  const balanceClass =
                    group.balance > 0
                      ? 'is-debt'
                      : group.balance < 0
                        ? 'is-credit'
                        : 'is-zero'

                  return (
                    <Fragment key={group.productId}>
                      <tr
                        className={open ? 'is-open' : undefined}
                        onClick={() => toggleExpand(group.productId)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <span className="data-table__chevron">
                            {open ? (
                              <FiChevronDown aria-hidden />
                            ) : (
                              <FiChevronRight aria-hidden />
                            )}
                          </span>
                        </td>
                        <td className="data-table__cell--brand">{group.brand}</td>
                        <td className="data-table__cell--name">{group.name}</td>
                        <td className="data-table__cell--qty">
                          {group.quantityLabel || '—'}
                        </td>
                        <td className="data-table__cell--incoming">
                          {formatAmount(group.incomingAmount)}
                        </td>
                        <td className="data-table__cell--paid">
                          {formatAmount(group.paidAmount)}
                        </td>
                        <td
                          className={`data-table__cell--balance ${balanceClass}`}
                        >
                          {formatAmount(group.balance)}
                        </td>
                        <td className="data-table__cell--count">
                          {group.entries.length}
                        </td>
                      </tr>
                      {open ? (
                        <tr className="data-table__expand-row">
                          <td colSpan={8}>
                            <div className="cari-expand">
                              {group.entries.length > 0 ? (
                                <div className="cari-expand__table-wrap">
                                  <table>
                                    <thead>
                                      <tr>
                                        <th>Tarih</th>
                                        <th>Koli / Adet</th>
                                        <th>Gelen</th>
                                        <th>Ödenen</th>
                                        <th>Bakiye</th>
                                        <th aria-label="İşlemler" />
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {group.entries.map((entry) => (
                                        <tr key={entry.id}>
                                          <td className="data-table__cell--date">
                                            {formatDateTime(entry.createdAt)}
                                          </td>
                                          <td className="data-table__cell--qty">
                                            {formatQuantity(
                                              entry.quantity,
                                              entry.quantityUnit,
                                            )}
                                          </td>
                                          <td className="data-table__cell--incoming">
                                            {formatAmount(entry.incomingAmount)}
                                          </td>
                                          <td className="data-table__cell--paid">
                                            {formatAmount(entry.paidAmount)}
                                          </td>
                                          <td
                                            className={`data-table__cell--balance ${
                                              entry.balance > 0
                                                ? 'is-debt'
                                                : entry.balance < 0
                                                  ? 'is-credit'
                                                  : 'is-zero'
                                            }`}
                                          >
                                            {formatAmount(entry.balance)}
                                          </td>
                                          <td>
                                            <div className="data-table__actions">
                                              <button
                                                type="button"
                                                className="btn btn--edit"
                                                aria-label="Düzenle"
                                                title="Düzenle"
                                                onClick={(ev) => {
                                                  ev.stopPropagation()
                                                  setEditingEntry(entry)
                                                }}
                                              >
                                                <FiEdit2 aria-hidden />
                                              </button>
                                              <button
                                                type="button"
                                                className="btn btn--danger"
                                                aria-label="Sil"
                                                title="Sil"
                                                onClick={(ev) => {
                                                  ev.stopPropagation()
                                                  void handleDeleteEntry(entry)
                                                }}
                                              >
                                                <FiTrash2 aria-hidden />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="data-table__empty">
                                  Bu ürüne ait hareket yok.
                                </div>
                              )}

                              <form
                                className="cari-expand__add"
                                onClick={(e) => e.stopPropagation()}
                                onSubmit={(e) => void handleAddEntry(group, e)}
                              >
                                {addErrors[group.productId] ? (
                                  <div
                                    className="cari-expand__add-error"
                                    role="alert"
                                  >
                                    {addErrors[group.productId]}
                                  </div>
                                ) : null}
                                <label>
                                  Birim
                                  <select
                                    value={addForm.quantityUnit}
                                    onChange={(e) =>
                                      updateAddForm(
                                        group.productId,
                                        'quantityUnit',
                                        e.target.value as QuantityUnit,
                                      )
                                    }
                                  >
                                    <option value="Adet">Adet</option>
                                    <option value="Koli">Koli</option>
                                  </select>
                                </label>
                                <label>
                                  Miktar
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    value={addForm.quantity}
                                    onChange={(e) =>
                                      updateAddForm(
                                        group.productId,
                                        'quantity',
                                        e.target.value,
                                      )
                                    }
                                    required
                                  />
                                </label>
                                <label>
                                  Gelen
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    value={addForm.incomingAmount}
                                    onChange={(e) =>
                                      updateAddForm(
                                        group.productId,
                                        'incomingAmount',
                                        e.target.value,
                                      )
                                    }
                                    required
                                  />
                                </label>
                                <label>
                                  Ödenen
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    value={addForm.paidAmount}
                                    onChange={(e) =>
                                      updateAddForm(
                                        group.productId,
                                        'paidAmount',
                                        e.target.value,
                                      )
                                    }
                                    required
                                  />
                                </label>
                                <label>
                                  Bakiye
                                  <input
                                    type="text"
                                    value={
                                      balancePreview == null
                                        ? '—'
                                        : formatAmount(balancePreview)
                                    }
                                    readOnly
                                    tabIndex={-1}
                                  />
                                </label>
                                <button
                                  type="submit"
                                  className="btn btn--primary"
                                  disabled={isCreatingEntry}
                                >
                                  <FiPlus aria-hidden /> Ekle
                                </button>
                              </form>
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

        {(data?.totalCount ?? 0) > PAGE_SIZE ? (
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
              Sayfa {page} / {totalPages}
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
      </div>

      <CariCreateForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onCreate={handleCreateProduct}
        isSubmitting={isCreatingProduct}
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
