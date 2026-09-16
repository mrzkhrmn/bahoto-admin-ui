import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  FiChevronDown,
  FiChevronUp,
  FiEdit2,
  FiSearch,
  FiTrash2,
} from 'react-icons/fi'
import type { OilChange } from '../types/yaglamaServisi'
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
  { key: 'oilFilter', label: 'Yağ Filtresi', cellClass: 'data-table__cell--filter' },
  { key: 'airFilter', label: 'Hava Filtresi', cellClass: 'data-table__cell--filter' },
  { key: 'fuelFilter', label: 'Yakıt Filtresi', cellClass: 'data-table__cell--filter' },
  { key: 'polenFilter', label: 'Polen Filtresi', cellClass: 'data-table__cell--filter' },
  { key: 'note', label: 'Not', cellClass: 'data-table__cell--note' },
  { key: 'employee', label: 'Yapan Usta', cellClass: 'data-table__cell--employee' },
  {
    key: 'price',
    label: 'Fiyat/Tl',
    cellClass: 'data-table__cell--price',
    render: (row) => formatPrice(row.price),
  },
]

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

export function DataTable({
  data,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onEdit,
  onDelete,
}: DataTableProps) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('tr')
    if (!q) return data

    return data.filter((row) =>
      columns.some((col) => {
        const text = (
          col.render
            ? String(col.render(row) ?? '')
            : formatCell(row[col.key])
        ).toLocaleLowerCase('tr')
        return text.includes(q)
      }),
    )
  }, [data, search])

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

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div className="data-table">
      <div className="data-table__toolbar">
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
        <span className="data-table__count">{totalCount} kayıt</span>
      </div>

      <div className="data-table__scroll">
        <table>
          <thead>
            <tr>
              {columns.map((col) => {
                const active = sortKey === col.key
                return (
                  <th key={col.key}>
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
                        className="btn btn--ghost"
                        onClick={() => onEdit(row)}
                        title="Güncelle"
                      >
                        <FiEdit2 aria-hidden />
                        Güncelle
                      </button>
                      <button
                        type="button"
                        className="btn btn--danger"
                        onClick={() => onDelete(row)}
                        title="Sil"
                      >
                        <FiTrash2 aria-hidden />
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
    </div>
  )
}
