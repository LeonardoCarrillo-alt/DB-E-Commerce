import axios from 'axios'
import { POSTGRES_API_URL, STORAGE_KEYS } from '../utils/constants'

const postgresApi = axios.create({
  baseURL: POSTGRES_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

postgresApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface Factura {
  id: string
  pedido_id: string
  rfc: string
  xml_url?: string
  pdf_url?: string
}

export interface CreateFacturaPayload {
  pedido_id: string
  rfc: string
  xml_url?: string
  pdf_url?: string
}

export interface GenerarFacturaPayload {
  pedido_id: string
  rfc: string
  razon_social: string
  codigo_postal: string
  regimen_fiscal: string
}

export const facturaApi = {
  getAll: () =>
    postgresApi.get<Factura[]>('/facturas'),

  getById: (id: string) =>
    postgresApi.get<Factura>(`/facturas/${id}`),

  getByPedido: (pedidoId: string) =>
    postgresApi.get<Factura[]>(`/facturas/pedido/${pedidoId}`),

  create: (data: CreateFacturaPayload) =>
    postgresApi.post<Factura>('/facturas', data),

  update: (id: string, data: Partial<CreateFacturaPayload>) =>
    postgresApi.put<Factura>(`/facturas/${id}`, data),

  delete: (id: string) =>
    postgresApi.delete(`/facturas/${id}`),

  generar: (data: GenerarFacturaPayload) =>
    postgresApi.post<Factura>('/facturas/generar', data),
}
