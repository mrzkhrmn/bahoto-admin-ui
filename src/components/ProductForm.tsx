import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { FiPlus, FiX } from 'react-icons/fi'
import type { Product, ProductCreateRequest, ProductUpdateRequest } from '../types/product'
import './OilChangeCreateForm.css'

interface ProductFormProps {
  open: boolean
  mode: 'create' | 'edit'
  initialBrand?: string
  product?: Product | null
  onClose: () => void
  onCreate: (payload: ProductCreateRequest) => Promise<void>
  onUpdate: (payload: ProductUpdateRequest) => Promise<void>
  isSubmitting: boolean
}

const emptyForm = {
  brand: '',
  name: '',
  price: '',
}

function parsePrice(raw: string): number | null | 'invalid' {
  const trimmed = raw.trim()
  if (trimmed === '') return null
  const normalized = trimmed.replace(',', '.')
  const value = Number(normalized)
  if (!Number.isFinite(value) || value < 0) return 'invalid'
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

export function ProductForm({
  open,
  mode,
  initialBrand = '',
  product = null,
  onClose,
  onCreate,
  onUpdate,
  isSubmitting,
}: ProductFormProps) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const brandLocked = mode === 'create' && Boolean(initialBrand)

  useEffect(() => {
    if (!open) return
    setError(null)
    if (mode === 'edit' && product) {
      setForm({
        brand: product.brand,
        name: product.name,
        price: product.price != null ? String(product.price) : '',
      })
    } else {
      setForm({
        ...emptyForm,
        brand: initialBrand,
      })
    }
  }, [open, mode, product, initialBrand])

  if (!open) return null

  const update = <K extends keyof typeof emptyForm>(
    key: K,
    value: (typeof emptyForm)[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleClose = () => {
    if (isSubmitting) return
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.brand.trim()) {
      setError('Marka zorunludur.')
      return
    }
    if (!form.name.trim()) {
      setError('Ürün adı zorunludur.')
      return
    }

    const price = parsePrice(form.price)
    if (price === 'invalid') {
      setError('Fiyat geçerli bir değer olmalıdır.')
      return
    }

    try {
      if (mode === 'edit' && product) {
        await onUpdate({
          id: product.id,
          brand: form.brand.trim(),
          name: form.name.trim(),
          price,
        })
      } else {
        await onCreate({
          brand: form.brand.trim(),
          name: form.name.trim(),
          price,
        })
      }
      onClose()
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          mode === 'edit' ? 'Ürün güncellenemedi.' : 'Ürün oluşturulamadı.',
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
            <FiPlus aria-hidden />
            {mode === 'edit' ? 'Ürün Düzenle' : 'Yeni Ürün'}
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

        <form
          className="create-modal__form"
          onSubmit={(e) => void handleSubmit(e)}
        >
          {error ? (
            <div className="create-modal__error" role="alert">
              {error}
            </div>
          ) : null}

          <div className="create-modal__grid">
            <label>
              Marka
              <input
                type="text"
                value={form.brand}
                onChange={(e) => update('brand', e.target.value)}
                required
                disabled={isSubmitting || brandLocked}
              />
            </label>
            <label>
              Ürün Adı
              <input
                type="text"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                required
                disabled={isSubmitting}
              />
            </label>
            <label>
              Fiyat
              <input
                type="text"
                inputMode="decimal"
                placeholder="Örn. 1250,00"
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
                disabled={isSubmitting}
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
              {mode === 'edit' ? 'Kaydet' : 'Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
