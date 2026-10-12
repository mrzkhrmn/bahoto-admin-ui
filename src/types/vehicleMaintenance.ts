export interface VehicleMaintenance {
  id: string
  brandModel: string
  sortOrder: number
  engineOil: string | null
  airFilter: string | null
  oilFilter: string | null
  polenFilter: string | null
  createdAt: string
  updatedAt: string | null
}

export interface VehicleMaintenanceListData {
  items: VehicleMaintenance[]
}

export interface VehicleMaintenanceUpsertRequest {
  brandModel: string
  engineOil?: string | null
  airFilter?: string | null
  oilFilter?: string | null
  polenFilter?: string | null
}

export interface VehicleMaintenanceUpdateRequest
  extends VehicleMaintenanceUpsertRequest {
  id: string
}

export interface VehicleMaintenanceDeleteRequest {
  id: string
}
