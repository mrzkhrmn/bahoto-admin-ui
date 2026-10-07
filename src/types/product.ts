export interface Product {
  id: string
  brand: string
  name: string
  price: number | null
  lastPriceDate: string | null
  createdAt: string
  updatedAt: string | null
}

export interface ProductBrandGroup {
  brand: string
  productCount: number
  products: Product[]
}

export interface ProductListRequest {
  page: number
  pageSize: number
  search?: string | null
}

export interface ProductListData {
  items: ProductBrandGroup[]
  page: number
  pageSize: number
  totalCount: number
}

export interface ProductCreateRequest {
  brand: string
  name: string
  price?: number | null
}

export interface ProductUpdateRequest {
  id: string
  brand: string
  name: string
  price?: number | null
}

export interface ProductDeleteRequest {
  id: string
}

export interface ProductDeleteBrandRequest {
  brand: string
}

export interface ProductReorderBrandsRequest {
  brands: string[]
}

export type PriceIncreaseScope = 'all' | 'brand' | 'product'

export interface ProductApplyPriceIncreaseRequest {
  scope: PriceIncreaseScope
  brand?: string | null
  productId?: string | null
  percent: number
}

export interface ProductApplyPriceIncreaseResult {
  updatedCount: number
  skippedCount: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}
