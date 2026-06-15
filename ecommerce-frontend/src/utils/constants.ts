// URLs de la API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Roles de usuario
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN_TIENDA: 'ADMIN_TIENDA',
  VENDEDOR: 'VENDEDOR',
  CLIENTE: 'CLIENTE',
} as const

export type UserRole = (typeof ROLES)[keyof typeof ROLES]

// Claves de localStorage
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'auth_user',
  SESSION_ID: 'guest_session_id',
} as const

// Estados de pedidos
export const ORDER_STATUS = {
  PENDING: 'PENDIENTE',
  PAID: 'PAGADO',
  SHIPPED: 'ENVIADO',
  DELIVERED: 'ENTREGADO',
  CANCELLED: 'CANCELADO',
} as const

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

// Colores de estado de pedidos
export const ORDER_STATUS_COLOR: Record<string, 'warning' | 'info' | 'primary' | 'success' | 'error'> = {
  PENDIENTE: 'warning',
  PAGADO: 'info',
  ENVIADO: 'primary',
  ENTREGADO: 'success',
  CANCELADO: 'error',
}

// Categorías de productos
export const CATEGORIES = [
  'ropa',
  'electronica',
  'muebles',
  'adornos',
  'utensilios_cocina',
] as const

export type ProductCategory = (typeof CATEGORIES)[number]

// Labels para mostrar en UI
export const CATEGORY_LABELS: Record<string, string> = {
  ropa: 'Ropa',
  electronica: 'Electrónica',
  muebles: 'Muebles',
  adornos: 'Adornos',
  utensilios_cocina: 'Utensilios de cocina',
}

// Paginación por defecto
export const DEFAULT_PAGE_SIZE = 12

// Métodos de pago
export const PAYMENT_METHODS = [
  { value: 'TARJETA', label: 'Tarjeta de crédito/débito' },
  { value: 'TRANSFERENCIA', label: 'Transferencia bancaria' },
  { value: 'EFECTIVO', label: 'Efectivo contra entrega' },
] as const
