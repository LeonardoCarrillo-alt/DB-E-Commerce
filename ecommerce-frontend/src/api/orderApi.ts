import axiosInstance from './axios'
import type { OrderStatus } from '../utils/constants'

export interface OrderItem {
  productoId: string
  nombre: string
  precio: number
  cantidad: number
  variante?: string
  subtotal: number
  imagen?: string
}

export interface Order {
  id: number
  uuid?: string
  clienteId: number
  usuarioId?: string
  items: OrderItem[]
  subtotal: number
  descuento?: number
  total: number
  estado: OrderStatus
  direccionEnvio: string
  metodoPago: string
  codigoPromocion?: string
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
  /** GET /pedidos/usuario/me — órdenes del usuario autenticado (RUTA EN ESPAÑOL) */
  getMyOrders: () =>
    axiosInstance.get<Order[]>('/pedido/usuario/me'),

  /** GET /pedidos — todas las órdenes (solo admin) — RUTA EN ESPAÑOL */
  getAll: () =>
    axiosInstance.get<Order[]>('/pedido'),

  /** GET /pedidos/{id} — RUTA EN ESPAÑOL */
  getById: (id: number) =>
    axiosInstance.get<Order>(`/pedido/${id}`),

  /** POST /orders — crear nueva orden (ÚNICA EN INGLÉS, mongo-e-commerce) */
  create: (data: CreateOrderPayload) =>
    axiosInstance.post<Order>('/orders', data),

  /** PATCH /pedidos/{id}/estado — actualizar estado (solo admin) — RUTA EN ESPAÑOL */
  updateStatus: (id: number, estado: OrderStatus) =>
    axiosInstance.patch<Order>(`/pedidos/${id}/estado`, { estado }),
}