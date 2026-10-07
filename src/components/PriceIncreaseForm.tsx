import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { FiTrendingUp, FiX } from 'react-icons/fi'
import type {
  PriceIncreaseScope,
  Product,
  ProductApplyPriceIncreaseRequest,
} from '../types/product'
import './OilChangeCreateForm.css'

interface PriceIncreaseFormProps {
  open: boolean
  scope: PriceIncreaseScope
  brand?: string
  product?: Product | null
  brands: string[]
  onClose: () => void
  onSubmit: (payload: ProductApplyPriceIncreaseRequest) => Promise<void>
  isSubmitting: boolean
}

function parsePercent(raw: string): number | 'invalid' {
  const trimmed = raw.trim()
  if (trimmed === '') return 'invalid'
  const normalized = trimmed.replace(',', '.')
  const value = Number(normalized)
  if (!Number.isFinite(value) || value === 0) return 'invalid'
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

function scopeTitle(scope: PriceIncreaseScope): string {
  switch (scope) {
    case 'all':
      return 'Tüm Ürünlere Zam'
    case 'brand':
      return 'Markaya Zam'
    case 'product':
      return 'Ürüne Zam'
  }
}

export function PriceIncreaseForm({
  open,
  scope,
  brand = '',
  product = null,
  brands,
  onClose,
  onSubmit,
  isSubmitting,
}: PriceIncreaseFormProps) {
  const [selectedBrand, setSelectedBrand] = useState(brand)
  const [percent, setPercent] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setPercent('')
    setSelectedBrand(brand || brands[0] || '')
  }, [open, brand, brands, scope, product])

  if (!open) return null

  const handleClose = () => {
    if (isSubmitting) return
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const value = parsePercent(percent)
    if (value === 'invalid') {
      setError('Geçerli bir zam oranı girin (0 olamaz).')
      return
    }

    if (scope === 'brand' && !selectedBrand.trim()) {
      setError('Marka seçilmelidir.')
      return
    }

    if (scope === 'product' && !product) {
      setError('Ürün seçilmelidir.')
      return
    }

    const label =
      scope === 'all'
        ? 'tüm ürünlere'
        : scope === 'brand'
          ? `"${selectedBrand}" markasına`
          : `"${product!.brand} / ${product!.name}" ürününe`

    const ok = window.confirm(
      `%${String(value).replace('.', ',')} zam ${label} uygulanacak. Devam edilsin mi?`,
    )
    if (!ok) return

    try {
      await onSubmit({
        scope,
        brand: scope === 'brand' ? selectedBrand.trim() : null,
        productId: scope === 'product' ? product!.id : null,
        percent: value,
      })
      onClose()
    } catch (err) {
      setError(getErrorMessage(err, 'Zam uygulanamadı.'))
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
      <div className="create-modal__panel create-modal__panel--narrow">
        <header className="create-modal__header">
          <h2>
            <FiTrendingUp aria-hidden />
            {scopeTitle(scope)}
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
            Mevcut fiyata yüzde zam uygulanır. Fiyatı olmayan ürünler atlanır.
          </p>

          <div className="create-modal__grid create-modal__grid--single">
            {scope === 'brand' ? (
              <label>
                Marka
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  disabled={isSubmitting || Boolean(brand)}
                  required
                >
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {scope === 'product' && product ? (
              <label>
                Ürün
                <input
                  type="text"
                  value={`${product.brand} / ${product.name}`}
                  disabled
                />
              </label>
            ) : null}

            {scope === 'all' ? (
              <label>
                Kapsam
                <input type="text" value="Tüm ürünler" disabled />
              </label>
            ) : null}

            <label>
              Zam Oranı (%)
              <input
                type="text"
                inputMode="decimal"
                placeholder="Örn. 10"
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                disabled={isSubmitting}
                required
                autoFocus
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
              Zam Uygula
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
