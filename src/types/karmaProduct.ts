export interface KarmaProduct {
  id: string
  brand: string
  name: string
  price: number | null
  lastPriceDate: string | null
  createdAt: string
  updatedAt: string | null
}

export interface KarmaProductListData {
  items: KarmaProduct[]
}

export interface KarmaProductListRequest {
  search?: string | null
}

export interface KarmaProductCreateRequest {
  brand: string
  name: string
  price?: number | null
}

export interface KarmaProductUpdateRequest {
  id: string
  brand: string
  name: string
  price?: number | null
}

export interface KarmaProductDeleteRequest {
  id: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}
