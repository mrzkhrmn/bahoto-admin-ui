import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import type { RootState } from '../app/store'
import { logout, setCredentials } from '../features/auth/authSlice'
import type { AuthResponse } from '../types/auth'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

function getRequestUrl(args: string | FetchArgs): string {
  return typeof args === 'string' ? args : args.url
}

function isAuthAnonymousEndpoint(url: string): boolean {
  return (
    url.includes('api/auth/login') ||
    url.includes('api/auth/refresh') ||
    url.includes('api/auth/register') ||
    url.includes('api/auth/logout')
  )
}

let refreshPromise: Promise<boolean> | null = null

async function tryRefresh(
  api: Parameters<BaseQueryFn>[1],
  extraOptions: Parameters<BaseQueryFn>[2],
): Promise<boolean> {
  const state = api.getState() as RootState
  const refreshToken = state.auth.refreshToken
  if (!refreshToken) {
    return false
  }

  const refreshResult = await rawBaseQuery(
    {
      url: 'api/auth/refresh',
      method: 'POST',
      body: { refreshToken },
    },
    api,
    extraOptions,
  )

  if (refreshResult.error) {
    return false
  }

  const payload = refreshResult.data as AuthResponse | undefined
  if (!payload?.success || !payload.data?.token || !payload.data.refreshToken) {
    return false
  }

  api.dispatch(
    setCredentials({
      token: payload.data.token,
      refreshToken: payload.data.refreshToken,
      user: {
        userId: payload.data.userId,
        email: payload.data.email,
        fullName: payload.data.fullName,
      },
      rememberMe: state.auth.rememberMe,
    }),
  )
  return true
}

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)
  const url = getRequestUrl(args)

  if (result.error?.status !== 401 || isAuthAnonymousEndpoint(url)) {
    return result
  }

  if (!refreshPromise) {
    refreshPromise = tryRefresh(api, extraOptions).finally(() => {
      refreshPromise = null
    })
  }

  const refreshed = await refreshPromise
  if (refreshed) {
    result = await rawBaseQuery(args, api, extraOptions)
    return result
  }

  api.dispatch(logout())
  if (!window.location.pathname.startsWith('/login')) {
    window.location.assign('/login')
  }
  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['YaglamaServisi'],
  endpoints: () => ({}),
})
