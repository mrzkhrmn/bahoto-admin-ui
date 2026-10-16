import { FiEye, FiX } from 'react-icons/fi'
import type { OilChange } from '../types/yaglamaServisi'
import './OilChangeDetailModal.css'

interface OilChangeDetailModalProps {
  row: OilChange | null
  onClose: () => void
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('tr-TR')
}

function formatNumber(value: number): string {
  return value.toLocaleString('tr-TR')
}

function formatPriceDisplay(row: OilChange): string {
  const parts: string[] = []
  if (row.price != null) {
    parts.push(
      `${row.price.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} TL`,
    )
  }
  const method = row.paymentMethod?.trim()
  if (method) parts.push(method)
  const account = row.bankAccount?.trim()
  if (account) parts.push(account)
  return parts.length > 0 ? parts.join(' ') : '—'
}

function display(value: string | null | undefined): string {
  const trimmed = value?.trim()
  return trimmed ? trimmed : '—'
}

export function OilChangeDetailModal({ row, onClose }: OilChangeDetailModalProps) {
  if (!row) return null

  const fields: { label: string; value: string }[] = [
    { label: 'Tarih', value: formatDate(row.createdAt) },
    { label: 'Araç', value: display(row.vehicle) },
    { label: 'Plaka', value: display(row.plate) },
    { label: 'Yağ Cinsi', value: display(row.oilType) },
    { label: 'Değişim Km', value: formatNumber(row.kmChanged) },
    {
      label: 'Gelecek Km',
      value: row.nextChangeKm == null ? '—' : formatNumber(row.nextChangeKm),
    },
    { label: 'Yağ Filtresi', value: display(row.oilFilter) },
    { label: 'Hava Filtresi', value: display(row.airFilter) },
    { label: 'Yakıt Filtresi', value: display(row.fuelFilter) },
    { label: 'Polen Filtresi', value: display(row.polenFilter) },
    { label: 'Yapan Usta', value: display(row.employee) },
    { label: 'Telefon', value: display(row.phone) },
    { label: 'Fiyat', value: formatPriceDisplay(row) },
  ]

  const noteValue = display(row.note)

  return (
    <div className="detail-modal" role="dialog" aria-modal="true">
      <div className="detail-modal__backdrop" onClick={onClose} />
      <div className="detail-modal__panel">
        <header className="detail-modal__header">
          <h2>
            <FiEye aria-hidden />
            Kayıt Detayı
          </h2>
          <button
            type="button"
            className="detail-modal__close"
            onClick={onClose}
            aria-label="Kapat"
          >
            <FiX />
          </button>
        </header>

        <div className="detail-modal__body">
          <dl className="detail-modal__grid">
            {fields.map((field) => (
              <div key={field.label} className="detail-modal__field">
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>
          <div className="detail-modal__field detail-modal__field--full detail-modal__note">
            <span className="detail-modal__note-label">Not</span>
            <p className="detail-modal__note-value">{noteValue}</p>
          </div>
        </div>

        <footer className="detail-modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Kapat
          </button>
        </footer>
      </div>
    </div>
  )
}
