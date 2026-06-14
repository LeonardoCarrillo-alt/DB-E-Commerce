import { orderApi, type Order } from '../api/orderApi'
import type { OrderStatus } from '../utils/constants'
import type { CheckoutFormValues } from '../schemas'

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
   * Crea la orden usando el reservaId y carritoId retornados por
   * POST /carrito/checkout/procesar (el stock ya fue reservado).
   */
  async create(
    reservaId: string,
    carritoId: string,
    checkoutData: CheckoutFormValues
  ): Promise<Order> {
    const { data } = await orderApi.create({
      reservaId,
      carritoId,
      direccionEnvio: `${checkoutData.calle}, ${checkoutData.ciudad}, ${checkoutData.departamento}`,
      metodoPago: checkoutData.metodoPago,
    })
    return data
  },

  async updateStatus(id: number, estado: OrderStatus): Promise<Order> {
    const { data } = await orderApi.updateStatus(id, estado)
    return data
  },
}

export default orderService
