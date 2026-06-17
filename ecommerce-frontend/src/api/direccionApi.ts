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

export interface Direccion {
  id: string
  usuario_id: string
  calle: string
  ciudad: string
  codigo_postal: string
  pais: string
}

export interface CreateDireccionPayload {
  usuario_id: string
  calle: string
  ciudad: string
  codigo_postal: string
  pais: string
}

export const direccionApi = {
  getAll: () =>
    postgresApi.get<Direccion[]>('/direcciones'),

  getById: (id: string) =>
    postgresApi.get<Direccion>(`/direcciones/${id}`),

  getByUsuario: (usuarioId: string) =>
    postgresApi.get<Direccion[]>(`/direcciones/usuario/${usuarioId}`),

  create: (data: CreateDireccionPayload) =>
    postgresApi.post<Direccion>('/direcciones', data),

  update: (id: string, data: Partial<CreateDireccionPayload>) =>
    postgresApi.put<Direccion>(`/direcciones/${id}`, data),

  delete: (id: string) =>
    postgresApi.delete(`/direcciones/${id}`),
}
