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
  variantes?: Record<string, unknown>[]
  activo: boolean
  // Atributos dinámicos por categoría
  [key: string]: unknown
}

export interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  pages: number
}

export const productApi = {
  getAll: (filters: ProductFilters = {}) =>
    axiosInstance.get<ProductsResponse>(`/products${toQueryString(filters as Record<string, unknown>)}`),

  getById: (id: string) =>
    axiosInstance.get<Product>(`/products/${id}`),

  search: (query: string, filters: Omit<ProductFilters, 'busqueda'> = {}) =>
    axiosInstance.get<ProductsResponse>(`/products/search${toQueryString({ q: query, ...filters } as Record<string, unknown>)}`),

  create: (data: Partial<Product>) =>
    axiosInstance.post<Product>('/products', data),

  update: (id: string, data: Partial<Product>) =>
    axiosInstance.put<Product>(`/products/${id}`, data),

  delete: (id: string) =>
    axiosInstance.delete(`/products/${id}`),

  getByCategory: (categoria: string, filters: ProductFilters = {}) =>
    axiosInstance.get<ProductsResponse>(`/products${toQueryString({ categoria, ...filters } as Record<string, unknown>)}`),
}
