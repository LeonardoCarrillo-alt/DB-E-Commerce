import axiosInstance from './axios'

export interface User {
  id: string
  nombre: string
  email: string
  rol: 'SUPER_ADMIN' | 'ADMIN_TIENDA' | 'VENDEDOR' | 'CLIENTE'
  activo: boolean
  tienda_id?: string
  permisos?: string[]
  fecha_creacion?: string
}

export interface UpdateProfilePayload {
  nombre?: string
  email?: string
  telefono?: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export const userApi = {
  /** GET /usuarios — lista todos los usuarios (solo admin) — RUTA EN ESPAÑOL */
  getAll: () =>
    axiosInstance.get<User[]>('/usuarios'),

  /** GET /usuarios/{id} — RUTA EN ESPAÑOL */
  getById: (id: number) =>
    axiosInstance.get<User>(`/usuarios/${id}`),

  /** PUT /usuarios/{id} — actualizar perfil del usuario — RUTA EN ESPAÑOL */
  updateProfile: (id: number, data: UpdateProfilePayload) =>
    axiosInstance.put<User>(`/usuarios/${id}`, data),

  /** PATCH /usuarios/{id}/password — cambiar contraseña — RUTA EN ESPAÑOL */
  changePassword: (id: number, data: ChangePasswordPayload) =>
    axiosInstance.patch(`/usuarios/${id}/password`, data),

  /** PATCH /usuarios/{id}/deactivar — desactivar cuenta — RUTA EN ESPAÑOL */
  deactivate: (id: number) =>
    axiosInstance.patch(`/usuarios/${id}/deactivar`),

  /** GET /usuarios/{id}/pedidos — órdenes del usuario — RUTA EN ESPAÑOL */
  getUserOrders: (id: number) =>
    axiosInstance.get(`/usuarios/${id}/pedidos`),
}