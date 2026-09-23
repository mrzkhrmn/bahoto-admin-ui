import { useEffect, useMemo, useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetProductListQuery,
  useUpdateProductMutation,
} from '../api/productApi'
import { useAppDispatch } from '../app/hooks'
import { ProductCreateForm } from '../components/ProductCreateForm'
import {
  SimpleDataTable,
  type SimpleColumn,
} from '../components/SimpleDataTable'
import { setGlobalLoading } from '../features/ui/uiSlice'
import type {
  Product,
  ProductCreateRequest,
  ProductUpdateRequest,
} from '../types/product'
import './YaglamaServisiPage.css'

const PAGE_SIZE = 10

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('tr-TR')
}

export function UrunlerPage() {
  const dispatch = useAppDispatch()
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingRow, setEditingRow] = useState<Product | null>(null)

  const { data, isFetching, isError, error } = useGetProductListQuery({
    page,
    pageSize: PAGE_SIZE,
  })
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation()
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation()
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation()

  useEffect(() => {
    dispatch(
      setGlobalLoading(isFetching || isCreating || isUpdating || isDeleting),
    )
    return () => {
      dispatch(setGlobalLoading(false))
    }
  }, [dispatch, isFetching, isCreating, isUpdating, isDeleting])

  const columns = useMemo<SimpleColumn<Product>[]>(
    () => [
      {
        key: 'brand',
        label: 'Marka',
        searchValue: (row) => row.brand,
        getSortValue: (row) => row.brand,
        render: (row) => row.brand,
      },
      {
        key: 'name',
        label: 'Ürün Adı',
        searchValue: (row) => row.name,
        getSortValue: (row) => row.name,
        render: (row) => row.name,
      },
      {
        key: 'createdAt',
        label: 'Eklenme Tarihi',
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

  const handleEdit = (row: Product) => {
    setFormMode('edit')
    setEditingRow(row)
    setFormOpen(true)
  }

  const handleDelete = async (row: Product) => {
    const ok = window.confirm(
      `"${row.brand} ${row.name}" ürününü silmek istediğinize emin misiniz?`,
    )
    if (!ok) return

    try {
      await deleteProduct({ id: row.id }).unwrap()
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
          : 'Ürün silinemedi.'
      alert(message)
    }
  }

  const handleCreate = async (payload: ProductCreateRequest) => {
    await createProduct(payload).unwrap()
    setPage(1)
  }

  const handleUpdate = async (payload: ProductUpdateRequest) => {
    await updateProduct(payload).unwrap()
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
          <h1>Ürünler</h1>
          <p>Ürün listesini görüntüleyin, ekleyin ve yönetin.</p>
        </div>
        <button
          type="button"
          className="btn btn--primary yaglama-page__add"
          onClick={openCreate}
        >
          <FiPlus aria-hidden />
          Yeni Ürün
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
        searchPlaceholder="Marka veya ürün ara..."
      />

      <ProductCreateForm
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
