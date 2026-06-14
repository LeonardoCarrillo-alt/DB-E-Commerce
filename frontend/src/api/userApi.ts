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

// CAMBIO: Todas las rutas mutan de '/users' a '/usuarios'
export const userApi = {
  getAll: () =>
    axiosInstance.get<User[]>('/usuarios'),

  getById: (id: number) =>
    axiosInstance.get<User>(`/usuarios/${id}`),

  updateProfile: (id: number, data: Partial<User>) =>
    axiosInstance.put<User>(`/usuarios/${id}`, data),

  changePassword: (id: number, data: { currentPassword: string; newPassword: string }) =>
    axiosInstance.patch(`/usuarios/${id}/password`, data),

  // CAMBIO: '/users/:id/deactivate' ➔ '/usuarios/:id/desactivar'
  deactivate: (id: number) =>
    axiosInstance.patch(`/usuarios/${id}/desactivar`),
}