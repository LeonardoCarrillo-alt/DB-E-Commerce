import axiosInstance from './axios'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ReservaItem {
  productoId: string
  variante?: string | null
  cantidad: number
}

export interface ReservaPayload {
  carritoId: string
  usuarioId: string
  items: ReservaItem[]
}

export interface ReservaResponse {
  reservaId: string
  expiraEn: string  // ISO date — expira en 15 min
  items: ReservaItem[]
  total?: number
}

export interface ConfirmarPayload {
  reservaId: string
  orderId: string
  items?: ReservaItem[]
}

export interface ReabastecerPayload {
  productoId: string
  variante?: string | null
  cantidad: number
  motivo?: string
}

export interface StockResponse {
  productoId: string
  variante?: string
  stockDisponible: number
  stockReservado?: number
}

export interface AlertaStock {
  productoId: string
  nombre: string
  stockActual: number
  stockMinimo: number
  nivel: 'BAJO' | 'CRITICO'
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const inventarioApi = {
  /** GET /inventario/stock/{productoId}?variante= */
  getStock: (productoId: string, variante?: string) =>
    axiosInstance.get<StockResponse>(
      `/inventario/stock/${productoId}${variante ? `?variante=${variante}` : ''}`
    ),

  /** POST /inventario/reservar — reserva stock, expira en 15 min */
  reservar: (payload: ReservaPayload) =>
    axiosInstance.post<ReservaResponse>('/inventario/reservar', payload),

  /** POST /inventario/confirmar — convierte reserva en venta definitiva */
  confirmar: (payload: ConfirmarPayload) =>
    axiosInstance.post('/inventario/confirmar', payload),

  /** DELETE /inventario/reservar/{reservaId} — cancela reserva y libera stock */
  cancelarReserva: (reservaId: string, motivo?: string) =>
    axiosInstance.delete(
      `/inventario/reservar/${reservaId}${motivo ? `?motivo=${encodeURIComponent(motivo)}` : ''}`
    ),

  /** POST /inventario/reabastecer — agrega unidades al stock */
  reabastecer: (payload: ReabastecerPayload) =>
    axiosInstance.post('/inventario/reabastecer', payload),

  /** GET /inventario/alertas/{tiendaId} — productos con stock bajo o crítico */
  getAlertas: (tiendaId: string) =>
    axiosInstance.get<AlertaStock[]>(`/inventario/alertas/${tiendaId}`),

  /** POST /inventario/limpiar-expiradas?minutos= */
  limpiarExpiradas: (minutos = 15) =>
    axiosInstance.post(`/inventario/limpiar-expiradas?minutos=${minutos}`),
}
