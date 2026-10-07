import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { FiTrendingUp, FiX } from 'react-icons/fi'
import type { ServicePriceIncreaseScope } from '../types/washPrice'
import { getApiErrorMessage } from '../utils/priceForm'
import './OilChangeCreateForm.css'

export interface ServiceColumnOption {
  key: string
  label: string
}

interface ServicePriceIncreaseFormProps {
  open: boolean
  scope: ServicePriceIncreaseScope
  services: ServiceColumnOption[]
  onClose: () => void
  onSubmit: (payload: {
    scope: ServicePriceIncreaseScope
    serviceKey?: string | null
    percent: number
  }) => Promise<void>
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

export function ServicePriceIncreaseForm({
  open,
  scope,
  services,
  onClose,
  onSubmit,
  isSubmitting,
}: ServicePriceIncreaseFormProps) {
  const [serviceKey, setServiceKey] = useState(services[0]?.key ?? '')
  const [percent, setPercent] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setPercent('')
    setServiceKey(services[0]?.key ?? '')
  }, [open, scope, services])

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

    if (scope === 'service' && !serviceKey) {
      setError('Hizmet seçilmelidir.')
      return
    }

    const serviceLabel =
      services.find((s) => s.key === serviceKey)?.label ?? serviceKey
    const label =
      scope === 'all' ? 'tüm tabloya' : `"${serviceLabel}" sütununa`

    const ok = window.confirm(
      `%${String(value).replace('.', ',')} zam ${label} uygulanacak. Devam edilsin mi?`,
    )
    if (!ok) return

    try {
      await onSubmit({
        scope,
        serviceKey: scope === 'service' ? serviceKey : null,
        percent: value,
      })
      onClose()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Zam uygulanamadı.'))
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
            {scope === 'all' ? 'Toplu Zam' : 'Sütun Zamı'}
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
            Mevcut fiyatlara yüzde zam uygulanır. Boş fiyatlar atlanır.
            {scope === 'service'
              ? ' Seçilen sütunun Kart ve Nakit değerleri güncellenir.'
              : ' Tablodaki tüm dolu fiyatlar güncellenir.'}
          </p>

          <div className="create-modal__grid create-modal__grid--single">
            {scope === 'service' ? (
              <label>
                Hizmet
                <select
                  value={serviceKey}
                  onChange={(e) => setServiceKey(e.target.value)}
                  disabled={isSubmitting}
                  required
                >
                  {services.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label>
                Kapsam
                <input type="text" value="Tüm tablo" disabled />
              </label>
            )}

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
