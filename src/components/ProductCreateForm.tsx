import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { FiEdit2, FiPlus, FiX } from 'react-icons/fi'
import type {
  Product,
  ProductCreateRequest,
  ProductUpdateRequest,
} from '../types/product'
import './OilChangeCreateForm.css'

type FormMode = 'create' | 'edit'

interface ProductFormProps {
  open: boolean
  mode: FormMode
  initialData?: Product | null
  onClose: () => void
  onCreate: (payload: ProductCreateRequest) => Promise<void>
  onUpdate: (payload: ProductUpdateRequest) => Promise<void>
  isSubmitting: boolean
}

const emptyForm = {
  brand: '',
  name: '',
}

function toFormState(data?: Product | null) {
  if (!data) return emptyForm
  return {
    brand: data.brand ?? '',
    name: data.name ?? '',
  }
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

export function ProductCreateForm({
  open,
  mode,
  initialData = null,
  onClose,
  onCreate,
  onUpdate,
  isSubmitting,
}: ProductFormProps) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setForm(toFormState(mode === 'edit' ? initialData : null))
    setError(null)
  }, [open, mode, initialData])

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

    const brand = form.brand.trim()
    const name = form.name.trim()

    if (!brand) {
      setError('Marka zorunludur.')
      return
    }
    if (!name) {
      setError('Ürün adı zorunludur.')
      return
    }

    try {
      if (mode === 'create') {
        await onCreate({ brand, name })
      } else if (initialData) {
        await onUpdate({ id: initialData.id, brand, name })
      }
      onClose()
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          mode === 'create' ? 'Ürün oluşturulamadı.' : 'Ürün güncellenemedi.',
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
                <FiPlus aria-hidden /> Yeni Ürün
              </>
            ) : (
              <>
                <FiEdit2 aria-hidden /> Ürün Düzenle
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
            <label>
              Marka
              <input
                value={form.brand}
                onChange={(e) => update('brand', e.target.value)}
                autoFocus
                required
              />
            </label>
            <label>
              Ürün Adı
              <input
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                required
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
