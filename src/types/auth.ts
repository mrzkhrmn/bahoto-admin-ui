export interface LoginRequest {
  email: string
  password: string
}

export interface AuthUser {
  userId: string
  email: string
  fullName: string
}

export interface LoginData extends AuthUser {
  token: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data: LoginData
}
