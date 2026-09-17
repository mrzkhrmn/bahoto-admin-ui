import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthUser } from '../../types/auth'

const TOKEN_KEY = 'bahoto_token'
const REFRESH_KEY = 'bahoto_refresh_token'
const USER_KEY = 'bahoto_user'
const REMEMBER_KEY = 'bahoto_remember'

function clearAuthKeys(storage: Storage) {
  storage.removeItem(TOKEN_KEY)
  storage.removeItem(REFRESH_KEY)
  storage.removeItem(USER_KEY)
}

function clearAllAuthStorage() {
  clearAuthKeys(localStorage)
  clearAuthKeys(sessionStorage)
  localStorage.removeItem(REMEMBER_KEY)
}

function resolveStorage(): { storage: Storage; rememberMe: boolean } {
  if (localStorage.getItem(REMEMBER_KEY) === '1') {
    return { storage: localStorage, rememberMe: true }
  }

  if (sessionStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(REFRESH_KEY)) {
    return { storage: sessionStorage, rememberMe: false }
  }

  if (localStorage.getItem(TOKEN_KEY) || localStorage.getItem(REFRESH_KEY)) {
    return { storage: localStorage, rememberMe: true }
  }

  return { storage: sessionStorage, rememberMe: false }
}

function loadToken(): string | null {
  return resolveStorage().storage.getItem(TOKEN_KEY)
}

function loadRefreshToken(): string | null {
  return resolveStorage().storage.getItem(REFRESH_KEY)
}

function loadUser(): AuthUser | null {
  const raw = resolveStorage().storage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

function loadRememberMe(): boolean {
  return resolveStorage().rememberMe
}

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: AuthUser | null
  rememberMe: boolean
}

const initialState: AuthState = {
  token: loadToken(),
  refreshToken: loadRefreshToken(),
  user: loadUser(),
  rememberMe: loadRememberMe(),
}

interface SetCredentialsPayload {
  token: string
  refreshToken: string
  user: AuthUser
  rememberMe: boolean
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<SetCredentialsPayload>) {
      const { token, refreshToken, user, rememberMe } = action.payload
      state.token = token
      state.refreshToken = refreshToken
      state.user = user
      state.rememberMe = rememberMe

      clearAllAuthStorage()
      const storage = rememberMe ? localStorage : sessionStorage
      storage.setItem(TOKEN_KEY, token)
      storage.setItem(REFRESH_KEY, refreshToken)
      storage.setItem(USER_KEY, JSON.stringify(user))
      if (rememberMe) {
        localStorage.setItem(REMEMBER_KEY, '1')
      }
    },
    logout(state) {
      state.token = null
      state.refreshToken = null
      state.user = null
      state.rememberMe = false
      clearAllAuthStorage()
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export const authReducer = authSlice.reducer
export const selectToken = (state: { auth: AuthState }) => state.auth.token
export const selectRefreshToken = (state: { auth: AuthState }) =>
  state.auth.refreshToken
export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectRememberMe = (state: { auth: AuthState }) =>
  state.auth.rememberMe
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  Boolean(state.auth.token || state.auth.refreshToken)
