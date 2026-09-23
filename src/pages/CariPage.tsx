import { useEffect, useMemo, useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import {
  useCreateCariMutation,
  useDeleteCariMutation,
  useGetCariListQuery,
  useUpdateCariMutation,
} from '../api/cariApi'
import { useAppDispatch } from '../app/hooks'
import { CariCreateForm } from '../components/CariCreateForm'
import {
  SimpleDataTable,
  type SimpleColumn,
} from '../components/SimpleDataTable'
import { setGlobalLoading } from '../features/ui/uiSlice'
import type {
  Cari,
  CariCreateRequest,
  CariUpdateRequest,
} from '../types/cari'
import './YaglamaServisiPage.css'

const PAGE_SIZE = 10

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('tr-TR')
}

function formatAmount(value: number): string {
  return value.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function CariPage() {
  const dispatch = useAppDispatch()
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingRow, setEditingRow] = useState<Cari | null>(null)

  const { data, isFetching, isError, error } = useGetCariListQuery({
    page,
    pageSize: PAGE_SIZE,
  })
  const [createCari, { isLoading: isCreating }] = useCreateCariMutation()
  const [updateCari, { isLoading: isUpdating }] = useUpdateCariMutation()
  const [deleteCari, { isLoading: isDeleting }] = useDeleteCariMutation()

  useEffect(() => {
    dispatch(
      setGlobalLoading(isFetching || isCreating || isUpdating || isDeleting),
    )
    return () => {
      dispatch(setGlobalLoading(false))
    }
  }, [dispatch, isFetching, isCreating, isUpdating, isDeleting])

  const columns = useMemo<SimpleColumn<Cari>[]>(
    () => [
      {
        key: 'product',
        label: 'Ürün',
        searchValue: (row) => `${row.productBrand} ${row.productName}`,
        getSortValue: (row) => `${row.productBrand} ${row.productName}`,
        render: (row) => `${row.productBrand} — ${row.productName}`,
      },
      {
        key: 'incomingAmount',
        label: 'Gelen',
        searchValue: (row) => formatAmount(row.incomingAmount),
        getSortValue: (row) => row.incomingAmount,
        render: (row) => formatAmount(row.incomingAmount),
      },
      {
        key: 'paidAmount',
        label: 'Ödenen',
        searchValue: (row) => formatAmount(row.paidAmount),
        getSortValue: (row) => row.paidAmount,
        render: (row) => formatAmount(row.paidAmount),
      },
      {
        key: 'balance',
        label: 'Bakiye',
        searchValue: (row) => formatAmount(row.balance),
        getSortValue: (row) => row.balance,
        render: (row) => formatAmount(row.balance),
      },
      {
        key: 'createdAt',
        label: 'Oluşturulma',
        cellClass: 'data-table__cell--date',
        searchValue: (row) => formatDateTime(row.createdAt),
        getSortValue: (row) => row.createdAt,
        render: (row) => formatDateTime(row.createdAt),
      },
    ],
    [],
  )

  const openCreate = () => {
    setFormMode('create')
    setEditingRow(null)
    setFormOpen(true)
  }

  const handleEdit = (row: Cari) => {
    setFormMode('edit')
    setEditingRow(row)
    setFormOpen(true)
  }

  const handleDelete = async (row: Cari) => {
    const ok = window.confirm(
      `"${row.productBrand} — ${row.productName}" cari kaydını silmek istediğinize emin misiniz?`,
    )
    if (!ok) return

    try {
      await deleteCari({ id: row.id }).unwrap()
      if ((data?.items.length ?? 0) <= 1 && page > 1) {
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
          : 'Cari kaydı silinemedi.'
      alert(message)
    }
  }

  const handleCreate = async (payload: CariCreateRequest) => {
    await createCari(payload).unwrap()
    setPage(1)
  }

  const handleUpdate = async (payload: CariUpdateRequest) => {
    await updateCari(payload).unwrap()
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
          <h1>Cari</h1>
          <p>Cari kayıtlarını görüntüleyin, ekleyin ve yönetin.</p>
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

      <SimpleDataTable
        data={data?.items ?? []}
        totalCount={data?.totalCount ?? 0}
        page={data?.page ?? page}
        pageSize={data?.pageSize ?? PAGE_SIZE}
        columns={columns}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={(row) => void handleDelete(row)}
        searchPlaceholder="Ürün veya tutar ara..."
      />

      <CariCreateForm
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
