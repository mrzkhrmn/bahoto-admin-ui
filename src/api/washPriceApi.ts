import { baseApi } from './baseApi'
import type {
  ServicePriceIncreaseResult,
  WashPrice,
  WashPriceApplyIncreaseRequest,
  WashPriceDeleteRequest,
  WashPriceListData,
  WashPriceUpdateRequest,
  WashPriceUpsertRequest,
} from '../types/washPrice'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const washPriceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWashPriceList: builder.query<WashPriceListData, void>({
      query: () => ({
        url: 'api/wash-price/list',
        method: 'POST',
        body: {},
      }),
      transformResponse: (response: ApiResponse<WashPriceListData>) =>
        response.data,
      providesTags: ['WashPrice'],
    }),
    createWashPrice: builder.mutation<WashPrice, WashPriceUpsertRequest>({
      query: (body) => ({
        url: 'api/wash-price/create',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<WashPrice>) => response.data,
      invalidatesTags: ['WashPrice'],
    }),
    updateWashPrice: builder.mutation<WashPrice, WashPriceUpdateRequest>({
      query: (body) => ({
        url: 'api/wash-price/update',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<WashPrice>) => response.data,
      invalidatesTags: ['WashPrice'],
    }),
    deleteWashPrice: builder.mutation<void, WashPriceDeleteRequest>({
      query: (body) => ({
        url: 'api/wash-price/delete',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['WashPrice'],
    }),
    applyWashPriceIncrease: builder.mutation<
      ServicePriceIncreaseResult,
      WashPriceApplyIncreaseRequest
    >({
      query: (body) => ({
        url: 'api/wash-price/apply-price-increase',
        method: 'POST',
        body,
      }),
      transformResponse: (
        response: ApiResponse<ServicePriceIncreaseResult>,
      ) => response.data,
      invalidatesTags: ['WashPrice'],
    }),
  }),
})

export const {
  useGetWashPriceListQuery,
  useCreateWashPriceMutation,
  useUpdateWashPriceMutation,
  useDeleteWashPriceMutation,
  useApplyWashPriceIncreaseMutation,
} = washPriceApi
