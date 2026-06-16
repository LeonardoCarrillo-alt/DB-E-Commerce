import { axiosMongo } from './axios'

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
    axiosMongo.get<User[]>('/usuarios'),

  getById: (id: string) =>
    axiosMongo.get<User>(`/usuarios/${id}`),

  updateProfile: (id: string, data: Partial<User>) =>
    axiosMongo.put<User>(`/usuarios/${id}`, data),

  changePassword: (id: string, data: { currentPassword: string; newPassword: string }) =>
    axiosMongo.patch(`/usuarios/${id}/password`, data),

  deactivate: (id: string) =>
    axiosMongo.patch(`/usuarios/${id}/deactivate`),
}
