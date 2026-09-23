import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { FiEdit2, FiPlus, FiX } from 'react-icons/fi'
import { useGetProductListQuery } from '../api/productApi'
import type {
  Cari,
  CariCreateRequest,
  CariUpdateRequest,
} from '../types/cari'
import {
  SearchableSelect,
  type SearchableSelectOption,
} from './SearchableSelect'
import './OilChangeCreateForm.css'

type FormMode = 'create' | 'edit'

interface CariFormProps {
  open: boolean
  mode: FormMode
  initialData?: Cari | null
  onClose: () => void
  onCreate: (payload: CariCreateRequest) => Promise<void>
  onUpdate: (payload: CariUpdateRequest) => Promise<void>
  isSubmitting: boolean
}

const emptyForm = {
  productId: '',
  incomingAmount: '',
  paidAmount: '',
}

function toFormState(data?: Cari | null) {
  if (!data) return emptyForm
  return {
    productId: data.productId ?? '',
    incomingAmount: String(data.incomingAmount ?? ''),
    paidAmount: String(data.paidAmount ?? ''),
  }
}

function parseAmount(raw: string): number | 'invalid' {
  const trimmed = raw.trim()
  if (trimmed === '') return 'invalid'
  const normalized = trimmed.replace(',', '.')
  const value = Number(normalized)
  if (!Number.isFinite(value) || value < 0) return 'invalid'
  return value
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

export function CariCreateForm({
  open,
  mode,
  initialData = null,
  onClose,
  onCreate,
  onUpdate,
  isSubmitting,
}: CariFormProps) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)

  const { data: productsData } = useGetProductListQuery(
    { page: 1, pageSize: 1000 },
    { skip: !open },
  )

  const productOptions = useMemo<SearchableSelectOption[]>(() => {
    const items = productsData?.items ?? []
    const options = items.map((p) => ({
      value: p.id,
      label: `${p.brand} — ${p.name}`,
      searchText: `${p.brand} ${p.name}`,
    }))

    if (
      initialData &&
      !options.some((o) => o.value === initialData.productId)
    ) {
      options.unshift({
        value: initialData.productId,
        label: `${initialData.productBrand} — ${initialData.productName}`,
        searchText: `${initialData.productBrand} ${initialData.productName}`,
      })
    }

    return options
  }, [initialData, productsData?.items])

  useEffect(() => {
    if (!open) return
    setForm(toFormState(mode === 'edit' ? initialData : null))
    setError(null)
  }, [open, mode, initialData])

  const balancePreview = (() => {
    const incoming = parseAmount(form.incomingAmount)
    const paid = parseAmount(form.paidAmount)
    if (incoming === 'invalid' || paid === 'invalid') return null
    return incoming - paid
  })()

  if (!open) return null

  const update = (key: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleClose = () => {
    if (isSubmitting) return
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.productId) {
      setError('Ürün seçimi zorunludur.')
      return
    }

    const incomingAmount = parseAmount(form.incomingAmount)
    const paidAmount = parseAmount(form.paidAmount)

    if (incomingAmount === 'invalid') {
      setError('Gelen miktar geçerli bir değer olmalıdır.')
      return
    }
    if (paidAmount === 'invalid') {
      setError('Ödenen miktar geçerli bir değer olmalıdır.')
      return
    }

    try {
      if (mode === 'create') {
        await onCreate({
          productId: form.productId,
          incomingAmount,
          paidAmount,
        })
      } else if (initialData) {
        await onUpdate({
          id: initialData.id,
          productId: form.productId,
          incomingAmount,
          paidAmount,
        })
      }
      onClose()
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          mode === 'create'
            ? 'Cari kaydı oluşturulamadı.'
            : 'Cari kaydı güncellenemedi.',
        ),
      )
    }
  }

  return (
    <div className="create-modal" role="dialog" aria-modal="true">
      <button
        type="button"
        className="create-modal__backdrop"
        aria-label="Kapat"
        onClick={handleClose}
      />
      <div className="create-modal__panel">
        <header className="create-modal__header">
          <h2>
            {mode === 'create' ? (
              <>
                <FiPlus aria-hidden /> Yeni Cari Kaydı
              </>
            ) : (
              <>
                <FiEdit2 aria-hidden /> Cari Düzenle
              </>
            )}
          </h2>
          <button
            type="button"
            className="create-modal__close"
            onClick={handleClose}
            aria-label="Kapat"
            disabled={isSubmitting}
          >
            <FiX aria-hidden />
          </button>
        </header>

        <form className="create-modal__form" onSubmit={(e) => void handleSubmit(e)}>
          {error ? (
            <div className="create-modal__error" role="alert">
              {error}
            </div>
          ) : null}

          <div className="create-modal__grid">
            <label className="create-modal__full">
              Ürün
              <SearchableSelect
                options={productOptions}
                value={form.productId}
                onChange={(value) => update('productId', value)}
                placeholder="Ürün seçin..."
                disabled={isSubmitting}
                emptyMessage="Ürün bulunamadı."
              />
            </label>
            <label>
              Gelen Miktar
              <input
                type="text"
                inputMode="decimal"
                value={form.incomingAmount}
                onChange={(e) => update('incomingAmount', e.target.value)}
                required
              />
            </label>
            <label>
              Ödenen Miktar
              <input
                type="text"
                inputMode="decimal"
                value={form.paidAmount}
                onChange={(e) => update('paidAmount', e.target.value)}
                required
              />
            </label>
            <label className="create-modal__full">
              Bakiye
              <input
                type="text"
                value={
                  balancePreview == null ? '—' : formatAmount(balancePreview)
                }
                readOnly
                tabIndex={-1}
              />
            </label>
          </div>

          <div className="create-modal__actions">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Kaydediliyor...'
                : mode === 'create'
                  ? 'Kaydet'
                  : 'Güncelle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
