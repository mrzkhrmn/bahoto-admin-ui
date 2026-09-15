import { baseApi } from './baseApi'
import type {
  ApiResponse,
  OilChange,
  OilChangeCreateRequest,
  OilChangeDeleteRequest,
  OilChangeListData,
  OilChangeListRequest,
  OilChangeUpdateRequest,
} from '../types/yaglamaServisi'

export const yaglamaServisiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOilChangeList: builder.query<OilChangeListData, OilChangeListRequest>({
      query: (body) => ({
        url: 'api/oilchange/list',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<OilChangeListData>) =>
        response.data,
      providesTags: ['YaglamaServisi'],
    }),
    createOilChange: builder.mutation<OilChange, OilChangeCreateRequest>({
      query: (body) => ({
        url: 'api/oilchange/create',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<OilChange>) => response.data,
      invalidatesTags: ['YaglamaServisi'],
    }),
    updateOilChange: builder.mutation<OilChange, OilChangeUpdateRequest>({
      query: (body) => ({
        url: 'api/oilchange/update',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<OilChange>) => response.data,
      invalidatesTags: ['YaglamaServisi'],
    }),
    deleteOilChange: builder.mutation<void, OilChangeDeleteRequest>({
      query: (body) => ({
        url: 'api/oilchange/delete',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['YaglamaServisi'],
    }),
  }),
})

export const {
  useGetOilChangeListQuery,
  useCreateOilChangeMutation,
  useUpdateOilChangeMutation,
  useDeleteOilChangeMutation,
} = yaglamaServisiApi
