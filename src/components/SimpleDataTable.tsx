import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  FiChevronDown,
  FiChevronUp,
  FiEdit2,
  FiSearch,
  FiTrash2,
} from 'react-icons/fi'
import './DataTable.css'

type SortDir = 'asc' | 'desc'

export interface SimpleColumn<T> {
  key: string
  label: string
  cellClass?: string
  sortable?: boolean
  getSortValue?: (row: T) => string | number | null | undefined
  searchValue?: (row: T) => string
  render: (row: T) => ReactNode
}

interface SimpleDataTableProps<T extends { id: string }> {
  data: T[]
  totalCount: number
  page: number
  pageSize: number
  columns: SimpleColumn<T>[]
  onPageChange: (page: number) => void
  onEdit: (row: T) => void
  onDelete: (row: T) => void
  searchPlaceholder?: string
}

export function SimpleDataTable<T extends { id: string }>({
  data,
  totalCount,
  page,
  pageSize,
  columns,
  onPageChange,
  onEdit,
  onDelete,
  searchPlaceholder = 'Ara...',
}: SimpleDataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(
    columns.find((c) => c.sortable !== false)?.key ?? null,
  )
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('tr')
    if (!q) return data

    return data.filter((row) =>
      columns.some((col) => {
        const value = col.searchValue
          ? col.searchValue(row)
          : String(col.render(row) ?? '')
        return value.toLocaleLowerCase('tr').includes(q)
      }),
    )
  }, [columns, data, search])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    const col = columns.find((c) => c.key === sortKey)
    if (!col) return filtered

    const list = [...filtered]
    list.sort((a, b) => {
      const av = col.getSortValue?.(a)
      const bv = col.getSortValue?.(b)

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
  }, [columns, filtered, sortDir, sortKey])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const handleSort = (key: string) => {
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
        <div className="data-table__filters">
          <label className="data-table__search">
            <FiSearch aria-hidden />
            <input
              type="search"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Tablo içinde ara"
            />
          </label>
        </div>
        <span className="data-table__count">{totalCount} kayıt</span>
      </div>

      <div className="data-table__scroll">
        <table>
          <thead>
            <tr>
              {columns.map((col) => {
                const sortable = col.sortable !== false
                const active = sortKey === col.key
                return (
                  <th key={col.key} className={col.cellClass}>
                    {sortable ? (
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
                    ) : (
                      col.label
                    )}
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
                      {col.render(row)}
                    </td>
                  ))}
                  <td>
                    <div className="data-table__actions">
                      <button
                        type="button"
                        className="btn btn--edit"
                        onClick={() => onEdit(row)}
                        aria-label="Düzenle"
                        title="Düzenle"
                      >
                        <FiEdit2 aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="btn btn--danger"
                        onClick={() => onDelete(row)}
                        aria-label="Sil"
                        title="Sil"
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

      {totalPages > 1 ? (
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
            {page} / {totalPages}
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
    </div>
  )
}
