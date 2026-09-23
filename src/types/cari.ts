export interface Cari {
  id: string
  productId: string
  productBrand: string
  productName: string
  incomingAmount: number
  paidAmount: number
  balance: number
  createdAt: string
  updatedAt: string | null
}

export interface CariListRequest {
  page: number
  pageSize: number
}

export interface CariListData {
  items: Cari[]
  page: number
  pageSize: number
  totalCount: number
}

export interface CariCreateRequest {
  productId: string
  incomingAmount: number
  paidAmount: number
}

export interface CariUpdateRequest {
  id: string
  productId: string
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
