import { baseApi } from './baseApi'
import type {
  VehicleMaintenance,
  VehicleMaintenanceDeleteRequest,
  VehicleMaintenanceListData,
  VehicleMaintenanceUpdateRequest,
  VehicleMaintenanceUpsertRequest,
} from '../types/vehicleMaintenance'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const vehicleMaintenanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVehicleMaintenanceList: builder.query<VehicleMaintenanceListData, void>({
      query: () => ({
        url: 'api/vehicle-maintenance/list',
        method: 'POST',
        body: {},
      }),
      transformResponse: (response: ApiResponse<VehicleMaintenanceListData>) =>
        response.data,
      providesTags: ['VehicleMaintenance'],
    }),
    createVehicleMaintenance: builder.mutation<
      VehicleMaintenance,
      VehicleMaintenanceUpsertRequest
    >({
      query: (body) => ({
        url: 'api/vehicle-maintenance/create',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<VehicleMaintenance>) =>
        response.data,
      invalidatesTags: ['VehicleMaintenance'],
    }),
    updateVehicleMaintenance: builder.mutation<
      VehicleMaintenance,
      VehicleMaintenanceUpdateRequest
    >({
      query: (body) => ({
        url: 'api/vehicle-maintenance/update',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<VehicleMaintenance>) =>
        response.data,
      invalidatesTags: ['VehicleMaintenance'],
    }),
    deleteVehicleMaintenance: builder.mutation<
      void,
      VehicleMaintenanceDeleteRequest
    >({
      query: (body) => ({
        url: 'api/vehicle-maintenance/delete',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['VehicleMaintenance'],
    }),
  }),
})

export const {
  useGetVehicleMaintenanceListQuery,
  useCreateVehicleMaintenanceMutation,
  useUpdateVehicleMaintenanceMutation,
  useDeleteVehicleMaintenanceMutation,
} = vehicleMaintenanceApi
