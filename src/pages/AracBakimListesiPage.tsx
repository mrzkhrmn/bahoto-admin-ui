import { useEffect, useMemo, useState } from 'react'
import { FiEdit2, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi'
import {
  useCreateVehicleMaintenanceMutation,
  useDeleteVehicleMaintenanceMutation,
  useGetVehicleMaintenanceListQuery,
  useUpdateVehicleMaintenanceMutation,
} from '../api/vehicleMaintenanceApi'
import { useAppDispatch } from '../app/hooks'
import { VehicleMaintenanceForm } from '../components/VehicleMaintenanceForm'
import { setGlobalLoading } from '../features/ui/uiSlice'
import type {
  VehicleMaintenance,
  VehicleMaintenanceUpdateRequest,
  VehicleMaintenanceUpsertRequest,
} from '../types/vehicleMaintenance'
import { getApiErrorMessage } from '../utils/priceForm'
import '../components/DataTable.css'
import './YaglamaServisiPage.css'
import './ServicePriceTable.css'

function displayText(value: string | null | undefined): string {
  if (!value?.trim()) return '—'
  return value
}

function extractBrandKey(brandModel: string): string {
  const normalized = brandModel.trim().replace(/\s+/g, ' ')
  if (!normalized) return ''
  const space = normalized.indexOf(' ')
  const brand = space < 0 ? normalized : normalized.slice(0, space)
  return brand.toLocaleLowerCase('tr')
}

/** Aynı markayı (ilk kelime) bir arada tutar; yeni kayıt marka grubunun altına gelir. */
function sortByBrandGroups(items: VehicleMaintenance[]): VehicleMaintenance[] {
  const brandFirst = new Map<string, number>()
  for (const item of items) {
    const brand = extractBrandKey(item.brandModel)
    const current = brandFirst.get(brand)
    if (current == null || item.sortOrder < current) {
      brandFirst.set(brand, item.sortOrder)
    }
  }

  return [...items].sort((a, b) => {
    const brandA = extractBrandKey(a.brandModel)
    const brandB = extractBrandKey(b.brandModel)
    const groupCmp = (brandFirst.get(brandA) ?? 0) - (brandFirst.get(brandB) ?? 0)
    if (groupCmp !== 0) return groupCmp
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
    return a.brandModel.localeCompare(b.brandModel, 'tr')
  })
}

export function AracBakimListesiPage() {
  const dispatch = useAppDispatch()
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editing, setEditing] = useState<VehicleMaintenance | null>(null)
  const [search, setSearch] = useState('')

  const { data, isFetching, isError, error } =
    useGetVehicleMaintenanceListQuery()
  const [createItem, { isLoading: isCreating }] =
    useCreateVehicleMaintenanceMutation()
  const [updateItem, { isLoading: isUpdating }] =
    useUpdateVehicleMaintenanceMutation()
  const [deleteItem, { isLoading: isDeleting }] =
    useDeleteVehicleMaintenanceMutation()

  useEffect(() => {
    dispatch(setGlobalLoading(isFetching || isCreating || isUpdating || isDeleting))
    return () => {
      dispatch(setGlobalLoading(false))
    }
  }, [dispatch, isFetching, isCreating, isUpdating, isDeleting])

  const items = useMemo(
    () => sortByBrandGroups(data?.items ?? []),
    [data?.items],
  )
  const filteredItems = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('tr')
    if (!q) return items
    return items.filter((item) => {
      const fields = [
        item.brandModel,
        item.engineOil,
        item.airFilter,
        item.oilFilter,
        item.fuelFilter,
        item.polenFilter,
      ]
      return fields.some((field) =>
        (field ?? '').toLocaleLowerCase('tr').includes(q),
      )
    })
  }, [items, search])

  const listError =
    isError &&
    error &&
    typeof error === 'object' &&
    'data' in error &&
    error.data &&
    typeof error.data === 'object' &&
    'message' in error.data &&
    typeof error.data.message === 'string'
      ? error.data.message
      : isError
        ? 'Liste yüklenemedi.'
        : null

  const openCreate = () => {
    setFormMode('create')
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (item: VehicleMaintenance) => {
    setFormMode('edit')
    setEditing(item)
    setFormOpen(true)
  }

  const handleCreate = async (payload: VehicleMaintenanceUpsertRequest) => {
    await createItem(payload).unwrap()
  }

  const handleUpdate = async (payload: VehicleMaintenanceUpdateRequest) => {
    await updateItem(payload).unwrap()
  }

  const handleDelete = async (item: VehicleMaintenance) => {
    const ok = window.confirm(
      `"${item.brandModel}" kaydını silmek istediğinize emin misiniz?`,
    )
    if (!ok) return
    try {
      await deleteItem({ id: item.id }).unwrap()
    } catch (err) {
      alert(getApiErrorMessage(err, 'Kayıt silinemedi.'))
    }
  }

  return (
    <div className="yaglama-page service-price-page">
      <header className="yaglama-page__header">
        <div>
          <h1>Araç Bakım Listesi</h1>
          <p>Marka/model bazında motor yağı ve filtre bilgileri.</p>
        </div>
      </header>

      {listError ? (
        <div className="yaglama-page__error" role="alert">
          {listError}
        </div>
      ) : null}

      <div className="service-price-page__toolbar">
        <div className="data-table__filters">
          <label className="data-table__search">
            <FiSearch aria-hidden />
            <input
              type="search"
              placeholder="Marka, yağ veya filtre ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <span className="data-table__count">
            {filteredItems.length}
            {search.trim() ? ` / ${items.length}` : ''} kayıt
          </span>
        </div>
        <div className="service-price-page__actions">
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={openCreate}
          >
            <FiPlus aria-hidden />
            Kayıt Ekle
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="service-price-page__empty service-price-page__table-wrap">
          Henüz kayıt yok. Marka/model ekleyerek başlayın.
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="service-price-page__empty service-price-page__table-wrap">
          Aramanızla eşleşen kayıt bulunamadı.
        </div>
      ) : (
        <div className="service-price-page__table-wrap">
          <table className="service-price-table">
            <thead>
              <tr>
                <th>Marka / Model</th>
                <th>Motor Yağı</th>
                <th>Hava Filtresi</th>
                <th>Yağ Filtresi</th>
                <th>Yakıt Filtresi</th>
                <th>Polen Filtresi</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="service-price-table__group-end">
                  <td className="service-price-table__brand">
                    {item.brandModel}
                  </td>
                  <td className="service-price-table__text">
                    {displayText(item.engineOil)}
                  </td>
                  <td className="service-price-table__text">
                    {displayText(item.airFilter)}
                  </td>
                  <td className="service-price-table__text">
                    {displayText(item.oilFilter)}
                  </td>
                  <td className="service-price-table__text">
                    {displayText(item.fuelFilter)}
                  </td>
                  <td className="service-price-table__text">
                    {displayText(item.polenFilter)}
                  </td>
                  <td className="service-price-table__actions">
                    <div className="data-table__actions">
                      <button
                        type="button"
                        className="btn btn--edit"
                        aria-label="Düzenle"
                        title="Düzenle"
                        onClick={() => openEdit(item)}
                      >
                        <FiEdit2 aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="btn btn--danger"
                        aria-label="Sil"
                        title="Sil"
                        onClick={() => void handleDelete(item)}
                      >
                        <FiTrash2 aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <VehicleMaintenanceForm
        open={formOpen}
        mode={formMode}
        item={editing}
        onClose={() => setFormOpen(false)}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        isSubmitting={isCreating || isUpdating}
      />
    </div>
  )
}
