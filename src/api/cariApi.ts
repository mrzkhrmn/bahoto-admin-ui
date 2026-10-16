import { baseApi } from './baseApi'
import type {
  ApiResponse,
  Cari,
  CariCreateRequest,
  CariCreateWithProductRequest,
  CariDeleteBrandRequest,
  CariDeleteItemRequest,
  CariDeleteRequest,
  CariListData,
  CariListRequest,
  CariProductGroup,
  CariUpdateRequest,
} from '../types/cari'

export const cariApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCariList: builder.query<CariListData, CariListRequest>({
      query: (body) => ({
        url: 'api/cari/list',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<CariListData>) => response.data,
      providesTags: ['Cari'],
    }),
    createCari: builder.mutation<Cari, CariCreateRequest>({
      query: (body) => ({
        url: 'api/cari/create',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<Cari>) => response.data,
      invalidatesTags: ['Cari'],
    }),
    createCariWithProduct: builder.mutation<
      CariProductGroup,
      CariCreateWithProductRequest
    >({
      query: (body) => ({
        url: 'api/cari/create-with-product',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<CariProductGroup>) =>
        response.data,
      invalidatesTags: ['Cari'],
    }),
    updateCari: builder.mutation<Cari, CariUpdateRequest>({
      query: (body) => ({
        url: 'api/cari/update',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<Cari>) => response.data,
      invalidatesTags: ['Cari'],
    }),
    deleteCari: builder.mutation<void, CariDeleteRequest>({
      query: (body) => ({
        url: 'api/cari/delete',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cari'],
    }),
    deleteCariItem: builder.mutation<void, CariDeleteItemRequest>({
      query: (body) => ({
        url: 'api/cari/delete-item',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cari'],
    }),
    deleteCariBrand: builder.mutation<void, CariDeleteBrandRequest>({
      query: (body) => ({
        url: 'api/cari/delete-brand',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cari'],
    }),
  }),
})

export const {
  useGetCariListQuery,
  useCreateCariMutation,
  useCreateCariWithProductMutation,
  useUpdateCariMutation,
  useDeleteCariMutation,
  useDeleteCariItemMutation,
  useDeleteCariBrandMutation,
} = cariApi
