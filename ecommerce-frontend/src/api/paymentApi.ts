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

export interface MetodoPago {
  id: string
  usuario_id: string
  token_tarjeta: string
  tipo: string
  ultimos_digitos: string
}

export interface CreateMetodoPagoPayload {
  usuario_id: string
  token_tarjeta: string
  tipo: string
  ultimos_digitos: string
}

export const paymentApi = {
  getAll: () =>
    postgresApi.get<MetodoPago[]>('/metodos-pago'),

  getById: (id: string) =>
    postgresApi.get<MetodoPago>(`/metodos-pago/${id}`),

  getByUsuario: (usuarioId: string) =>
    postgresApi.get<MetodoPago[]>(`/metodos-pago/usuario/${usuarioId}`),

  create: (data: CreateMetodoPagoPayload) =>
    postgresApi.post<MetodoPago>('/metodos-pago', data),

  update: (id: string, data: Partial<CreateMetodoPagoPayload>) =>
    postgresApi.put<MetodoPago>(`/metodos-pago/${id}`, data),

  delete: (id: string) =>
    postgresApi.delete(`/metodos-pago/${id}`),
}
