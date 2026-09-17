import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  FiChevronDown,
  FiChevronUp,
  FiEdit2,
  FiEye,
  FiSearch,
  FiTrash2,
  FiX,
} from 'react-icons/fi'
import type { OilChange } from '../types/yaglamaServisi'
import { OilChangeDetailModal } from './OilChangeDetailModal'
import './DataTable.css'

type SortKey = keyof OilChange
type SortDir = 'asc' | 'desc'

interface Column {
  key: SortKey
  label: string
  cellClass?: string
  render?: (row: OilChange) => ReactNode
}

interface DataTableProps {
  data: OilChange[]
  totalCount: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onEdit: (row: OilChange) => void
  onDelete: (row: OilChange) => void
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onClearDateFilter: () => void
}

const columns: Column[] = [
  {
    key: 'createdAt',
    label: 'Tarih',
    cellClass: 'data-table__cell--date',
    render: (row) => formatDate(row.createdAt),
  },
  { key: 'vehicle', label: 'Araç', cellClass: 'data-table__cell--vehicle' },
  { key: 'plate', label: 'Plaka', cellClass: 'data-table__cell--plate' },
  { key: 'oilType', label: 'Yağ Cinsi', cellClass: 'data-table__cell--oil' },
  {
    key: 'kmChanged',
    label: 'Değişim Km',
    cellClass: 'data-table__cell--km',
    render: (row) => formatNumber(row.kmChanged),
  },
  {
    key: 'nextChangeKm',
    label: 'Gelecek Km',
    cellClass: 'data-table__cell--km-next',
    render: (row) =>
      row.nextChangeKm == null ? '—' : formatNumber(row.nextChangeKm),
  },
  { key: 'employee', label: 'Yapan Usta', cellClass: 'data-table__cell--employee' },
  {
    key: 'phone',
    label: 'Telefon',
    cellClass: 'data-table__cell--phone',
    render: (row) => row.phone?.trim() || '—',
  },
  {
    key: 'price',
    label: 'Fiyat/Tl',
    cellClass: 'data-table__cell--price',
    render: (row) => formatPrice(row.price),
  },
]

const searchFields: (keyof OilChange)[] = [
  'vehicle',
  'plate',
  'phone',
  'oilType',
  'oilFilter',
  'airFilter',
  'fuelFilter',
  'polenFilter',
  'note',
  'employee',
]

function toLocalDateKey(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDisplayDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString('tr-TR')
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('tr-TR')
}

function formatNumber(value: number): string {
  return value.toLocaleString('tr-TR')
}

