import axiosInstance from './axios'
import { toQueryString } from '../utils/helpers'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ProductAtributos {
  talla?: string
  color?: string
  material?: string
  voltaje?: string
  ram?: string
  dimensiones?: string
  capacidad?: string
  estilo?: string
  [key: string]: unknown
}

export interface Product {
  _id: string
  id?: string
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  tienda_id: string
  atributos: ProductAtributos
  activo: boolean
  imagenes?: string[]
  etiquetas?: string[]
  variantes?: string[]
  marcas?: string[]
  stock?: number
}

export interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  pages: number
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
  atributos?: Record<string, unknown>
  ordenarPor?: string
  ordenDireccion?: 'asc' | 'desc'
  pagina?: number
  limite?: number
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const productApi = {
  /** GET /productos — lista todos los productos activos */
  // getAll: (filters: ProductFilters = {}) =>
  //   axiosInstance.get<ProductsResponse>(`/productos${toQueryString(filters as Record<string, unknown>)}`),

  /** GET /productos — Si devuelve un array directo, típalo así: */
    getAll: (filters: ProductFilters = {}) =>
 
  axiosInstance.get<Product[]>(`/productos${toQueryString(filters as Record<string, unknown>)}`),
  /** GET /productos/{id} */
  getById: (id: string) =>
    axiosInstance.get<Product>(`/productos/${id}`),

  /** POST /productos/buscar — búsqueda simple con filtros dinámicos */
  buscar: (body: ProductSearchBody) =>
    axiosInstance.post<ProductsResponse>('/productos/buscar', body),

  /** POST /productos — crear producto (ADMIN_TIENDA, SUPER_ADMIN) */
  create: (data: Omit<Product, '_id'>) =>
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
    categoria?: string
    precio_min?: number
    precio_max?: number
    pagina?: number
    limite?: number
    ordenar?: string
    dir?: 'asc' | 'desc'
  }) =>
    axiosInstance.get<ProductsResponse>(`/busqueda/productos${toQueryString(params as Record<string, unknown>)}`),

  /** GET /busqueda/autocompletar?q= (mínimo 2 caracteres) */
  autocompletar: (q: string) =>
    axiosInstance.get<string[]>(`/busqueda/autocompletar?q=${encodeURIComponent(q)}`),

  /** GET /busqueda/destacados?categoria= */
  destacados: (categoria?: string) =>
    axiosInstance.get<Product[]>(`/busqueda/destacados${categoria ? `?categoria=${categoria}` : ''}`),

  /** GET /busqueda/relacionados/{productoId} */
  relacionados: (productoId: string) =>
    axiosInstance.get<Product[]>(`/busqueda/relacionados/${productoId}`),
}
