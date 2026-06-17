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

export interface Envio {
  id: string
  pedido_id: string
  tracking_number: string
  estado: string
  proveedor: string
}

export interface CreateEnvioPayload {
  pedido_id: string
  tracking_number: string
  estado: string
  proveedor: string
}

export const envioApi = {
  getByPedido: (pedidoId: string) =>
    postgresApi.get<Envio[]>(`/envios/pedido/${pedidoId}`),

  create: (data: CreateEnvioPayload) =>
    postgresApi.post<Envio>('/envios', data),

  update: (id: string, data: Partial<CreateEnvioPayload>) =>
    postgresApi.put<Envio>(`/envios/${id}`, data),

  delete: (id: string) =>
    postgresApi.delete(`/envios/${id}`),
}
