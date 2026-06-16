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
    console.log("=== DEBUG BACKEND: getCart ===")
    console.log(data)
    return data
    
  },

  async addItem(productoId: string, cantidad: number, variante?: string) {
    // 🚨 Extraemos los datos del usuario logueado del almacenamiento local (ajustar según tu auth)
    const authState = JSON.parse(localStorage.getItem('auth_state') || '{}')
    const user = authState?.user

    // Si no está autenticado, enviamos valores genéricos (el interceptor de axios mandará el X-Session-Id de invitado)
    const usuarioId = user?.email || user?.id || 'invitado'
    const usuarioEmail = user?.email || 'invitado@tienda.com'

    // Construimos el JSON estructurado exactamente en camelCase como lo requiere el DTO del backend
    const { data } = await cartApi.addItem({ 
      productoId: productoId, 
      cantidad: cantidad, 
      variante: variante || '',
      usuarioId: usuarioId,
      usuarioEmail: usuarioEmail
    })
    return data
  },

  async updateItem(productoId: string, cantidad: number, variante?: string) {
    const authState = JSON.parse(localStorage.getItem('auth_state') || '{}')
    const user = authState?.user
    const usuarioId = user?.email || user?.id || 'invitado'
    const usuarioEmail = user?.email || 'invitado@tienda.com'

    // Si cantidad ≤ 0, el backend elimina el item automáticamente
    const { data } = await cartApi.updateItem({ 
      productoId: productoId, 
      cantidad: cantidad, 
      variante: variante || '',
      usuarioId: usuarioId,
      usuarioEmail: usuarioEmail
    })
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
    if (items.length === 0) return

    // 1. Limpiar carrito en backend (por si tenía items de sesiones anteriores)
    await cartApi.clearCart()

    // 2. Extraer datos de sesión para armar la petición masiva de ítems
    const authState = JSON.parse(localStorage.getItem('auth_state') || '{}')
    const user = authState?.user
    const usuarioId = user?.email || user?.id || 'invitado'
    const usuarioEmail = user?.email || 'invitado@tienda.com'

    const errores: string[] = []
    for (const item of items) {
      // Damos soporte seguro a ambas propiedades por si quedan rastros del viejo productId
      const productoId = item.productoId || (item as any).productId

      if (!productoId) {
        const msg = `[cartService] item saltado — productoId inválido: ${JSON.stringify(item)}`
        console.warn(msg)
        errores.push(msg)
        continue
      }
      try {
        await cartApi.addItem({
          productoId: productoId,
          cantidad: item.cantidad,
          variante: (item as any).variante || '',
          usuarioId: usuarioId,
          usuarioEmail: usuarioEmail
        })
      } catch (err) {
        const msg = `[cartService] error al agregar item ${productoId}: ${(err as Error)?.message}`
        console.error(msg)
        errores.push(msg)
      }
    }

    if (errores.length > 0) {
      console.warn('[cartService] syncLocalCart completado con errores:', errores)
    }
  },

  /** Calcula el total localmente desde el estado Redux (sin llamada al backend) */
  calculateTotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
  },
}

export default cartService