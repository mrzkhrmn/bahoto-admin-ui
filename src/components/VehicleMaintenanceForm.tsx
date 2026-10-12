import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { FiPlus, FiX } from 'react-icons/fi'
import type {
  VehicleMaintenance,
  VehicleMaintenanceUpdateRequest,
  VehicleMaintenanceUpsertRequest,
} from '../types/vehicleMaintenance'
import { getApiErrorMessage } from '../utils/priceForm'
import './OilChangeCreateForm.css'

interface VehicleMaintenanceFormProps {
  open: boolean
  mode: 'create' | 'edit'
  item?: VehicleMaintenance | null
  onClose: () => void
  onCreate: (payload: VehicleMaintenanceUpsertRequest) => Promise<void>
  onUpdate: (payload: VehicleMaintenanceUpdateRequest) => Promise<void>
  isSubmitting: boolean
}

export function VehicleMaintenanceForm({
  open,
  mode,
  item = null,
  onClose,
  onCreate,
  onUpdate,
  isSubmitting,
}: VehicleMaintenanceFormProps) {
  const [brandModel, setBrandModel] = useState('')
  const [engineOil, setEngineOil] = useState('')
  const [airFilter, setAirFilter] = useState('')
  const [oilFilter, setOilFilter] = useState('')
  const [polenFilter, setPolenFilter] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    if (mode === 'edit' && item) {
      setBrandModel(item.brandModel)
      setEngineOil(item.engineOil ?? '')
      setAirFilter(item.airFilter ?? '')
      setOilFilter(item.oilFilter ?? '')
      setPolenFilter(item.polenFilter ?? '')
    } else {
      setBrandModel('')
      setEngineOil('')
      setAirFilter('')
      setOilFilter('')
      setPolenFilter('')
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

    const payload: VehicleMaintenanceUpsertRequest = {
      brandModel: brandModel.trim(),
      engineOil: engineOil.trim() || null,
      airFilter: airFilter.trim() || null,
      oilFilter: oilFilter.trim() || null,
      polenFilter: polenFilter.trim() || null,
    }

    try {
      if (mode === 'edit' && item) {
        await onUpdate({ ...payload, id: item.id })
      } else {
        await onCreate(payload)
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
      <div className="create-modal__panel create-modal__panel--narrow">
        <header className="create-modal__header">
          <h2>
            <FiPlus aria-hidden />
            {mode === 'edit' ? 'Bakım Kaydı Düzenle' : 'Bakım Kaydı Ekle'}
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
              Marka / Model
              <input
                type="text"
                value={brandModel}
                onChange={(e) => setBrandModel(e.target.value)}
                placeholder="Örn. Fiat Egea 1.6"
                required
                disabled={isSubmitting}
              />
            </label>
            <label>
              Motor Yağı
              <input
                type="text"
                value={engineOil}
                onChange={(e) => setEngineOil(e.target.value)}
                placeholder="Örn. 5W-30"
                disabled={isSubmitting}
              />
            </label>
            <label>
              Hava Filtresi
              <input
                type="text"
                value={airFilter}
                onChange={(e) => setAirFilter(e.target.value)}
                disabled={isSubmitting}
              />
            </label>
            <label>
              Yağ Filtresi
              <input
                type="text"
                value={oilFilter}
                onChange={(e) => setOilFilter(e.target.value)}
                disabled={isSubmitting}
              />
            </label>
            <label>
              Polen Filtresi
              <input
                type="text"
                value={polenFilter}
                onChange={(e) => setPolenFilter(e.target.value)}
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
