export interface LoginRequest {
  email: string
  password: string
  rememberMe: boolean
}

export interface RefreshRequest {
  refreshToken: string
}

export interface LogoutRequest {
  refreshToken: string
}

export interface AuthUser {
  userId: string
  email: string
  fullName: string
}

export interface AuthData extends AuthUser {
  token: string
  refreshToken: string
  expiresIn: number
}

export interface AuthResponse {
  success: boolean
  message: string
  data: AuthData
}

export type LoginResponse = AuthResponse
export type RefreshResponse = AuthResponse
