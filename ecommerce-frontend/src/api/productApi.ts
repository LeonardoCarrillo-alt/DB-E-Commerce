import axiosInstance from './axios'
import { toQueryString } from '../utils/helpers'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ProductAtributos {
  talla?: string
  color?: string
  material?: string
  marca?: string
  voltaje?: string
  ram?: string
  dimensiones?: string
  capacidad?: string
  estilo?: string
  peso?: string
  [key: string]: unknown
}

export interface Product {
  id?: string           // El backend usa "id"
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  tiendaId: string      // camelCase consistente
  atributos?: Record<string, unknown>
  activo?: boolean
  stockDisponible: number // 🌟 AQUÍ ESTÁ: Igual al formato del POST
  disponible?: boolean
}

export interface ProductsResponse {
  items?: Product[]
  products?: Product[]
  total: number
  pagina?: number
  page?: number
  pages?: number
  totalPaginas?: number
}

// Filtros para GET /productos (query params simples)
export interface ProductFilters {
  categoria?: string
  tiendaId?: string
  page?: number
  limit?: number
}

// Body para POST /productos/buscar
export interface ProductSearchBody {
  categoria?: string
  precioMin?: number
  precioMax?: number
  tiendaId?: string
  atributos?: Record<string, unknown>
  busqueda?: string
}

// Body para POST /busqueda/productos (búsqueda avanzada)
export interface AdvancedSearchBody {
  query?: string
  categoria?: string
  precioMin?: number
  precioMax?: number
  tiendaId?: string
  atributos?: Record<string, unknown>
  ordenarPor?: string
  ordenDireccion?: 'asc' | 'desc'
  pagina?: number
  limite?: number
  soloDisponibles?: boolean
  soloConDescuento?: boolean
}

export interface SugerenciaDTO {
  texto: string
  tipo: string
  url_redireccion?: string
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const productApi = {
  /** GET /productos — lista todos los productos activos */
  getAll: (filters: ProductFilters = {}) =>
    axiosInstance.get<Product[]>(`/productos${toQueryString(filters as Record<string, unknown>)}`),

  /** GET /productos/{id} */
  getById: (id: string) =>
    axiosInstance.get<Product>(`/productos/${id}`),

  /** POST /productos/buscar — búsqueda simple con filtros dinámicos */
  buscar: (body: ProductSearchBody) =>
    axiosInstance.post<Product[]>('/productos/buscar', body),

  /** POST /productos — crear producto (ADMIN_TIENDA, SUPER_ADMIN) */
  create: (data: Omit<Product, '_id' | 'id'>) =>
    axiosInstance.post<Product>('/productos', data),

  /** PUT /productos/{id} — actualizar producto */
  update: (id: string, data: Partial<Product>) =>
    axiosInstance.put<Product>(`/productos/${id}`, data),

  /** DELETE /productos/{id} */
  delete: (id: string) =>
    axiosInstance.delete(`/productos/${id}`),
}

// ─── Búsqueda avanzada ────────────────────────────────────────────────────────

export const busquedaApi = {
  /** POST /busqueda/productos — búsqueda avanzada con paginación y facets */
  busquedaAvanzada: (body: AdvancedSearchBody) =>
    axiosInstance.post<ProductsResponse>('/busqueda/productos', body),

  /** GET /busqueda/productos?q=&categoria=&... */
  busquedaSimple: (params: {
    q?: string
    query?: string
    categoria?: string
    precioMin?: number
    precioMax?: number
    pagina?: number
    limite?: number
    ordenarPor?: string
    dir?: 'asc' | 'desc'
  }) =>
    axiosInstance.get<ProductsResponse>(`/busqueda/productos${toQueryString(params as Record<string, unknown>)}`),

  /** GET /busqueda/autocompletar?q= (mínimo 2 caracteres) */
  autocompletar: (q: string) =>
    axiosInstance.get<SugerenciaDTO[]>(`/busqueda/autocompletar?q=${encodeURIComponent(q)}`),

  /** GET /busqueda/destacados?categoria=&limite= */
  destacados: (categoria?: string, limite: number = 10) =>
    axiosInstance.get<Product[]>(
      `/busqueda/destacados${
        categoria || limite !== 10
          ? `?${[categoria ? `categoria=${categoria}` : '', `limite=${limite}`].filter(Boolean).join('&')}`
          : ''
      }`
    ),

  /** GET /busqueda/relacionados/{productoId}?limite= */
  relacionados: (productoId: string, limite: number = 6) =>
    axiosInstance.get<Product[]>(`/busqueda/relacionados/${productoId}?limite=${limite}`),
}
