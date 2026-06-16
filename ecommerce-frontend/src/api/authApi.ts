import { axiosMongo } from './axios'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  nombre: string
  email: string
  password: string
  telefono?: string
}

export interface AuthUser {
  id: string
  uuid: string
  nombre: string
  email: string
  rol: 'SUPER_ADMIN' | 'ADMIN_TIENDA' | 'VENDEDOR' | 'CLIENTE'
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: AuthUser
}

export const authApi = {
  /** POST /auth/login */
  login: (data: LoginPayload) =>
    axiosMongo.post<AuthResponse>('/auth/login', data),

  /** POST /auth/register */
  register: (data: RegisterPayload) =>
    axiosMongo.post<AuthResponse>('/auth/register', data),

  /** POST /auth/refresh */
  refreshToken: (refreshToken: string) =>
    axiosMongo.post<{ token: string }>('/auth/refresh', { refreshToken }),

  /** POST /auth/logout — requiere Authorization header */
  logout: () =>
    axiosMongo.post('/auth/logout'),

  /** GET /auth/me — retorna el usuario desde el JWT */
  getMe: () =>
    axiosMongo.get<AuthUser>('/auth/me'),
}
