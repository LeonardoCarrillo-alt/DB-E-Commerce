import { orderApi, type CreateOrderPayload, type Order } from '../api/orderApi'
import type { OrderStatus } from '../utils/constants'
import type { CartItem } from '../store/slices/cartSlice'
import type { CheckoutFormValues } from '../schemas'

/**
 * Capa de servicio para pedidos.
 * Orquesta la creación de pedidos transaccionales (PostgreSQL: facturación,
 * pagos) a partir del carrito (MongoDB).
 */
export const orderService = {
  async getMyOrders(): Promise<Order[]> {
    const { data } = await orderApi.getMyOrders()
    return data
  },

  async getAll(): Promise<Order[]> {
    const { data } = await orderApi.getAll()
    return data
  },

  async getById(id: number): Promise<Order> {
    const { data } = await orderApi.getById(id)
    return data
  },

  /**
   * Construye el payload de creación de pedido a partir
   * de los ítems del carrito y los datos del formulario de checkout.
   */
  buildOrderPayload(items: CartItem[], checkoutData: CheckoutFormValues): CreateOrderPayload {
    return {
      items: items.map((item) => ({
        productId: item.productId,
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad,
      })),
      direccionEnvio: `${checkoutData.calle}, ${checkoutData.ciudad}, ${checkoutData.departamento}`,
      metodoPago: checkoutData.metodoPago,
    }
  },

  async create(items: CartItem[], checkoutData: CheckoutFormValues): Promise<Order> {
    const payload = this.buildOrderPayload(items, checkoutData)
    const { data } = await orderApi.create(payload)
    return data
  },

  async updateStatus(id: number, estado: OrderStatus): Promise<Order> {
    const { data } = await orderApi.updateStatus(id, estado)
    return data
  },

  /** Calcula el total de un pedido a partir de sus items */
  calculateTotal(items: { precio: number; cantidad: number }[]): number {
    return items.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
  },
}

export default orderService
