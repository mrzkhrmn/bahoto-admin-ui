import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { FiPlus, FiX } from 'react-icons/fi'
import type {
  CariCreateWithProductRequest,
  QuantityUnit,
} from '../types/cari'
import './OilChangeCreateForm.css'

interface CariFormProps {
  open: boolean
  onClose: () => void
  onCreate: (payload: CariCreateWithProductRequest) => Promise<void>
  isSubmitting: boolean
}

const emptyForm = {
  brand: '',
  name: '',
  quantityUnit: 'Adet' as QuantityUnit,
  quantity: '',
  incomingAmount: '',
  paidAmount: '',
}

function parseAmount(raw: string): number | 'invalid' | 'empty' {
  const trimmed = raw.trim()
  if (trimmed === '') return 'empty'
  const normalized = trimmed.replace(',', '.')
  const value = Number(normalized)
  if (!Number.isFinite(value) || value < 0) return 'invalid'
  return value
}

function parseQuantity(raw: string): number | 'invalid' | 'empty' {
  const trimmed = raw.trim()
  if (trimmed === '') return 'empty'
  if (!/^\d+$/.test(trimmed)) return 'invalid'
  const value = Number(trimmed)
  if (!Number.isInteger(value) || value < 1) return 'invalid'
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
  onClose,
  onCreate,
  isSubmitting,
}: CariFormProps) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setForm(emptyForm)
    setError(null)
  }, [open])

  const balancePreview = (() => {
    const incoming = parseAmount(form.incomingAmount)
    const paid = parseAmount(form.paidAmount)
    if (
      incoming === 'invalid' ||
      paid === 'invalid' ||
      incoming === 'empty' ||
      paid === 'empty'
    ) {
      return null
    }
    return incoming - paid
  })()

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

    const quantity = parseQuantity(form.quantity)
    const incomingAmount = parseAmount(form.incomingAmount)
    const paidAmount = parseAmount(form.paidAmount)

    const hasAnyCariField =
      quantity !== 'empty' ||
      incomingAmount !== 'empty' ||
      paidAmount !== 'empty'

    if (hasAnyCariField) {
      if (quantity === 'invalid' || quantity === 'empty') {
        setError('Miktar en az 1 olmalıdır.')
        return
      }
      if (incomingAmount === 'invalid' || incomingAmount === 'empty') {
        setError('Gelen fiyat geçerli bir değer olmalıdır.')
        return
      }
      if (paidAmount === 'invalid' || paidAmount === 'empty') {
        setError('Ödenen fiyat geçerli bir değer olmalıdır.')
        return
      }
    }

    const payload: CariCreateWithProductRequest = {
      brand: form.brand.trim(),
      name: form.name.trim() || undefined,
      quantityUnit: form.quantityUnit,
    }

    if (hasAnyCariField) {
      payload.quantity = quantity as number
      payload.incomingAmount = incomingAmount as number
      payload.paidAmount = paidAmount as number
    }

    try {
      await onCreate(payload)
      onClose()
    } catch (err) {
      setError(getErrorMessage(err, 'Cari kaydı oluşturulamadı.'))
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
            <FiPlus aria-hidden /> Yeni Cari Kaydı
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

          <p className="create-modal__hint">
            Yalnızca marka zorunludur. Diğer alanları sonra doldurabilirsiniz.
          </p>

          <div className="create-modal__grid">
            <label>
              Marka
              <input
                type="text"
                value={form.brand}
                onChange={(e) => update('brand', e.target.value)}
                required
                disabled={isSubmitting}
              />
            </label>
            <label>
              Ürün Adı
              <input
                type="text"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                disabled={isSubmitting}
                placeholder="İsteğe bağlı"
              />
            </label>
            <label>
              Birim
              <select
                value={form.quantityUnit}
                onChange={(e) =>
                  update('quantityUnit', e.target.value as QuantityUnit)
                }
                disabled={isSubmitting}
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
                value={form.quantity}
                onChange={(e) => update('quantity', e.target.value)}
                disabled={isSubmitting}
                placeholder={
                  form.quantityUnit === 'Koli' ? 'Örn. 10' : 'Örn. 20'
                }
              />
            </label>
            <label>
              Gelen Fiyat
              <input
                type="text"
                inputMode="decimal"
                value={form.incomingAmount}
                onChange={(e) => update('incomingAmount', e.target.value)}
                disabled={isSubmitting}
                placeholder="İsteğe bağlı"
              />
            </label>
            <label>
              Ödenen Fiyat
              <input
                type="text"
                inputMode="decimal"
                value={form.paidAmount}
                onChange={(e) => update('paidAmount', e.target.value)}
                disabled={isSubmitting}
                placeholder="İsteğe bağlı"
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
              {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
