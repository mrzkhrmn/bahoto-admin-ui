import { useEffect, useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import {
  useCreateOilChangeMutation,
  useDeleteOilChangeMutation,
  useGetOilChangeListQuery,
  useUpdateOilChangeMutation,
} from '../api/yaglamaServisiApi'
import { useAppDispatch } from '../app/hooks'
import { DataTable } from '../components/DataTable'
import { OilChangeCreateForm } from '../components/OilChangeCreateForm'
import { setGlobalLoading } from '../features/ui/uiSlice'
import type {
  OilChange,
  OilChangeCreateRequest,
  OilChangeUpdateRequest,
} from '../types/yaglamaServisi'
import './YaglamaServisiPage.css'

const PAGE_SIZE = 10
const DATE_FILTER_PAGE_SIZE = 1000

export function YaglamaServisiPage() {
  const dispatch = useAppDispatch()
  const [page, setPage] = useState(1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingRow, setEditingRow] = useState<OilChange | null>(null)

  const dateFilterActive = Boolean(startDate || endDate)
  const listPage = dateFilterActive ? 1 : page
  const listPageSize = dateFilterActive ? DATE_FILTER_PAGE_SIZE : PAGE_SIZE

  const { data, isFetching, isError, error } = useGetOilChangeListQuery({
    page: listPage,
    pageSize: listPageSize,
  })
  const [createOilChange, { isLoading: isCreating }] =
    useCreateOilChangeMutation()
  const [updateOilChange, { isLoading: isUpdating }] =
    useUpdateOilChangeMutation()
  const [deleteOilChange, { isLoading: isDeleting }] =
    useDeleteOilChangeMutation()

  useEffect(() => {
    dispatch(setGlobalLoading(isFetching || isCreating || isUpdating || isDeleting))
    return () => {
      dispatch(setGlobalLoading(false))
    }
  }, [dispatch, isFetching, isCreating, isUpdating, isDeleting])

  const clearDateFilter = () => {
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  const handleStartDateChange = (date: string) => {
    setStartDate(date)
    if (endDate && date && date > endDate) setEndDate(date)
  }

  const handleEndDateChange = (date: string) => {
    setEndDate(date)
    if (startDate && date && date < startDate) setStartDate(date)
  }

  const openCreate = () => {
    setFormMode('create')
    setEditingRow(null)
    setFormOpen(true)
  }

  const handleEdit = (row: OilChange) => {
    setFormMode('edit')
    setEditingRow(row)
    setFormOpen(true)
  }

  const handleDelete = async (row: OilChange) => {
    const ok = window.confirm(
      `${row.plate} plakalı kaydı silmek istediğinize emin misiniz?`,
    )
    if (!ok) return

    try {
      await deleteOilChange({ id: row.id }).unwrap()
      if ((data?.items.length ?? 0) <= 1 && page > 1 && !dateFilterActive) {
        setPage((p) => p - 1)
      }
    } catch (err) {
      const message =
        err &&
        typeof err === 'object' &&
        'data' in err &&
        err.data &&
        typeof err.data === 'object' &&
        'message' in err.data &&
        typeof err.data.message === 'string'
          ? err.data.message
          : 'Kayıt silinemedi.'
      alert(message)
    }
  }

  const handleCreate = async (payload: OilChangeCreateRequest) => {
    await createOilChange(payload).unwrap()
    setPage(1)
  }

  const handleUpdate = async (payload: OilChangeUpdateRequest) => {
    await updateOilChange(payload).unwrap()
  }

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

  return (
    <div className="yaglama-page">
      <header className="yaglama-page__header">
        <div>
          <h1>Yağlama Servisi</h1>
          <p>Yağ değişim kayıtlarını görüntüleyin, arayın ve yönetin.</p>
        </div>
        <button
          type="button"
          className="btn btn--primary yaglama-page__add"
          onClick={openCreate}
        >
          <FiPlus aria-hidden />
          Yeni Kayıt
        </button>
      </header>

      {listError ? (
        <div className="yaglama-page__error" role="alert">
          {listError}
        </div>
      ) : null}

      <DataTable
        data={data?.items ?? []}
        totalCount={data?.totalCount ?? 0}
        page={data?.page ?? page}
        pageSize={data?.pageSize ?? listPageSize}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        onClearDateFilter={clearDateFilter}
      />

      <OilChangeCreateForm
        open={formOpen}
        mode={formMode}
        initialData={editingRow}
        onClose={() => {
          setFormOpen(false)
          setEditingRow(null)
        }}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        isSubmitting={isCreating || isUpdating}
      />
    </div>
  )
}
