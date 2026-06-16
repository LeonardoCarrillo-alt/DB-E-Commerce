import { cartApi } from '../api/cartApi'
import type { CartItem } from '../store/slices/cartSlice'
import type { CartResponse, CheckoutResponse } from '../api/cartApi'

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
    const { data } = await cartApi.addItem({ productoId: productoId, cantidad, variante })
    return data
  },

  async updateItem(productoId: string, cantidad: number, variante?: string) {
    // Si cantidad ≤ 0, el backend elimina el item automáticamente
    const { data } = await cartApi.updateItem({ productoId: productoId, cantidad, variante })
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
  async procesarCheckout(): Promise<CheckoutResponse> {
    const { data } = await cartApi.procesarCheckout()
    return data
  },

  /**
   * Sincroniza el carrito local (Redux) con el backend.
   * Limpia el carrito del backend y luego agrega cada item local.
   * Debe llamarse antes de procesarCheckout.
   */
  async syncLocalCart(items: CartItem[]): Promise<void> {
    // 1. Limpiar carrito en backend (por si tenía items de sesiones anteriores)
    await cartApi.clearCart()

    // 2. Agregar cada item local al backend
    for (const item of items) {
      await cartApi.addItem({
        productoId: item.productId,
        cantidad: item.cantidad,
      })
    }
  },

  /** Calcula el total localmente desde el estado Redux (sin llamada al backend) */
  calculateTotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
  },
}

export default cartService
