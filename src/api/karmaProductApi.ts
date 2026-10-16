import { baseApi } from './baseApi'
import type {
  ApiResponse,
  KarmaProduct,
  KarmaProductCreateRequest,
  KarmaProductDeleteRequest,
  KarmaProductListData,
  KarmaProductListRequest,
  KarmaProductUpdateRequest,
} from '../types/karmaProduct'

export const karmaProductApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getKarmaProductList: builder.query<
      KarmaProductListData,
      KarmaProductListRequest | void
    >({
      query: (body) => ({
        url: 'api/karma-product/list',
        method: 'POST',
        body: body ?? {},
      }),
      transformResponse: (response: ApiResponse<KarmaProductListData>) =>
        response.data,
      providesTags: ['KarmaProduct'],
    }),
    createKarmaProduct: builder.mutation<KarmaProduct, KarmaProductCreateRequest>({
      query: (body) => ({
        url: 'api/karma-product/create',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<KarmaProduct>) => response.data,
      invalidatesTags: ['KarmaProduct'],
    }),
    updateKarmaProduct: builder.mutation<KarmaProduct, KarmaProductUpdateRequest>({
      query: (body) => ({
        url: 'api/karma-product/update',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<KarmaProduct>) => response.data,
      invalidatesTags: ['KarmaProduct'],
    }),
    deleteKarmaProduct: builder.mutation<void, KarmaProductDeleteRequest>({
      query: (body) => ({
        url: 'api/karma-product/delete',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['KarmaProduct'],
    }),
  }),
})

export const {
  useGetKarmaProductListQuery,
  useCreateKarmaProductMutation,
  useUpdateKarmaProductMutation,
  useDeleteKarmaProductMutation,
} = karmaProductApi
