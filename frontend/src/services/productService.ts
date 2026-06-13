import { productApi, type Product, type ProductFilters } from '../api/productApi'
import type { ProductFormValues } from '../schemas'

/**
 * Capa de servicio para productos.
 * Transforma datos del formulario al formato esperado por MongoDB (BSON dinámico).
 */
export const productService = {
  async getAll(filters: ProductFilters = {}) {
    const { data } = await productApi.getAll(filters)
    return data
  },

  async getById(id: string) {
    const { data } = await productApi.getById(id)
    return data
  },

  async getByCategory(categoria: string, filters: ProductFilters = {}) {
    const { data } = await productApi.getByCategory(categoria, filters)
    return data
  },

  /**
   * Transforma los valores del formulario en el documento que se enviará a MongoDB.
   * Convierte etiquetas CSV en arreglo y aplica atributos dinámicos según categoría.
   */
  transformFormToDocument(values: ProductFormValues, extraAttrs: Record<string, unknown> = {}): Partial<Product> {
    const etiquetas = values.etiquetas
      ? values.etiquetas.split(',').map((tag) => tag.trim()).filter(Boolean)
      : []

    return {
      nombre: values.nombre,
      descripcion: values.descripcion,
      precio: values.precio,
      stock: values.stock,
      categoria: values.categoria,
      marca: values.marca || undefined,
      etiquetas,
      activo: true,
      ...extraAttrs, // atributos específicos: voltaje, tallas, material, etc.
    }
  },

  async create(values: ProductFormValues, extraAttrs?: Record<string, unknown>) {
    const document = this.transformFormToDocument(values, extraAttrs)
    const { data } = await productApi.create(document)
    return data
  },

  async update(id: string, values: ProductFormValues, extraAttrs?: Record<string, unknown>) {
    const document = this.transformFormToDocument(values, extraAttrs)
    const { data } = await productApi.update(id, document)
    return data
  },

  async delete(id: string) {
    await productApi.delete(id)
  },

  /**
   * Construye filtros de consulta avanzados ($gt, $lt, $and, $or)
   * a partir de los criterios seleccionados en la UI.
   */
  buildAdvancedQuery(filters: ProductFilters) {
    const query: Record<string, unknown> = {}

    if (filters.categoria) query.categoria = filters.categoria
    if (filters.marca) query.marca = filters.marca

    if (filters.precioMin !== undefined || filters.precioMax !== undefined) {
      query.precio = {
        ...(filters.precioMin !== undefined && { $gt: filters.precioMin }),
        ...(filters.precioMax !== undefined && { $lt: filters.precioMax }),
      }
    }

    if (filters.etiquetas?.length) {
      // $or: producto contiene cualquiera de las etiquetas seleccionadas
      query.etiquetas = { $in: filters.etiquetas }
    }

    return query
  },
}

export default productService
