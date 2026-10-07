import { Fragment, useEffect, useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2, FiTrendingUp } from 'react-icons/fi'
import {
  useApplyDryLubePriceIncreaseMutation,
  useCreateDryLubePriceMutation,
  useDeleteDryLubePriceMutation,
  useGetDryLubePriceListQuery,
  useUpdateDryLubePriceMutation,
} from '../api/dryLubePriceApi'
import { useAppDispatch } from '../app/hooks'
import { DryLubePriceForm } from '../components/DryLubePriceForm'
import { ServicePriceIncreaseForm } from '../components/ServicePriceIncreaseForm'
import { setGlobalLoading } from '../features/ui/uiSlice'
import type {
  DryLubePrice,
  DryLubePriceUpdateRequest,
  DryLubePriceUpsertRequest,
  ServicePriceIncreaseScope,
} from '../types/dryLubePrice'
import { DRY_LUBE_SERVICE_COLUMNS } from '../types/dryLubePrice'
import {
  formatAmount,
  formatDateTime,
  getApiErrorMessage,
} from '../utils/priceForm'
import '../components/DataTable.css'
import './YaglamaServisiPage.css'
import './ServicePriceTable.css'

function cardValue(item: DryLubePrice, key: string): number | null {
  switch (key) {
    case 'normal':
      return item.cardNormal
    case 'waterless':
      return item.cardWaterless
    case 'underWashDryLube':
      return item.cardUnderWashDryLube
    default:
      return null
  }
}

function cashValue(item: DryLubePrice, key: string): number | null {
  switch (key) {
    case 'normal':
      return item.cashNormal
    case 'waterless':
      return item.cashWaterless
    case 'underWashDryLube':
      return item.cashUnderWashDryLube
    default:
      return null
  }
}

export function KuruYaglamaFiyatTablosuPage() {
  const dispatch = useAppDispatch()
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editing, setEditing] = useState<DryLubePrice | null>(null)
  const [zamOpen, setZamOpen] = useState(false)
  const [zamScope, setZamScope] = useState<ServicePriceIncreaseScope>('all')

  const { data, isFetching, isError, error } = useGetDryLubePriceListQuery()
  const [createItem, { isLoading: isCreating }] = useCreateDryLubePriceMutation()
  const [updateItem, { isLoading: isUpdating }] = useUpdateDryLubePriceMutation()
  const [deleteItem, { isLoading: isDeleting }] = useDeleteDryLubePriceMutation()
  const [applyIncrease, { isLoading: isApplying }] =
    useApplyDryLubePriceIncreaseMutation()

  useEffect(() => {
    dispatch(
      setGlobalLoading(
        isFetching || isCreating || isUpdating || isDeleting || isApplying,
      ),
    )
    return () => {
      dispatch(setGlobalLoading(false))
    }
  }, [
    dispatch,
    isFetching,
    isCreating,
    isUpdating,
    isDeleting,
    isApplying,
  ])

  const items = data?.items ?? []

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

  const openEdit = (item: DryLubePrice) => {
    setFormMode('edit')
    setEditing(item)
    setFormOpen(true)
  }

  const openZam = (scope: ServicePriceIncreaseScope) => {
    setZamScope(scope)
    setZamOpen(true)
  }

  const handleCreate = async (payload: DryLubePriceUpsertRequest) => {
    await createItem(payload).unwrap()
  }

  const handleUpdate = async (payload: DryLubePriceUpdateRequest) => {
    await updateItem(payload).unwrap()
  }

  const handleDelete = async (item: DryLubePrice) => {
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

  const handleApplyZam = async (payload: {
    scope: ServicePriceIncreaseScope
    serviceKey?: string | null
    percent: number
  }) => {
    const result = await applyIncrease(payload).unwrap()
    const skipped =
      result.skippedCount > 0
        ? ` (${result.skippedCount} alan atlandı)`
        : ''
    alert(`${result.updatedCount} fiyat alanı güncellendi.${skipped}`)
  }

  return (
    <div className="yaglama-page service-price-page">
      <header className="yaglama-page__header">
        <div>
          <h1>Kuru Yağlama Fiyat Tablosu</h1>
          <p>Marka-Model bazında Kart / Nakit kuru yağlama fiyatları.</p>
          <p className="service-price-page__meta">
            Son fiyat güncelleme:{' '}
            {formatDateTime(data?.tableLastPriceDate)}
          </p>
        </div>
      </header>

      {listError ? (
        <div className="yaglama-page__error" role="alert">
          {listError}
        </div>
      ) : null}

      <div className="service-price-page__toolbar">
        <span className="data-table__count">{items.length} marka-model</span>
        <div className="service-price-page__actions">
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => openZam('all')}
            disabled={items.length === 0}
          >
            <FiTrendingUp aria-hidden />
            Toplu Zam
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => openZam('service')}
            disabled={items.length === 0}
          >
            <FiTrendingUp aria-hidden />
            Sütun Zamı
          </button>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={openCreate}
          >
            <FiPlus aria-hidden />
            Marka-Model Ekle
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="service-price-page__empty service-price-page__table-wrap">
          Henüz kayıt yok. Marka-Model ekleyerek başlayın.
        </div>
      ) : (
        <div className="service-price-page__table-wrap">
          <table className="service-price-table">
            <thead>
              <tr>
                <th>Marka-Model</th>
                <th>Ödeme Şekli</th>
                {DRY_LUBE_SERVICE_COLUMNS.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <Fragment key={item.id}>
                  <tr>
                    <td className="service-price-table__brand" rowSpan={2}>
                      {item.brandModel}
                    </td>
                    <td className="service-price-table__pay--card">K. KARTI</td>
                    {DRY_LUBE_SERVICE_COLUMNS.map((col) => (
                      <td
                        key={`${item.id}-card-${col.key}`}
                        className="service-price-table__amount"
                      >
                        {formatAmount(cardValue(item, col.key))}
                      </td>
                    ))}
                    <td className="service-price-table__actions" rowSpan={2}>
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
                  <tr>
                    <td className="service-price-table__pay--cash">NAKİT</td>
                    {DRY_LUBE_SERVICE_COLUMNS.map((col) => (
                      <td
                        key={`${item.id}-cash-${col.key}`}
                        className="service-price-table__amount"
                      >
                        {formatAmount(cashValue(item, col.key))}
                      </td>
                    ))}
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DryLubePriceForm
        open={formOpen}
        mode={formMode}
        item={editing}
        onClose={() => setFormOpen(false)}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        isSubmitting={isCreating || isUpdating}
      />

      <ServicePriceIncreaseForm
        open={zamOpen}
        scope={zamScope}
        services={[...DRY_LUBE_SERVICE_COLUMNS]}
        onClose={() => setZamOpen(false)}
        onSubmit={handleApplyZam}
        isSubmitting={isApplying}
      />
    </div>
  )
}
