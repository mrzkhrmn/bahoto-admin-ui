export interface OilChange {
  id: string
  vehicle: string
  plate: string
  oilType: string
  kmChanged: number
  nextChangeKm: number | null
  oilFilter: string
  airFilter: string
  fuelFilter: string
  polenFilter: string
  note: string
  employee: string
  createdAt: string
  updatedAt: string | null
}

export interface OilChangeListRequest {
  page: number
  pageSize: number
}

export interface OilChangeListData {
  items: OilChange[]
  page: number
  pageSize: number
  totalCount: number
}

export interface OilChangeCreateRequest {
  vehicle: string
  plate: string
  oilType: string
  kmChanged: number
  nextChangeKm: null
  oilFilter: string
  airFilter: string
  fuelFilter: string
  polenFilter: string
  note: string
  employee: string
}

export interface OilChangeUpdateRequest {
  id: string
  vehicle: string
  plate: string
  oilType: string
  kmChanged: number
  nextChangeKm: number | null
  oilFilter: string
  airFilter: string
  fuelFilter: string
  polenFilter: string
  note: string
  employee: string
}

export interface OilChangeDeleteRequest {
  id: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}
