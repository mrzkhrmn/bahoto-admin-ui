import type {
  ServicePriceIncreaseResult,
  ServicePriceIncreaseScope,
} from './washPrice'

export interface DryLubePrice {
  id: string
  brandModel: string
  sortOrder: number
  lastPriceDate: string | null
  cardNormal: number | null
  cashNormal: number | null
  cardWaterless: number | null
  cashWaterless: number | null
  cardUnderWashDryLube: number | null
  cashUnderWashDryLube: number | null
  createdAt: string
  updatedAt: string | null
}

export interface DryLubePriceListData {
  items: DryLubePrice[]
  tableLastPriceDate: string | null
}

export interface DryLubePriceUpsertRequest {
  brandModel: string
  cardNormal?: number | null
  cashNormal?: number | null
  cardWaterless?: number | null
  cashWaterless?: number | null
  cardUnderWashDryLube?: number | null
  cashUnderWashDryLube?: number | null
}

export interface DryLubePriceUpdateRequest extends DryLubePriceUpsertRequest {
  id: string
}

export interface DryLubePriceDeleteRequest {
  id: string
}

export interface DryLubePriceApplyIncreaseRequest {
  scope: ServicePriceIncreaseScope
  serviceKey?: string | null
  percent: number
}

export type { ServicePriceIncreaseResult, ServicePriceIncreaseScope }

export const DRY_LUBE_SERVICE_COLUMNS = [
  { key: 'normal', label: 'Normal' },
  { key: 'waterless', label: 'Susuz' },
  { key: 'underWashDryLube', label: 'Alt Yıkama + Kuru Yağlama' },
] as const

export type DryLubeServiceKey = (typeof DRY_LUBE_SERVICE_COLUMNS)[number]['key']
