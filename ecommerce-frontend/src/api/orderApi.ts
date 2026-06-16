import { axiosPostgres } from './axios'
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
  id: string
  uuid: string
  clienteId: string
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
  reservaId?: string
  carritoId: string
  usuarioId: string
  direccionEnvio: string
  metodoPago: string
}

export const orderApi = {
  getMyOrders: (usuarioId: string) =>
    axiosPostgres.get<Order[]>(`/pedidos/usuario/${usuarioId}`),

  getAll: () =>
    axiosPostgres.get<Order[]>('/pedidos'),

  getById: (id: string) =>
    axiosPostgres.get<Order>(`/pedidos/${id}`),

  create: (data: CreateOrderPayload) =>
    axiosPostgres.post<Order>('/pedidos', data),

  updateStatus: (id: string, estado: OrderStatus) =>
    axiosPostgres.patch<Order>(`/pedidos/${id}/status`, { estado }),
}
