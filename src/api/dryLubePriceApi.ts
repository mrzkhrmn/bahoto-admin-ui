import { baseApi } from './baseApi'
import type {
  DryLubePrice,
  DryLubePriceApplyIncreaseRequest,
  DryLubePriceDeleteRequest,
  DryLubePriceListData,
  DryLubePriceUpdateRequest,
  DryLubePriceUpsertRequest,
  ServicePriceIncreaseResult,
} from '../types/dryLubePrice'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const dryLubePriceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDryLubePriceList: builder.query<DryLubePriceListData, void>({
      query: () => ({
        url: 'api/dry-lube-price/list',
        method: 'POST',
        body: {},
      }),
      transformResponse: (response: ApiResponse<DryLubePriceListData>) =>
        response.data,
      providesTags: ['DryLubePrice'],
    }),
    createDryLubePrice: builder.mutation<DryLubePrice, DryLubePriceUpsertRequest>({
      query: (body) => ({
        url: 'api/dry-lube-price/create',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<DryLubePrice>) => response.data,
      invalidatesTags: ['DryLubePrice'],
    }),
    updateDryLubePrice: builder.mutation<DryLubePrice, DryLubePriceUpdateRequest>({
      query: (body) => ({
        url: 'api/dry-lube-price/update',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<DryLubePrice>) => response.data,
      invalidatesTags: ['DryLubePrice'],
    }),
    deleteDryLubePrice: builder.mutation<void, DryLubePriceDeleteRequest>({
      query: (body) => ({
        url: 'api/dry-lube-price/delete',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['DryLubePrice'],
    }),
    applyDryLubePriceIncrease: builder.mutation<
      ServicePriceIncreaseResult,
      DryLubePriceApplyIncreaseRequest
    >({
      query: (body) => ({
        url: 'api/dry-lube-price/apply-price-increase',
        method: 'POST',
        body,
      }),
      transformResponse: (
        response: ApiResponse<ServicePriceIncreaseResult>,
      ) => response.data,
      invalidatesTags: ['DryLubePrice'],
    }),
  }),
})

export const {
  useGetDryLubePriceListQuery,
  useCreateDryLubePriceMutation,
  useUpdateDryLubePriceMutation,
  useDeleteDryLubePriceMutation,
  useApplyDryLubePriceIncreaseMutation,
} = dryLubePriceApi
