import axiosInstance from './axios'
import type { OrderStatus } from '../utils/constants'

export interface Order {
  id: string
  usuarioId: string
  total: number
  estado: OrderStatus
  fecha_creacion: string
}

export interface CreateOrderPayload {
  reservaId: string
  carritoId: string
  direccionEnvio: string
  metodoPago: string
}

export const orderApi = {
  getMyOrders: () =>
    axiosInstance.get<Order[]>('/pedidos/usuario/me'),

  getAll: () =>
    axiosInstance.get<Order[]>('/pedidos'),

  getById: (id: string) =>
    axiosInstance.get<Order>(`/pedidos/${id}`),

  create: (data: CreateOrderPayload) =>
    axiosInstance.post<Order>('/pedidos', data),

  updateStatus: (id: string, estado: OrderStatus) =>
    axiosInstance.put<Order>(`/pedidos/${id}/estado`, { estado }),
}