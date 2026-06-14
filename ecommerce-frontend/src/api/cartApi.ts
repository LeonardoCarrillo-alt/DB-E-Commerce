import axiosInstance from './axios'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface CartItemAPI {
  productoId: string
  cantidad: number
  variante?: string
}

export interface CartItemResponse {
  productoId: string
  nombre: string
  precio: number
  cantidad: number
  variante?: string
  subtotal: number
  imagen?: string
}

export interface CartResponse {
  usuarioId?: string
  sessionId?: string
  items: CartItemResponse[]
  subtotal: number
  descuento?: number
  total: number
  codigoPromocion?: string
}

// ─── API ──────────────────────────────────────────────────────────────────────
// Nota: Los headers X-Session-Id y X-Invitado son inyectados automáticamente
// por el interceptor de axios para usuarios invitados.

export const cartApi = {
  /** GET /carrito — obtiene el carrito activo (crea uno si no existe) */
  getCart: () =>
    axiosInstance.get<CartResponse>('/carrito'),

  /** POST /carrito/items — agrega producto validando stock */
  addItem: (item: CartItemAPI) =>
    axiosInstance.post<CartResponse>('/carrito/items', item),

  /** PUT /carrito/items — actualiza cantidad (si cantidad ≤ 0 elimina el item) */
  updateItem: (item: CartItemAPI) =>
    axiosInstance.put<CartResponse>('/carrito/items', item),

  /** DELETE /carrito/items/{productoId} */
  removeItem: (productoId: string) =>
    axiosInstance.delete<CartResponse>(`/carrito/items/${productoId}`),

  /** DELETE /carrito — vacía completamente el carrito */
  clearCart: () =>
    axiosInstance.delete<CartResponse>('/carrito'),

  /** POST /carrito/promocion — aplica código de promoción */
  applyPromocion: (codigoPromocion: string) =>
    axiosInstance.post<CartResponse>('/carrito/promocion', { codigoPromocion }),

  /** DELETE /carrito/promocion — quita el código de promoción */
  removePromocion: () =>
    axiosInstance.delete<CartResponse>('/carrito/promocion'),

  /** GET /carrito/checkout/resumen — resumen validando stock */
  getCheckoutResumen: () =>
    axiosInstance.get<CartResponse>('/carrito/checkout/resumen'),

  /** POST /carrito/checkout/procesar — reserva stock */
  procesarCheckout: () =>
    axiosInstance.post<{ reservaId: string; carritoId: string }>('/carrito/checkout/procesar'),

  /** POST /carrito/migrar?sessionId= — migra carrito de invitado tras login */
  migrarCarrito: (sessionId: string) =>
    axiosInstance.post<CartResponse>(`/carrito/migrar?sessionId=${sessionId}`),
}
