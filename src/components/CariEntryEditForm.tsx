import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { FiEdit2, FiX } from 'react-icons/fi'
import type { Cari, CariUpdateRequest, QuantityUnit } from '../types/cari'
import './OilChangeCreateForm.css'

interface CariEntryEditFormProps {
  open: boolean
  entry: Cari | null
  onClose: () => void
  onUpdate: (payload: CariUpdateRequest) => Promise<void>
  isSubmitting: boolean
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

function toUnit(value: string | undefined): QuantityUnit {
  return value?.toLowerCase() === 'koli' ? 'Koli' : 'Adet'
}

export function CariEntryEditForm({
  open,
  entry,
  onClose,
  onUpdate,
  isSubmitting,
}: CariEntryEditFormProps) {
  const [quantityUnit, setQuantityUnit] = useState<QuantityUnit>('Adet')
  const [quantity, setQuantity] = useState('')
  const [incomingAmount, setIncomingAmount] = useState('')
  const [paidAmount, setPaidAmount] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !entry) return
    setQuantityUnit(toUnit(entry.quantityUnit))
    setQuantity(String(entry.quantity ?? ''))
    setIncomingAmount(String(entry.incomingAmount ?? ''))
    setPaidAmount(String(entry.paidAmount ?? ''))
    setError(null)
  }, [open, entry])

  const balancePreview = (() => {
    const incoming = parseAmount(incomingAmount)
    const paid = parseAmount(paidAmount)
    if (incoming === 'invalid' || paid === 'invalid') return null
    return incoming - paid
  })()

  if (!open || !entry) return null

  const handleClose = () => {
    if (isSubmitting) return
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const parsedQuantity = parseQuantity(quantity)
    const incoming = parseAmount(incomingAmount)
    const paid = parseAmount(paidAmount)

    if (parsedQuantity === 'invalid') {
      setError('Miktar en az 1 olmalıdır.')
      return
    }
    if (incoming === 'invalid') {
      setError('Gelen fiyat geçerli bir değer olmalıdır.')
      return
    }
    if (paid === 'invalid') {
      setError('Ödenen fiyat geçerli bir değer olmalıdır.')
      return
    }

    try {
      await onUpdate({
        id: entry.id,
        productId: entry.productId,
        quantity: parsedQuantity,
        quantityUnit,
        incomingAmount: incoming,
        paidAmount: paid,
      })
      onClose()
    } catch (err) {
      setError(getErrorMessage(err, 'Cari kaydı güncellenemedi.'))
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
            <FiEdit2 aria-hidden /> Hareket Düzenle
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
            {entry.productBrand} — {entry.productName}
          </p>

          <div className="create-modal__grid">
            <label>
              Birim
              <select
                value={quantityUnit}
                onChange={(e) =>
                  setQuantityUnit(e.target.value as QuantityUnit)
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
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </label>
            <label>
              Gelen Fiyat
              <input
                type="text"
                inputMode="decimal"
                value={incomingAmount}
                onChange={(e) => setIncomingAmount(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </label>
            <label>
              Ödenen Fiyat
              <input
                type="text"
                inputMode="decimal"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                required
                disabled={isSubmitting}
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
              {isSubmitting ? 'Kaydediliyor...' : 'Güncelle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