function formatPrice(value: number | null): string {
  if (value == null) return '—'
  return value.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatCell(value: OilChange[SortKey]): string {
  if (value == null) return '—'
  if (typeof value === 'number') return formatNumber(value)
  return String(value)
}

function isInDateRange(
  createdAt: string,
  startDate: string,
  endDate: string,
): boolean {
  const key = toLocalDateKey(createdAt)
  if (!key) return false
  if (startDate && key < startDate) return false
  if (endDate && key > endDate) return false
  return true
}

export function DataTable({
  data,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onEdit,
  onDelete,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClearDateFilter,
}: DataTableProps) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [detailRow, setDetailRow] = useState<OilChange | null>(null)

  const dateFilterActive = Boolean(startDate || endDate)

  const dateFiltered = useMemo(() => {
    if (!dateFilterActive) return data
    return data.filter((row) =>
      isInDateRange(row.createdAt, startDate, endDate),
    )
  }, [data, dateFilterActive, startDate, endDate])

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('tr')
    if (!q) return dateFiltered

    return dateFiltered.filter((row) =>
      searchFields.some((key) =>
        formatCell(row[key]).toLocaleLowerCase('tr').includes(q),
      ),
    )
  }, [dateFiltered, search])

  const rangeStats = useMemo(() => {
    if (!dateFilterActive) return null
    const count = dateFiltered.length
    const totalPrice = dateFiltered.reduce(
      (sum, row) => sum + (row.price ?? 0),
      0,
    )
    return { count, totalPrice }
  }, [dateFilterActive, dateFiltered])

  const sorted = useMemo(() => {
    const list = [...filtered]
    list.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]

      let cmp = 0
      if (av == null && bv == null) cmp = 0
      else if (av == null) cmp = 1
      else if (bv == null) cmp = -1
      else if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv
      else {
        cmp = String(av).localeCompare(String(bv), 'tr', { sensitivity: 'base' })
      }

      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [filtered, sortKey, sortDir])

  const displayCount = dateFilterActive ? dateFiltered.length : totalCount
  const totalPages = dateFilterActive
    ? 1
    : Math.max(1, Math.ceil(totalCount / pageSize))

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const rangeLabel = (() => {
    if (startDate && endDate) {
      return `${formatDisplayDate(startDate)} – ${formatDisplayDate(endDate)}`
    }
    if (startDate) return `${formatDisplayDate(startDate)} ve sonrası`
    if (endDate) return `${formatDisplayDate(endDate)} ve öncesi`
    return ''
  })()

  return (
    <div className="data-table">
      <div className="data-table__toolbar">
        <div className="data-table__filters">
          <label className="data-table__search">
            <FiSearch aria-hidden />
            <input
              type="search"
              placeholder="Ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Tablo içinde ara"
            />
          </label>
          <div className="data-table__date-range">
            <label className="data-table__date-filter">
              <span>Başlangıç</span>
              <input
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => onStartDateChange(e.target.value)}
                aria-label="Başlangıç tarihi"
              />
            </label>
            <label className="data-table__date-filter">
              <span>Bitiş</span>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => onEndDateChange(e.target.value)}
                aria-label="Bitiş tarihi"
              />
            </label>
            {dateFilterActive ? (
              <button
                type="button"
                className="data-table__date-clear"
                onClick={onClearDateFilter}
                aria-label="Tarih filtresini temizle"
                title="Filtreyi temizle"
              >
                <FiX aria-hidden />
              </button>
            ) : null}
          </div>
        </div>
        <span className="data-table__count">{displayCount} kayıt</span>
      </div>

      <div className="data-table__scroll">
        <table>
          <thead>
            <tr>
              {columns.map((col) => {
                const active = sortKey === col.key
                return (
                  <th key={col.key} className={col.cellClass}>
                    <button
                      type="button"
                      className={`data-table__sort${active ? ' is-active' : ''}`}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                      {active ? (
                        sortDir === 'asc' ? (
                          <FiChevronUp aria-hidden />
                        ) : (
                          <FiChevronDown aria-hidden />
                        )
                      ) : null}
                    </button>
                  </th>
                )
              })}
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="data-table__empty">
                  Kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              sorted.map((row) => (
                <tr key={row.id}>
                  {columns.map((col) => (
                    <td key={col.key} className={col.cellClass}>
                      {col.render ? col.render(row) : formatCell(row[col.key])}
                    </td>
                  ))}
                  <td>
                    <div className="data-table__actions">
                      <button
                        type="button"
                        className="btn btn--detail"
                        onClick={() => setDetailRow(row)}
                        title="Detay"
                        aria-label="Detay"
                      >
                        <FiEye aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="btn btn--edit"
                        onClick={() => onEdit(row)}
                        title="Düzenle"
                        aria-label="Düzenle"
                      >
                        <FiEdit2 aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="btn btn--danger"
                        onClick={() => onDelete(row)}
                        title="Sil"
                        aria-label="Sil"
                      >
                        <FiTrash2 aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {rangeStats ? (
        <div className="data-table__range-summary" role="status">
          <p>
            <strong>{rangeLabel}</strong> tarih aralığında{' '}
            <strong>{rangeStats.count}</strong> araç gelmiş, toplam{' '}
            <strong>{formatPrice(rangeStats.totalPrice)} TL</strong> toplanmış.
          </p>
        </div>
      ) : null}

      {!dateFilterActive ? (
        <div className="data-table__pagination">
          <button
            type="button"
            className="btn btn--ghost"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
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
            onClick={() => onPageChange(page + 1)}
          >
            Sonraki
          </button>
        </div>
      ) : null}

      <OilChangeDetailModal
        row={detailRow}
        onClose={() => setDetailRow(null)}
      />
    </div>
  )
}
