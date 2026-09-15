import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthUser } from '../../types/auth'

const TOKEN_KEY = 'bahoto_token'
const USER_KEY = 'bahoto_user'

function loadToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

function loadUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

interface AuthState {
  token: string | null
  user: AuthUser | null
}

const initialState: AuthState = {
  token: loadToken(),
  user: loadUser(),
}

interface SetCredentialsPayload {
  token: string
  user: AuthUser
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<SetCredentialsPayload>) {
      const { token, user } = action.payload
      state.token = token
      state.user = user
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    },
    logout(state) {
      state.token = null
      state.user = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export const authReducer = authSlice.reducer
export const selectToken = (state: { auth: AuthState }) => state.auth.token
export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  Boolean(state.auth.token)
