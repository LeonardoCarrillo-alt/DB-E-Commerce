import axiosInstance from './axios'
import { toQueryString } from '../utils/helpers'

export interface ProductFilters {
  categoria?: string
  marca?: string
  precioMin?: number
  precioMax?: number
  busqueda?: string
  etiquetas?: string[]
  page?: number
  limit?: number
}

export interface Product {
  _id: string
  nombre: string
  descripcion: string
  precio: number
  stock: number
  categoria: string
  marca?: string
  imagenes: string[]
  etiquetas: string[]
  activo: boolean
  [key: string]: unknown
}

export interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  pages: number
}

export const productApi = {
  // CAMBIO: '/products' ➔ '/productos'
  getAll: (filters: ProductFilters = {}) =>
    axiosInstance.get<ProductsResponse>(`/productos${toQueryString(filters as Record<string, unknown>)}`),

  // CAMBIO: '/products/:id' ➔ '/productos/:id'
  getById: (id: string) =>
    axiosInstance.get<Product>(`/productos/${id}`),

  // CAMBIO: '/products/search' ➔ '/busqueda' (Resource independiente de búsqueda)
  search: (query: string, filters: Omit<ProductFilters, 'busqueda'> = {}) =>
    axiosInstance.get<ProductsResponse>(`/busqueda${toQueryString({ q: query, ...filters } as Record<string, unknown>)}`),

  // CAMBIO: CRUD a '/productos'
  create: (data: Partial<Product>) =>
    axiosInstance.post<Product>('/productos', data),

  update: (id: string, data: Partial<Product>) =>
    axiosInstance.put<Product>(`/productos/${id}`, data),

  delete: (id: string) =>
    axiosInstance.delete(`/productos/${id}`),

  // CAMBIO: '/products?categoria=...' ➔ '/productos/categoria/:categoria'
  getByCategory: (categoria: string, filters: ProductFilters = {}) =>
    axiosInstance.get<ProductsResponse>(`/productos/categoria/${categoria}${toQueryString(filters as Record<string, unknown>)}`),
}