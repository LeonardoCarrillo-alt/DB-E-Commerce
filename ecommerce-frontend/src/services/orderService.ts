import { orderApi, type Order } from '../api/orderApi'
import type { OrderStatus } from '../utils/constants'
import type { CheckoutFormValues } from '../schemas'

/**
 * Servicio de órdenes.
 * 
 * Flujo de creación de orden:
 * 1. Usuario llena carrito (Redux local + sincronizado con backend)
 * 2. Usuario procesa checkout: POST /carrito/checkout/procesar
 *    → Backend retorna { reservaId, carritoId }
 * 3. Usuario va a formulario de pago
 * 4. Tras pago exitoso, llamar orderService.create(reservaId, carritoId, ...)
 *    → Backend crea orden en PostgreSQL usando CreateOrderRequestDTO
 *    → Backend confirma la reserva de stock (inventarioService.confirmarCompra)
 *    → Retorna Order con id, total, estado, items
 */
export const orderService = {
  /**
   * Obtiene todas las órdenes del usuario autenticado.
   */
  async getMyOrders(): Promise<Order[]> {
    try {
      const { data } = await orderApi.getMyOrders()
      console.log(`✅ Obtenidas ${data.length} órdenes del usuario`)
      return data
    } catch (err) {
      console.error('❌ Error al obtener órdenes del usuario:', err)
      throw err
    }
  },

  /**
   * Obtiene TODAS las órdenes (solo para admins).
   */
  async getAll(): Promise<Order[]> {
    try {
      const { data } = await orderApi.getAll()
      console.log(`✅ Obtenidas ${data.length} órdenes totales`)
      return data
    } catch (err) {
      console.error('❌ Error al obtener todas las órdenes:', err)
      throw err
    }
  },

  /**
   * Obtiene una orden específica por ID.
   */
   async getById(id: string): Promise<Order> {
    try {
      const { data } = await orderApi.getById(id)
      console.log(`✅ Orden ${id} obtenida:`, data.estado)
      return data
    } catch (err) {
      console.error(`❌ Error al obtener orden ${id}:`, err)
      throw err
    }
  },

  /**
   * Crea una nueva orden de compra.
   * 
   * Este endpoint:
   * 1. Toma el carritoId (de MongoDB, contiene los items)
   * 2. Toma el reservaId (de inventario, valida que el stock existe)
   * 3. Crea el documento de Order en PostgreSQL
   * 4. Confirma la compra (libera la reserva temporal y decrementa stock)
   * 5. Retorna { id, total, estado, items } de la orden creada
   * 
   * Backend espera CreateOrderRequestDTO:
   * {
   *   reservaId: string,        // ID de la reserva temporal (InventarioResource)
   *   carritoId: string,        // ID del carrito (MongoDB o PostgreSQL según config)
   *   direccionEnvio?: string,  // Dirección completa de envío
   *   metodoPago?: string       // Método de pago usado
   * }
   */
  async create(
    reservaId: string,
    carritoId: string,
    checkoutData: CheckoutFormValues
  ): Promise<Order> {
    if (!reservaId || !carritoId) {
      throw new Error(
        'reservaId y carritoId son requeridos para crear una orden'
      )
    }

    try {
      // Construir dirección completa (ajustar según tu estructura de CheckoutFormValues)
      const direccionEnvio = [
        checkoutData.calle,
        checkoutData.ciudad,
        checkoutData.departamento,
        checkoutData.codigoPostal, // Opcional
      ]
        .filter(Boolean)
        .join(', ')

      console.log('📋 Creando orden con:')
      console.log('  - reservaId:', reservaId)
      console.log('  - carritoId:', carritoId)
      console.log('  - direccionEnvio:', direccionEnvio)
      console.log('  - metodoPago:', checkoutData.metodoPago)

      const { data } = await orderApi.create({
        reservaId,
        carritoId,
        direccionEnvio,
        metodoPago: checkoutData.metodoPago,
      })

      console.log('✅ Orden creada exitosamente:', data.id)
      console.log('   Estado:', data.estado)
      console.log('   Total:', data.total)
      console.log('   Items:', data.items?.length)

      return data
    } catch (err) {
      console.error('❌ Error al crear orden:', err)
      throw err
    }
  },

  /**
   * Actualiza el estado de una orden (solo admins).
   * 
   * Estados válidos: PENDIENTE, PROCESANDO, ENVIADO, ENTREGADO, CANCELADO
   */
  async updateStatus(id: string, estado: OrderStatus): Promise<Order> {
    if (!id || !estado) {
      throw new Error('id y estado son requeridos')
    }

    try {
      console.log(`📝 Actualizando estado de orden ${id} a:`, estado)
      const { data } = await orderApi.updateStatus(id, estado)
      console.log(`✅ Estado actualizado:`, data.estado)
      return data
    } catch (err) {
      console.error(`❌ Error al actualizar orden ${id}:`, err)
      throw err
    }
  },

  /**
   * Cancela una orden (si está en estado PENDIENTE).
   * Libera la reserva de stock.
   */
  async cancel(id: string): Promise<Order> {
    try {
      console.log(`🚫 Cancelando orden ${id}`)
      return await this.updateStatus(id, 'CANCELADO' as OrderStatus)
    } catch (err) {
      console.error(`❌ Error al cancelar orden ${id}:`, err)
      throw err
    }
  },
}

export default orderService
