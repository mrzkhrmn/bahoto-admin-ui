export interface WashPrice {
  id: string
  brandModel: string
  sortOrder: number
  lastPriceDate: string | null
  cardInteriorExterior: number | null
  cashInteriorExterior: number | null
  cardExterior: number | null
  cashExterior: number | null
  cardUnderWash: number | null
  cashUnderWash: number | null
  cardUnderEngine: number | null
  cashUnderEngine: number | null
  cardUnderOverEngine: number | null
  cashUnderOverEngine: number | null
  cardOverEngine: number | null
  cashOverEngine: number | null
  cardUnderWashEngine: number | null
  cashUnderWashEngine: number | null
  cardFullWash: number | null
  cashFullWash: number | null
  createdAt: string
  updatedAt: string | null
}

export interface WashPriceListData {
  items: WashPrice[]
  tableLastPriceDate: string | null
}

export interface WashPriceUpsertRequest {
  brandModel: string
  cardInteriorExterior?: number | null
  cashInteriorExterior?: number | null
  cardExterior?: number | null
  cashExterior?: number | null
  cardUnderWash?: number | null
  cashUnderWash?: number | null
  cardUnderEngine?: number | null
  cashUnderEngine?: number | null
  cardUnderOverEngine?: number | null
  cashUnderOverEngine?: number | null
  cardOverEngine?: number | null
  cashOverEngine?: number | null
  cardUnderWashEngine?: number | null
  cashUnderWashEngine?: number | null
  cardFullWash?: number | null
  cashFullWash?: number | null
}

export interface WashPriceUpdateRequest extends WashPriceUpsertRequest {
  id: string
}

export interface WashPriceDeleteRequest {
  id: string
}

export type ServicePriceIncreaseScope = 'all' | 'service'

export interface WashPriceApplyIncreaseRequest {
  scope: ServicePriceIncreaseScope
  serviceKey?: string | null
  percent: number
}

export interface ServicePriceIncreaseResult {
  updatedCount: number
  skippedCount: number
}

export const WASH_SERVICE_COLUMNS = [
  { key: 'interiorExterior', label: 'İç-Dış' },
  { key: 'exterior', label: 'Dış' },
  { key: 'underWash', label: 'Alt Yıkama' },
  { key: 'underEngine', label: 'Alttan Motor' },
  { key: 'underOverEngine', label: 'Alttan Üstten Motor' },
  { key: 'overEngine', label: 'Üstten Motor' },
  { key: 'underWashEngine', label: 'Alt Yıkama Motor' },
  { key: 'fullWash', label: 'Komple Yıkama' },
] as const

export type WashServiceKey = (typeof WASH_SERVICE_COLUMNS)[number]['key']
