export interface Product {
  id: string
  brand: string
  name: string
  createdAt: string
  updatedAt: string | null
}

export interface ProductListRequest {
  page: number
  pageSize: number
}

export interface ProductListData {
  items: Product[]
  page: number
  pageSize: number
  totalCount: number
}

export interface ProductCreateRequest {
  brand: string
  name: string
}

export interface ProductUpdateRequest {
  id: string
  brand: string
  name: string
}

export interface ProductDeleteRequest {
  id: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}
