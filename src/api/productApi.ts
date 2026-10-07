import { baseApi } from './baseApi'
import type {
  ApiResponse,
  Product,
  ProductCreateRequest,
  ProductDeleteBrandRequest,
  ProductDeleteRequest,
  ProductListData,
  ProductListRequest,
  ProductApplyPriceIncreaseRequest,
  ProductApplyPriceIncreaseResult,
  ProductReorderBrandsRequest,
  ProductUpdateRequest,
} from '../types/product'

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductList: builder.query<ProductListData, ProductListRequest>({
      query: (body) => ({
        url: 'api/product/list',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<ProductListData>) =>
        response.data,
      providesTags: ['Product'],
    }),
    createProduct: builder.mutation<Product, ProductCreateRequest>({
      query: (body) => ({
        url: 'api/product/create',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<Product>) => response.data,
      invalidatesTags: ['Product', 'Cari'],
    }),
    updateProduct: builder.mutation<Product, ProductUpdateRequest>({
      query: (body) => ({
        url: 'api/product/update',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<Product>) => response.data,
      invalidatesTags: ['Product', 'Cari'],
    }),
    deleteProduct: builder.mutation<void, ProductDeleteRequest>({
      query: (body) => ({
        url: 'api/product/delete',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Product', 'Cari'],
    }),
    deleteBrand: builder.mutation<void, ProductDeleteBrandRequest>({
      query: (body) => ({
        url: 'api/product/delete-brand',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Product', 'Cari'],
    }),
    reorderBrands: builder.mutation<void, ProductReorderBrandsRequest>({
      query: (body) => ({
        url: 'api/product/reorder-brands',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Product'],
    }),
    applyPriceIncrease: builder.mutation<
      ProductApplyPriceIncreaseResult,
      ProductApplyPriceIncreaseRequest
    >({
      query: (body) => ({
        url: 'api/product/apply-price-increase',
        method: 'POST',
        body,
      }),
      transformResponse: (
        response: ApiResponse<ProductApplyPriceIncreaseResult>,
      ) => response.data,
      invalidatesTags: ['Product', 'Cari'],
    }),
  }),
})

export const {
  useGetProductListQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useDeleteBrandMutation,
  useReorderBrandsMutation,
  useApplyPriceIncreaseMutation,
} = productApi
