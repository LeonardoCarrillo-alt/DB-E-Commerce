import axiosInstance from './axios'
import type { OrderStatus } from '../utils/constants'

export interface OrderItem {
  productoId: string
  nombre: string
  precio: number
  cantidad: number
  variante?: string
  subtotal: number
}

export interface Order {
  id: number
  uuid: string
  clienteId: number
  items: OrderItem[]
  subtotal: number
  descuento?: number
  total: number
  estado: OrderStatus
  direccionEnvio: string
  metodoPago: string
  createdAt: string
  updatedAt: string
}

export interface CreateOrderPayload {
  reservaId: string
  carritoId: string
  direccionEnvio: string
  metodoPago: string
}

export const orderApi = {
  getMyOrders: () =>
    axiosInstance.get<Order[]>('/orders/my'),

  getAll: () =>
    axiosInstance.get<Order[]>('/orders'),

  getById: (id: number) =>
    axiosInstance.get<Order>(`/orders/${id}`),

  create: (data: CreateOrderPayload) =>
    axiosInstance.post<Order>('/orders', data),

  updateStatus: (id: number, estado: OrderStatus) =>
    axiosInstance.patch<Order>(`/orders/${id}/status`, { estado }),
}
