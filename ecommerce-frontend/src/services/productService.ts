import {
  productApi,
  busquedaApi,
  type Product,
  type ProductFilters,
  type ProductSearchBody,
  type AdvancedSearchBody,
} from '../api/productApi'
import type { ProductFormValues } from '../schemas'

/**
 * Servicio de productos.
 * 
 * Endpoints disponibles (según documentación):
 * 
 * 1. GET /productos — Listar TODOS los productos (sin paginación, público)
 * 2. GET /productos/{id} — Obtener producto por ID
 * 3. POST /productos/buscar — Búsqueda SIMPLE (filtros básicos, sin paginación avanzada)
 * 4. POST /busqueda/productos — Búsqueda AVANZADA (paginación, facets, ordenamiento)
 * 5. GET /busqueda/autocompletar — Sugerencias en tiempo real
 * 6. GET /busqueda/destacados — Productos con mejor rating/más vendidos
 * 7. GET /busqueda/relacionados/{productoId} — Recomendaciones por categoría/atributos
 * 8. POST /productos — Crear producto (ADMIN_TIENDA, SUPER_ADMIN)
 * 9. PUT /productos/{id} — Actualizar producto (ADMIN_TIENDA, SUPER_ADMIN, VENDEDOR)
 * 10. DELETE /productos/{id} — Eliminar producto (ADMIN_TIENDA, SUPER_ADMIN)
 */
