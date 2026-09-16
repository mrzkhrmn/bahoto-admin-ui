import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { FiEdit2, FiPlus, FiX } from 'react-icons/fi'
import type {
  OilChange,
  OilChangeCreateRequest,
  OilChangeUpdateRequest,
} from '../types/yaglamaServisi'
import './OilChangeCreateForm.css'

type FormMode = 'create' | 'edit'

interface OilChangeFormProps {
  open: boolean
  mode: FormMode
  initialData?: OilChange | null
  onClose: () => void
  onCreate: (payload: OilChangeCreateRequest) => Promise<void>
  onUpdate: (payload: OilChangeUpdateRequest) => Promise<void>
  isSubmitting: boolean
}

const emptyForm = {
  vehicle: '',
  plate: '',
  oilType: '',
  kmChanged: '',
  nextChangeKm: '',
  oilFilter: '',
  airFilter: '',
  fuelFilter: '',
  polenFilter: '',
  note: '',
  employee: '',
  price: '',
}

function toFormState(data?: OilChange | null) {
  if (!data) return emptyForm
  return {
    vehicle: data.vehicle ?? '',
    plate: data.plate ?? '',
    oilType: data.oilType ?? '',
    kmChanged: String(data.kmChanged ?? ''),
    nextChangeKm:
      data.nextChangeKm == null ? '' : String(data.nextChangeKm),
    oilFilter: data.oilFilter ?? '',
    airFilter: data.airFilter ?? '',
    fuelFilter: data.fuelFilter ?? '',
    polenFilter: data.polenFilter ?? '',
    note: data.note ?? '',
    employee: data.employee ?? '',
    price: data.price == null ? '' : String(data.price),
  }
}

function parseOptionalPrice(raw: string): number | null | 'invalid' {
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

export function OilChangeCreateForm({
  open,
  mode,
  initialData = null,
  onClose,
  onCreate,
  onUpdate,
  isSubmitting,
}: OilChangeFormProps) {
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
    setForm(emptyForm)
    setError(null)
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const kmChanged = Number(form.kmChanged)
    if (!form.vehicle.trim() || !form.plate.trim() || !form.oilType.trim()) {
      setError('Araç, plaka ve yağ cinsi zorunludur.')
      return
    }
    if (!Number.isFinite(kmChanged) || kmChanged < 0) {
      setError('Geçerli bir değişim km girin.')
      return
    }

    const price = parseOptionalPrice(form.price)
    if (price === 'invalid') {
      setError('Geçerli bir fiyat girin.')
      return
    }

    const nextRaw = form.nextChangeKm.trim()
    let nextChangeKm: number | null
    if (nextRaw === '') {
      nextChangeKm = mode === 'create' ? kmChanged + 10000 : null
    } else {
      const parsed = Number(nextRaw)
      if (!Number.isFinite(parsed) || parsed < 0) {
        setError('Geçerli bir gelecek km girin.')
        return
      }
      nextChangeKm = parsed
    }

    try {
      if (mode === 'create') {
        await onCreate({
          vehicle: form.vehicle.trim(),
          plate: form.plate.trim(),
          oilType: form.oilType.trim(),
          kmChanged,
          nextChangeKm: nextChangeKm as number,
          oilFilter: form.oilFilter.trim(),
          airFilter: form.airFilter.trim(),
          fuelFilter: form.fuelFilter.trim(),
          polenFilter: form.polenFilter.trim(),
          note: form.note.trim(),
          employee: form.employee.trim(),
          price,
        })
      } else {
        if (!initialData?.id) {
          setError('Güncellenecek kayıt bulunamadı.')
          return
        }

        await onUpdate({
          id: initialData.id,
          vehicle: form.vehicle.trim(),
          plate: form.plate.trim(),
          oilType: form.oilType.trim(),
          kmChanged,
          nextChangeKm,
          oilFilter: form.oilFilter.trim(),
          airFilter: form.airFilter.trim(),
          fuelFilter: form.fuelFilter.trim(),
          polenFilter: form.polenFilter.trim(),
          note: form.note.trim(),
          employee: form.employee.trim(),
          price,
        })
      }

      setForm(emptyForm)
      setError(null)
      onClose()
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          mode === 'create' ? 'Kayıt oluşturulamadı.' : 'Kayıt güncellenemedi.',
        ),
      )
    }
  }

  const isEdit = mode === 'edit'

  return (
    <div className="create-modal" role="dialog" aria-modal="true">
      <div className="create-modal__backdrop" onClick={handleClose} />
      <div className="create-modal__panel">
        <header className="create-modal__header">
          <h2>
            {isEdit ? <FiEdit2 aria-hidden /> : <FiPlus aria-hidden />}
            {isEdit ? 'Yağlama Kaydını Güncelle' : 'Yeni Yağlama Kaydı'}
          </h2>
          <button
            type="button"
            className="create-modal__close"
            onClick={handleClose}
            aria-label="Kapat"
          >
            <FiX />
          </button>
        </header>

        <form className="create-modal__form" onSubmit={handleSubmit}>
          {error ? (
            <div className="create-modal__error" role="alert">
              {error}
            </div>
          ) : null}

          <div className="create-modal__grid">
            <label>
              <span>Araç</span>
              <input
                value={form.vehicle}
                onChange={(e) => update('vehicle', e.target.value)}
                required
              />
            </label>
            <label>
              <span>Plaka</span>
              <input
                value={form.plate}
                onChange={(e) => update('plate', e.target.value)}
                required
              />
            </label>
            <label>
              <span>Yağ Cinsi</span>
              <input
                value={form.oilType}
                onChange={(e) => update('oilType', e.target.value)}
                required
              />
            </label>
            <label>
              <span>Değişim Km</span>
              <input
                type="number"
                min={0}
                value={form.kmChanged}
                onChange={(e) => update('kmChanged', e.target.value)}
                required
              />
            </label>
            <label>
              <span>Gelecek Km</span>
              <input
                type="number"
                min={0}
                value={form.nextChangeKm}
                onChange={(e) => update('nextChangeKm', e.target.value)}
                placeholder={
                  isEdit
                    ? 'Boş bırakılabilir'
                    : 'Boşsa değişim km + 10.000'
                }
              />
            </label>
            <label>
              <span>Yağ Filtresi</span>
              <input
                value={form.oilFilter}
                onChange={(e) => update('oilFilter', e.target.value)}
              />
            </label>
            <label>
              <span>Hava Filtresi</span>
              <input
                value={form.airFilter}
                onChange={(e) => update('airFilter', e.target.value)}
              />
            </label>
            <label>
              <span>Yakıt Filtresi</span>
              <input
                value={form.fuelFilter}
                onChange={(e) => update('fuelFilter', e.target.value)}
              />
            </label>
            <label>
              <span>Polen Filtresi</span>
              <input
                value={form.polenFilter}
                onChange={(e) => update('polenFilter', e.target.value)}
              />
            </label>
            <label>
              <span>Yapan Usta</span>
              <input
                value={form.employee}
                onChange={(e) => update('employee', e.target.value)}
              />
            </label>
            <label>
              <span>Fiyat / TL</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
                placeholder="Boş bırakılabilir"
              />
            </label>
            <label className="create-modal__full">
              <span>Not</span>
              <textarea
                rows={3}
                value={form.note}
                onChange={(e) => update('note', e.target.value)}
              />
            </label>
          </div>

          <footer className="create-modal__actions">
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
                ? isEdit
                  ? 'Güncelleniyor...'
                  : 'Kaydediliyor...'
                : isEdit
                  ? 'Güncelle'
                  : 'Kaydet'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
