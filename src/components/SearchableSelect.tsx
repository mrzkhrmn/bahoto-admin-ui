import { useEffect, useMemo, useRef, useState } from 'react'
import { FiChevronDown, FiSearch, FiX } from 'react-icons/fi'
import './SearchableSelect.css'

export interface SearchableSelectOption {
  value: string
  label: string
  searchText?: string
}

interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  emptyMessage?: string
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Seçiniz...',
  disabled = false,
  emptyMessage = 'Sonuç bulunamadı.',
}: SearchableSelectProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selected = options.find((o) => o.value === value) ?? null

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr')
    if (!q) return options
    return options.filter((o) => {
      const haystack = (o.searchText ?? o.label).toLocaleLowerCase('tr')
      return haystack.includes(q)
    })
  }, [options, query])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const handleSelect = (next: string) => {
    onChange(next)
    setOpen(false)
    setQuery('')
  }

  const handleClear = () => {
    onChange('')
    setQuery('')
  }

  return (
    <div
      className={`searchable-select${open ? ' is-open' : ''}${disabled ? ' is-disabled' : ''}`}
      ref={rootRef}
    >
      <button
        type="button"
        className="searchable-select__trigger"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (disabled) return
          setOpen((prev) => !prev)
          setQuery('')
        }}
      >
        <span className={selected ? '' : 'searchable-select__placeholder'}>
          {selected?.label ?? placeholder}
        </span>
        <span className="searchable-select__icons">
          {selected && !disabled ? (
            <span
              role="button"
              tabIndex={0}
              className="searchable-select__clear"
              aria-label="Seçimi temizle"
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.stopPropagation()
                  handleClear()
                }
              }}
            >
              <FiX aria-hidden />
            </span>
          ) : null}
          <FiChevronDown aria-hidden />
        </span>
      </button>

      {open ? (
        <div className="searchable-select__dropdown" role="listbox">
          <label className="searchable-select__search">
            <FiSearch aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ürün ara..."
              autoFocus
              aria-label="Ürün ara"
            />
          </label>
          <ul className="searchable-select__options">
            {filtered.length === 0 ? (
              <li className="searchable-select__empty">{emptyMessage}</li>
            ) : (
              filtered.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={option.value === value}
                    className={`searchable-select__option${option.value === value ? ' is-selected' : ''}`}
                    onClick={() => handleSelect(option.value)}
                  >
                    {option.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