export const productService = {
  /**
   * Obtiene TODOS los productos activos (sin paginación).
   * Endpoint: GET /productos
   * 
   * ⚠️ NO recomendado para catálogos grandes. Usar busquedaAvanzada() para producción.
   */
  async getAll(filters: ProductFilters = {}): Promise<Product[]> {
    try {
      console.log('📦 Obteniendo todos los productos...')
      const { data } = await productApi.getAll(filters)
      console.log(`✅ ${data.length} productos obtenidos`)
      return data
    } catch (err) {
      console.error('❌ Error al obtener productos:', err)
      throw err
    }
  },

  /**
   * Obtiene un producto específico por ID.
   * Endpoint: GET /productos/{id}
   * 
   * El ID puede ser:
   * - De MongoDB: _id (hexadecimal string, ej: "507f1f77bcf86cd799439011")
   * - De REST: id (si está mapeado en la respuesta)
   */
  async getById(id: string): Promise<Product> {
    if (!id) throw new Error('ID de producto es requerido')

    try {
      console.log(`🔍 Buscando producto por ID: ${id}`)
      const { data } = await productApi.getById(id)
      console.log('✅ Producto encontrado:', data.nombre)
      return data
    } catch (err) {
      console.error(`❌ Error al obtener producto ${id}:`, err)
      throw err
    }
  },

  /**
   * Búsqueda SIMPLE de productos.
   * Endpoint: POST /productos/buscar
   * 
   * Soporta:
   * - Filtros por categoría, precio, tiendaId
   * - Atributos dinámicos (BSON)
   * 
   * ⚠️ SIN paginación avanzada ni facets. Para eso usar busquedaAvanzada().
   */
  async buscar(body: ProductSearchBody): Promise<Product[]> {
    try {
      console.log('🔎 Búsqueda simple de productos:', body)
      const { data } = await productApi.buscar(body)
      console.log(`✅ ${data.length} productos encontrados`)
      return data
    } catch (err) {
      console.error('❌ Error en búsqueda simple:', err)
      throw err
    }
  },

  /**
   * Búsqueda AVANZADA de productos.
   * Endpoint: POST /busqueda/productos
   * 
   * Características:
   * - Paginación completa (página, límite)
   * - Ordenamiento (ordenarPor, ordenDireccion)
   * - Facets/agregaciones (opcional)
   * - Filtros complejos (query text, rango de precios, disponibilidad, etc.)
   * - Retorna { items, total, pagina, totalPaginas }
   * 
   * ⚠️ RECOMENDADO para catálogos grandes y búsquedas en UI.
   */
  async busquedaAvanzada(body: AdvancedSearchBody) {
    try {
      console.log('🔎 Búsqueda avanzada con paginación:', {
        query: body.query,
        pagina: body.pagina,
        limite: body.limite,
        ordenarPor: body.ordenarPor,
      })
      const { data } = await busquedaApi.busquedaAvanzada(body)
      console.log(`✅ Página ${data.pagina}/${data.totalPaginas}, ${data.items.length} items`)
      return data
    } catch (err) {
      console.error('❌ Error en búsqueda avanzada:', err)
      throw err
    }
  },

  /**
   * Autocompletado / Sugerencias en tiempo real.
   * Endpoint: GET /busqueda/autocompletar
   * 
   * Parámetro:
   * - q: string (mínimo 2 caracteres)
   * 
   * Retorna lista de SugerenciaDTO:
   * { texto, tipo, url_redireccion }
   */
  async autocompletar(q: string): Promise<unknown[]> {
    if (q.length < 2) {
      console.log('⚠️ Query muy corto (<2 caracteres), no autocompleta')
      return []
    }

    try {
      console.log(`🔤 Autocompletando: "${q}"`)
      const { data } = await busquedaApi.autocompletar(q)
      console.log(`✅ ${data.length} sugerencias obtenidas`)
      return data
    } catch (err) {
      console.error('❌ Error en autocompletado:', err)
      throw err
    }
  },

  /**
   * Productos destacados / más populares.
   * Endpoint: GET /busqueda/destacados
   * 
   * Parámetros opcionales:
   * - categoria: string
   * - limite: number (defecto 10)
   */
  async getDestacados(categoria?: string, limite: number = 10): Promise<Product[]> {
    try {
      console.log('⭐ Obteniendo productos destacados')
      const { data } = await busquedaApi.destacados(categoria, limite)
      console.log(`✅ ${data.length} productos destacados`)
      return data
    } catch (err) {
      console.error('❌ Error al obtener destacados:', err)
      throw err
    }
  },

  /**
   * Productos relacionados / recomendaciones.
   * Endpoint: GET /busqueda/relacionados/{productoId}
   * 
   * Encuentra productos similares por:
   * - Categoría
   * - Atributos dinámicos (BSON)
   * - Rating/popularidad
   */
  async getRelacionados(
    productoId: string,
    limite: number = 6
  ): Promise<Product[]> {
    if (!productoId) throw new Error('productoId es requerido')

    try {
      console.log(`🔗 Obteniendo productos relacionados de: ${productoId}`)
      const { data } = await busquedaApi.relacionados(productoId, limite)
      console.log(`✅ ${data.length} productos relacionados`)
      return data
    } catch (err) {
      console.error('❌ Error al obtener relacionados:', err)
      throw err
    }
  },

  /**
   * Transforma los datos del formulario al formato esperado por el backend.
   * 
   * El backend espera:
   * - nombre, descripción, precio (requeridos)
   * - categoría, tiendaId
   * - atributos: { ... } (BSON dinámico)
   * - etiquetas: string[]
   * - activo: boolean
   */
  transformFormToDocument(
    values: ProductFormValues,
    extraAttrs: Record<string, unknown> = {},
    tiendaId: string
  ): Omit<Product, '_id'> {
    return {
      nombre: values.nombre,
      descripcion: values.descripcion,
      precio: values.precio,
      categoria: values.categoria,
      tiendaId,
      atributos: extraAttrs as Product['atributos'],
      activo: true,
      etiquetas: values.etiquetas
        ? values.etiquetas
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    }
  },

  /**
   * Crea un nuevo producto.
   * Endpoint: POST /productos
   * Requiere: ADMIN_TIENDA o SUPER_ADMIN
   * 
   * El tiendaId es validado contra el usuario autenticado (solo puede crear en sus tiendas).
   */
  async create(
    values: ProductFormValues,
    extraAttrs: Record<string, unknown>,
    tiendaId: string
  ): Promise<Product> {
    try {
      const document = this.transformFormToDocument(values, extraAttrs, tiendaId)
      console.log('📝 Creando producto:', document.nombre)
      const { data } = await productApi.create(document)
      console.log('✅ Producto creado con ID:', data._id || data.id)
      return data
    } catch (err) {
      console.error('❌ Error al crear producto:', err)
      throw err
    }
  },

  /**
   * Actualiza un producto existente.
   * Endpoint: PUT /productos/{id}
   * Requiere: ADMIN_TIENDA, SUPER_ADMIN o VENDEDOR
   * 
   * El vendedor solo puede actualizar productos de su tienda.
   */
  async update(
    id: string,
    values: ProductFormValues,
    extraAttrs: Record<string, unknown>,
    tiendaId: string
  ): Promise<Product> {
    if (!id) throw new Error('ID de producto es requerido')

    try {
      const document = this.transformFormToDocument(values, extraAttrs, tiendaId)
      console.log(`📝 Actualizando producto ${id}:`, document.nombre)
      const { data } = await productApi.update(id, document)
      console.log(`✅ Producto ${id} actualizado`)
      return data
    } catch (err) {
      console.error(`❌ Error al actualizar producto ${id}:`, err)
      throw err
    }
  },

  /**
   * Elimina un producto.
   * Endpoint: DELETE /productos/{id}
   * Requiere: ADMIN_TIENDA o SUPER_ADMIN
   */
  async delete(id: string): Promise<void> {
    if (!id) throw new Error('ID de producto es requerido')

    try {
      console.log(`🗑️  Eliminando producto ${id}`)
      await productApi.delete(id)
      console.log(`✅ Producto ${id} eliminado`)
    } catch (err) {
      console.error(`❌ Error al eliminar producto ${id}:`, err)
      throw err
    }
  },
}

export default productService