import axiosInstance from './axios'

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

export interface AuthResponse {
  token: string
  refreshToken: string
  user: {
    id: string
    uuid: string
    nombre: string
    email: string
    rol: 'ADMIN' | 'CLIENTE'
  }
}

export const authApi = {
  login: (data: LoginPayload) =>
    axiosInstance.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterPayload) =>
    axiosInstance.post<AuthResponse>('/auth/register', data),

  logout: () =>
    axiosInstance.post('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    axiosInstance.post<{ token: string }>('/auth/refresh', { refreshToken }),

  getProfile: () =>
    axiosInstance.get('/auth/me'),
}
