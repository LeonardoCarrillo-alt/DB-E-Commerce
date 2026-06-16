import { productApi, busquedaApi, type Product, type CreateProduct, type ProductFilters, type ProductSearchBody, type AdvancedSearchBody } from '../api/productApi'
import type { ProductFormValues } from '../schemas'

export const productService = {
  async getAll(filters: ProductFilters = {}) {
    const { data } = await productApi.getAll(filters)
    return data
  },

  async getById(id: string) {
    const { data } = await productApi.getById(id)
    return data
  },

  /**
   * Búsqueda simple via POST /productos/buscar
   * Soporta filtros por categoría, precio, tiendaId y atributos dinámicos
   */
  async buscar(body: ProductSearchBody) {
    const { data } = await productApi.buscar(body)
    return data
  },

  /**
   * Búsqueda avanzada via POST /busqueda/productos
   * Incluye paginación, facets y ordenamiento
   */
  async busquedaAvanzada(body: AdvancedSearchBody) {
    const { data } = await busquedaApi.busquedaAvanzada(body)
    return data
  },

  async autocompletar(q: string) {
    if (q.length < 2) return []
    const { data } = await busquedaApi.autocompletar(q)
    return data
  },

  async getDestacados(categoria?: string) {
    const { data } = await busquedaApi.destacados(categoria)
    return data
  },

  async getRelacionados(productoId: string) {
    const { data } = await busquedaApi.relacionados(productoId)
    return data
  },

  /**
   * Transforma el formulario al formato esperado por el backend.
   * El backend espera atributos dinámicos dentro del campo "atributos" (BSON).
   */
  transformFormToDocument(
    values: ProductFormValues,
    extraAttrs: Record<string, unknown> = {},
    tiendaId: string
  ): CreateProduct {
    return {
      nombre: values.nombre,
      descripcion: values.descripcion,
      precio: values.precio,
      categoria: values.categoria,
      tiendaId,
      atributos: extraAttrs as Product['atributos'],
      activo: true,
      etiquetas: values.etiquetas
        ? values.etiquetas.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
    }
  },

  async create(values: ProductFormValues, extraAttrs: Record<string, unknown>, tiendaId: string) {
    const document = this.transformFormToDocument(values, extraAttrs, tiendaId)
    const { data } = await productApi.create(document)
    return data
  },

  async update(id: string, values: ProductFormValues, extraAttrs: Record<string, unknown>, tiendaId: string) {
    const document = this.transformFormToDocument(values, extraAttrs, tiendaId)
    const { data } = await productApi.update(id, document)
    return data
  },

  async delete(id: string) {
    await productApi.delete(id)
  },
}

export default productService
