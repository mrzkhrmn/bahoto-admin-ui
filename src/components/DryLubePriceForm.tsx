import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { FiPlus, FiX } from 'react-icons/fi'
import type {
  DryLubePrice,
  DryLubePriceUpdateRequest,
  DryLubePriceUpsertRequest,
} from '../types/dryLubePrice'
import { DRY_LUBE_SERVICE_COLUMNS } from '../types/dryLubePrice'
import {
  getApiErrorMessage,
  parsePrice,
  priceToInput,
} from '../utils/priceForm'
import './OilChangeCreateForm.css'
import '../pages/ServicePriceTable.css'

interface DryLubePriceFormProps {
  open: boolean
  mode: 'create' | 'edit'
  item?: DryLubePrice | null
  onClose: () => void
  onCreate: (payload: DryLubePriceUpsertRequest) => Promise<void>
  onUpdate: (payload: DryLubePriceUpdateRequest) => Promise<void>
  isSubmitting: boolean
}

type PriceFields = Omit<DryLubePriceUpsertRequest, 'brandModel'>

const emptyPrices: Record<keyof PriceFields, string> = {
  cardNormal: '',
  cashNormal: '',
  cardWaterless: '',
  cashWaterless: '',
  cardUnderWashDryLube: '',
  cashUnderWashDryLube: '',
}

const fieldMap: Record<
  (typeof DRY_LUBE_SERVICE_COLUMNS)[number]['key'],
  { card: keyof PriceFields; cash: keyof PriceFields }
> = {
  normal: { card: 'cardNormal', cash: 'cashNormal' },
  waterless: { card: 'cardWaterless', cash: 'cashWaterless' },
  underWashDryLube: {
    card: 'cardUnderWashDryLube',
    cash: 'cashUnderWashDryLube',
  },
}

export function DryLubePriceForm({
  open,
  mode,
  item = null,
  onClose,
  onCreate,
  onUpdate,
  isSubmitting,
}: DryLubePriceFormProps) {
  const [brandModel, setBrandModel] = useState('')
  const [prices, setPrices] = useState(emptyPrices)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    if (mode === 'edit' && item) {
      setBrandModel(item.brandModel)
      setPrices({
        cardNormal: priceToInput(item.cardNormal),
        cashNormal: priceToInput(item.cashNormal),
        cardWaterless: priceToInput(item.cardWaterless),
        cashWaterless: priceToInput(item.cashWaterless),
        cardUnderWashDryLube: priceToInput(item.cardUnderWashDryLube),
        cashUnderWashDryLube: priceToInput(item.cashUnderWashDryLube),
      })
    } else {
      setBrandModel('')
      setPrices(emptyPrices)
    }
  }, [open, mode, item])

  if (!open) return null

  const handleClose = () => {
    if (isSubmitting) return
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!brandModel.trim()) {
      setError('Marka-Model zorunludur.')
      return
    }

    const parsed: DryLubePriceUpsertRequest = { brandModel: brandModel.trim() }
    for (const key of Object.keys(prices) as (keyof PriceFields)[]) {
      const value = parsePrice(prices[key])
      if (value === 'invalid') {
        setError('Fiyatlar geçerli sayı olmalıdır.')
        return
      }
      parsed[key] = value
    }

    try {
      if (mode === 'edit' && item) {
        await onUpdate({ ...parsed, id: item.id })
      } else {
        await onCreate(parsed)
      }
      onClose()
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          mode === 'edit' ? 'Kayıt güncellenemedi.' : 'Kayıt eklenemedi.',
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
            {mode === 'edit'
              ? 'Kuru Yağlama Fiyatı Düzenle'
              : 'Kuru Yağlama Fiyatı Ekle'}
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

          <div className="create-modal__grid create-modal__grid--single">
            <label>
              Marka-Model
              <input
                type="text"
                value={brandModel}
                onChange={(e) => setBrandModel(e.target.value)}
                placeholder="Örn. SUV - JEEP"
                required
                disabled={isSubmitting}
              />
            </label>
          </div>

          {DRY_LUBE_SERVICE_COLUMNS.map((col) => {
            const fields = fieldMap[col.key]
            return (
              <div key={col.key}>
                <p className="service-price-form__section-title">{col.label}</p>
                <div className="service-price-form__pair">
                  <label>
                    K. Kartı
                    <input
                      type="text"
                      inputMode="decimal"
                      value={prices[fields.card]}
                      onChange={(e) =>
                        setPrices((prev) => ({
                          ...prev,
                          [fields.card]: e.target.value,
                        }))
                      }
                      disabled={isSubmitting}
                    />
                  </label>
                  <label>
                    Nakit
                    <input
                      type="text"
                      inputMode="decimal"
                      value={prices[fields.cash]}
                      onChange={(e) =>
                        setPrices((prev) => ({
                          ...prev,
                          [fields.cash]: e.target.value,
                        }))
                      }
                      disabled={isSubmitting}
                    />
                  </label>
                </div>
              </div>
            )
          })}

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
