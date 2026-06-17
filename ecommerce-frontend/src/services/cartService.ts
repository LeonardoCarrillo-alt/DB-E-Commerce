import { cartApi } from '../api/cartApi'
import type { CartItem } from '../store/slices/cartSlice'
import type { CartResponse, CheckoutResponse } from '../api/cartApi'

/**
 * Capa de servicio para el carrito.
 * 
 * ⚠️ MAPEO CRÍTICO DE ATRIBUTOS:
 * - Backend ESPERA (request): "productoId" (camelCase estricto)
 * - Backend RETORNA (response): items con "productId" (con I mayúscula en JSON)
 * - Redux LOCAL: usa "productoId" para uniformidad interna
 * 
 * El backend gestiona el carrito por JWT (autenticado) o X-Session-Id (invitado).
 * La sincronización con PostgreSQL/MongoDB ocurre vía UUID en el backend.
 */
export const cartService = {
  async getCart(): Promise<CartResponse> {
    const { data } = await cartApi.getCart()
    console.log('=== DEBUG BACKEND: getCart response ===')
    console.log('Items recibidos:', data.items)
    // Los items vienen con productId (I mayúscula) del backend
    return data
  },

  /**
   * Agrega un ítem al carrito.
   * Normaliza tanto product.id como product._id a productoId para el backend.
   */
  // async addItem(
  //   productoId: string,
  //   cantidad: number,
  //   variante?: string
  // ): Promise<CartResponse> {
  //   const authState = JSON.parse(localStorage.getItem('auth_state') || '{}')
  //   const user = authState?.user

  //   const usuarioId = user?.email || user?.id || 'invitado'
  //   const usuarioEmail = user?.email || 'invitado@tienda.com'

  //   // 🔴 CRÍTICO: Backend espera "productoId" (camelCase estricto) en el request
  //   const { data } = await cartApi.addItem({
  //     productoId: productoId, // ← Nombre exacto esperado por AgregarItemDTO
  //     cantidad: cantidad,
  //     variante: variante || '',
  //     usuarioId: usuarioId,
  //     usuarioEmail: usuarioEmail,
  //   })

  //   console.log('✅ Item agregado al backend:', productoId, 'cantidad:', cantidad)
  //   return data
  // },
  addItem: async (productoId: string, cantidad: number, variante?: string) => {
    // 🚨 Forzamos la creación del JSON exacto que espera AgregarItemDTO en Java
    const payload = {
      productoId: productoId, // Aseguramos que se llame 'productoId' y no '_id'
      cantidad: cantidad,
      variante: variante || undefined
    };

    console.log("✈️ Enviando payload al backend:", payload);
    
    // Llamamos a la API enviando el objeto completo en el body del POST
    return await cartApi.addItem(payload);
  },
  /**
   * Actualiza la cantidad de un ítem.
   * Si cantidad ≤ 0, el backend lo elimina automáticamente.
   */
  async updateItem(
    productoId: string,
    cantidad: number,
    variante?: string
  ): Promise<CartResponse> {
    const authState = JSON.parse(localStorage.getItem('auth_state') || '{}')
    const user = authState?.user
    const usuarioId = user?.email || user?.id || 'invitado'
    const usuarioEmail = user?.email || 'invitado@tienda.com'

    const { data } = await cartApi.updateItem({
      productoId: productoId, // ← Nombre exacto esperado
      cantidad: cantidad,
      variante: variante || '',
      usuarioId: usuarioId,
      usuarioEmail: usuarioEmail,
    })

    console.log('✅ Item actualizado en backend:', productoId, 'cantidad:', cantidad)
    return data
  },

  /**
   * Elimina un ítem por ID.
   */
  async removeItem(productoId: string, variante?: string): Promise<CartResponse> {
    const { data } = await cartApi.removeItem(productoId, variante)
    console.log('✅ Item eliminado del backend:', productoId)
    return data
  },

  /**
   * Limpia todo el carrito.
   */
  async clearCart(): Promise<CartResponse> {
    const { data } = await cartApi.clearCart()
    console.log('✅ Carrito limpiado en backend')
    return data
  },

  /**
   * Aplica un código de promoción.
   */
  async applyPromocion(codigo: string): Promise<CartResponse> {
    const { data } = await cartApi.applyPromocion(codigo)
    console.log('✅ Promoción aplicada:', codigo)
    return data
  },

  /**
   * Remueve la promoción activa.
   */
  async removePromocion(): Promise<CartResponse> {
    const { data } = await cartApi.removePromocion()
    console.log('✅ Promoción removida del carrito')
    return data
  },

  /**
   * Obtiene el resumen del carrito para checkout.
   */
  async getCheckoutResumen(): Promise<CartResponse> {
    const { data } = await cartApi.getCheckoutResumen()
    return data
  },

  /**
   * Procesa el checkout: reserva el stock de todos los ítems en el backend.
   * Retorna { reservaId, carritoId } necesarios para crear la orden vía OrderResource.
   * 
   * Este endpoint:
   * 1. Valida stock disponible (InventarioService)
   * 2. Crea reserva temporal (15 min por defecto)
   * 3. Retorna IDs para siguiente paso (crear orden en PostgreSQL)
   */
  async procesarCheckout(): Promise<CheckoutResponse> {
    const { data } = await cartApi.procesarCheckout()
    console.log('✅ Checkout procesado. Reserva ID:', data.reserva_id)
    return data
  },

  /**
   * Sincroniza el carrito local (Redux) con el backend.
   * 
   * Estrategia:
   * 1. Limpia carrito backend (elimina items de sesiones anteriores)
   * 2. Itera items locales y los agrega uno a uno
   * 3. Maneja ambos formatos: product.id (REST/MongoDB) y product._id (MongoDB nativo)
   */
  async syncLocalCart(items: CartItem[]): Promise<void> {
    if (items.length === 0) {
      console.log('[cartService] Carrito local vacío, no hay nada que sincronizar')
      return
    }

    console.log('[cartService] Iniciando sincronización de', items.length, 'items')

    try {
      // 1. Limpiar carrito en backend
      await cartApi.clearCart()
      console.log('[cartService] Carrito backend limpiado')
    } catch (err) {
      console.warn('[cartService] Error al limpiar carrito:', err)
      // No bloqueamos si falla la limpieza
    }

    // 2. Extraer datos de sesión
    const authState = JSON.parse(localStorage.getItem('auth_state') || '{}')
    const user = authState?.user
    const usuarioId = user?.email || user?.id || 'invitado'
    const usuarioEmail = user?.email || 'invitado@tienda.com'

    const errores: string[] = []

    // 3. Agregar cada item
    for (const item of items) {
      // 🔴 CRÍTICO: Soportar ambos formatos (product.id y product._id)
      // Redux almacena con 'productoId' (normalizado internamente)
      const productoId = item.productoId || (item as any).productId

      if (!productoId) {
        const msg = `[cartService] Item saltado — productoId inválido: ${JSON.stringify(item)}`
        console.warn(msg)
        errores.push(msg)
        continue
      }

      try {
        await cartApi.addItem({
          productoId: productoId, // ← Nombre exacto esperado por AgregarItemDTO
          cantidad: item.cantidad,
          variante: (item as any).variante || '',
          usuarioId: usuarioId,
          usuarioEmail: usuarioEmail,
        })
        console.log(`[cartService] ✅ Item sincronizado: ${productoId} x${item.cantidad}`)
      } catch (err) {
        const msg = `[cartService] Error al agregar item ${productoId}: ${(err as Error)?.message}`
        console.error(msg)
        errores.push(msg)
      }
    }

    if (errores.length > 0) {
      console.warn(
        '[cartService] Sincronización completada con',
        errores.length,
        'errores:',
        errores
      )
    } else {
      console.log('[cartService] ✅ Sincronización exitosa de todos los items')
    }
  },

  /**
   * Calcula el total localmente desde el estado Redux (sin llamada al backend).
   */
  calculateTotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
  },
}

export default cartService
