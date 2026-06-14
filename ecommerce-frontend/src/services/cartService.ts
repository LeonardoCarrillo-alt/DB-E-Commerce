import { cartApi } from '../api/cartApi'
import type { CartItem } from '../store/slices/cartSlice'
import type { CartResponse } from '../api/cartApi'

/**
 * Capa de servicio para el carrito.
 * El backend gestiona el carrito por JWT (autenticado) o X-Session-Id (invitado).
 * La sincronización con PostgreSQL/MongoDB ocurre vía UUID en el backend.
 */
export const cartService = {
  async getCart(): Promise<CartResponse> {
    const { data } = await cartApi.getCart()
    return data
  },

  async addItem(productoId: string, cantidad: number, variante?: string) {
    const { data } = await cartApi.addItem({ productoId, cantidad, variante })
    return data
  },

  async updateItem(productoId: string, cantidad: number, variante?: string) {
    // Si cantidad ≤ 0, el backend elimina el item automáticamente
    const { data } = await cartApi.updateItem({ productoId, cantidad, variante })
    return data
  },

  async removeItem(productoId: string) {
    const { data } = await cartApi.removeItem(productoId)
    return data
  },

  async clearCart() {
    const { data } = await cartApi.clearCart()
    return data
  },

  async applyPromocion(codigo: string) {
    const { data } = await cartApi.applyPromocion(codigo)
    return data
  },

  async removePromocion() {
    const { data } = await cartApi.removePromocion()
    return data
  },

  async getCheckoutResumen() {
    const { data } = await cartApi.getCheckoutResumen()
    return data
  },

  /**
   * Procesa el checkout: reserva el stock de todos los ítems.
   * Retorna reservaId y carritoId necesarios para crear la orden.
   */
  async procesarCheckout() {
    const { data } = await cartApi.procesarCheckout()
    return data
  },

  /** Calcula el total localmente desde el estado Redux (sin llamada al backend) */
  calculateTotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
  },
}

export default cartService
