import { axiosPostgres } from './axios'

export interface User {
  id: string
  uuid: string
  nombre: string
  email: string
  telefono?: string
  rol: 'SUPER_ADMIN' | 'ADMIN_TIENDA' | 'VENDEDOR' | 'CLIENTE'
  activo: boolean
  createdAt: string
}

export const userApi = {
  getAll: () =>
    axiosPostgres.get<User[]>('/usuarios'),

  getById: (id: string) =>
    axiosPostgres.get<User>(`/usuarios/${id}`),

  updateProfile: (id: string, data: Partial<User>) =>
    axiosPostgres.put<User>(`/usuarios/${id}`, data),

  changePassword: (id: string, data: { currentPassword: string; newPassword: string }) =>
    axiosPostgres.patch(`/usuarios/${id}/password`, data),

  deactivate: (id: string) =>
    axiosPostgres.patch(`/usuarios/${id}/deactivate`),
}
