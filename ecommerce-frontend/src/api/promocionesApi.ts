import axiosInstance from './axios'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Promocion {
  id: string
  nombre: string
  codigo: string
  tipo: 'PORCENTAJE' | 'MONTO_FIJO'
  valor: number
  montoMinimoCompra?: number
  maximoDescuento?: number
  categoriasAplican?: string[]
  fechaInicio: string
  fechaFin: string
  usosMaximos?: number
  usosPorUsuario?: number
  activo: boolean
  apilable: boolean
  prioridad: number
}

export interface AplicarPromocionPayload {
  codigoPromocion: string
  usuarioId: string
  rolUsuario: string
  esPrimeraCompra?: boolean
  carrito: {
    usuarioId: string
    subtotal: number
    cantidadItems: number
    items: {
      productoId: string
      categoria: string
      tiendaId: string
      cantidad: number
      precioUnitario: number
      subtotal: number
    }[]
  }
}

export interface AplicarPromocionResponse {
  descuento: number
  totalFinal: number
  descripcionDescuento: string
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const promocionesApi = {
  /** GET /promociones/vigentes */
  getVigentes: () =>
    axiosInstance.get<Promocion[]>('/promociones/vigentes'),

  /** POST /promociones/aplicar — valida y calcula el descuento */
  aplicar: (payload: AplicarPromocionPayload) =>
    axiosInstance.post<AplicarPromocionResponse>('/promociones/aplicar', payload),

  /** POST /promociones — crear promoción (ADMIN_TIENDA, SUPER_ADMIN) */
  create: (data: Omit<Promocion, 'id'>) =>
    axiosInstance.post<Promocion>('/promociones', data),

  /** DELETE /promociones/{id} */
  delete: (id: string) =>
    axiosInstance.delete(`/promociones/${id}`),
}
