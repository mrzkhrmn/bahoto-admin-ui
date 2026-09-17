import { baseApi } from './baseApi'
import type {
  AuthResponse,
  LoginRequest,
  LogoutRequest,
  RefreshRequest,
} from '../types/auth'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: 'api/auth/login',
        method: 'POST',
        body,
      }),
    }),
    refresh: builder.mutation<AuthResponse, RefreshRequest>({
      query: (body) => ({
        url: 'api/auth/refresh',
        method: 'POST',
        body,
      }),
    }),
    logout: builder.mutation<{ success: boolean; message: string }, LogoutRequest>({
      query: (body) => ({
        url: 'api/auth/logout',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
} = authApi
