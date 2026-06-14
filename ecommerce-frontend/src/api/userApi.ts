import axiosInstance from './axios'

export interface User {
  id: number
  uuid: string
  nombre: string
  email: string
  telefono?: string
  rol: 'ADMIN' | 'CLIENTE'
  activo: boolean
  createdAt: string
}

export const userApi = {
  getAll: () =>
    axiosInstance.get<User[]>('/users'),

  getById: (id: number) =>
    axiosInstance.get<User>(`/users/${id}`),

  updateProfile: (id: number, data: Partial<User>) =>
    axiosInstance.put<User>(`/users/${id}`, data),

  changePassword: (id: number, data: { currentPassword: string; newPassword: string }) =>
    axiosInstance.patch(`/users/${id}/password`, data),

  deactivate: (id: number) =>
    axiosInstance.patch(`/users/${id}/deactivate`),
}
