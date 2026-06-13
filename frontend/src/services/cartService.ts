import { cartApi, type Cart } from '../api/cartApi'
import type { CartItem } from '../store/slices/cartSlice'

/**
 * Capa de servicio para el carrito.
 * Sincroniza el carrito local (Redux/localStorage) con el backend (MongoDB)
 * usando el UUID del cliente como llave de integración con PostgreSQL.
 */
export const cartService = {
  async getCart(userId: string): Promise<Cart> {
    const { data } = await cartApi.getCart(userId)
    return data
  },

  async addItem(userId: string, item: CartItem) {
    const { data } = await cartApi.addItem(userId, {
      productId: item.productId,
      cantidad: item.cantidad,
    })
    return data
  },

  async updateItem(userId: string, productId: string, cantidad: number) {
    const { data } = await cartApi.updateItem(userId, productId, cantidad)
    return data
  },

  async removeItem(userId: string, productId: string) {
    const { data } = await cartApi.removeItem(userId, productId)
    return data
  },

  async clearCart(userId: string) {
    const { data } = await cartApi.clearCart(userId)
    return data
  },

  /**
   * Sincroniza el carrito local (localStorage) con el carrito remoto del usuario
   * tras iniciar sesión, fusionando ambos sin duplicar productos.
   */
  async syncLocalCartWithRemote(userId: string, localItems: CartItem[]) {
    if (localItems.length === 0) {
      return this.getCart(userId)
    }

    for (const item of localItems) {
      await this.addItem(userId, item)
    }

    localStorage.removeItem('cart_items')
    return this.getCart(userId)
  },

  /** Calcula el total del carrito localmente */
  calculateTotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
  },
}

export default cartService
