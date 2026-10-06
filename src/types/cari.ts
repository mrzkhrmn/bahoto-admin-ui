export type QuantityUnit = 'Adet' | 'Koli'

export interface Cari {
  id: string
  productId: string
  productBrand: string
  productName: string
  quantity: number
  quantityUnit: QuantityUnit | string
  incomingAmount: number
  paidAmount: number
  balance: number
  createdAt: string
  updatedAt: string | null
}

export interface CariProductGroup {
  productId: string
  brand: string
  name: string
  quantityLabel: string
  incomingAmount: number
  paidAmount: number
  balance: number
  entries: Cari[]
}

export interface CariListRequest {
  page: number
  pageSize: number
  startDate?: string | null
  endDate?: string | null
}

export interface CariListData {
  items: CariProductGroup[]
  page: number
  pageSize: number
  totalCount: number
}

export interface CariCreateRequest {
  productId: string
  quantity: number
  quantityUnit: QuantityUnit
  incomingAmount: number
  paidAmount: number
}

export interface CariCreateWithProductRequest {
  brand: string
  name?: string
  quantity?: number
  quantityUnit?: QuantityUnit
  incomingAmount?: number
  paidAmount?: number
}

export interface CariUpdateRequest {
  id: string
  productId: string
  quantity: number
  quantityUnit: QuantityUnit
  incomingAmount: number
  paidAmount: number
}

export interface CariDeleteRequest {
  id: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}
