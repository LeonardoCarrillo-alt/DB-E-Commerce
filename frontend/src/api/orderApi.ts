import axiosInstance from './axios'
import type { OrderStatus } from '../utils/constants'

export interface OrderItem {
  productId: string
  nombre: string
  precio: number
  cantidad: number
}

export interface Order {
  id: number
  uuid: string
  clienteId: number
  items: OrderItem[]
  total: number
  estado: OrderStatus
  direccionEnvio: string
  metodoPago: string
  createdAt: string
  updatedAt: string
}

export interface CreateOrderPayload {
  items: OrderItem[]
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
