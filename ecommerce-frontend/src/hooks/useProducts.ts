// src/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { productApi, busquedaApi, type ProductFilters, type Product, type ProductSearchBody, type AdvancedSearchBody, type ProductsResponse } from '../api/productApi'

// ─── Listado básico ───────────────────────────────────────────────────────────

export function useProducts(filters: ProductFilters = {}) {
  return useQuery<Product[]>({
    queryKey: ['products', filters],
    queryFn: () => productApi.getAll(filters).then((res) => res.data),
  })
}

export function useProduct(id: string | undefined) {
  return useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => productApi.getById(id as string).then((res) => res.data),
    // 🚨 EVITA: Llamadas innecesarias si el id no existe o es el string "undefined"
    enabled: !!id && id !== 'undefined', 
  })
}

// ─── Búsqueda POST /productos/buscar ─────────────────────────────────────────

export function useProductSearch(body: ProductSearchBody, enabled = true) {
  return useQuery<ProductsResponse>({
    queryKey: ['products', 'buscar', body],
    queryFn: () => productApi.buscar(body).then((res) => res.data),
    enabled,
    placeholderData: keepPreviousData,
  })
}

// ─── Búsqueda avanzada POST /busqueda/productos ───────────────────────────────

export function useAdvancedSearch(body: AdvancedSearchBody, enabled = true) {
  return useQuery<ProductsResponse>({
    queryKey: ['products', 'advanced', body],
    queryFn: () => busquedaApi.busquedaAvanzada(body).then((res) => res.data),
    enabled,
    placeholderData: keepPreviousData,
  })
}

// ─── Autocompletado ───────────────────────────────────────────────────────────

export function useAutocompletar(q: string) {
  return useQuery<string[]>({
    queryKey: ['autocompletar', q],
    queryFn: () => busquedaApi.autocompletar(q).then((res) => res.data),
    enabled: q.length >= 2,
    staleTime: 1000 * 30,
  })
}

// ─── Destacados ───────────────────────────────────────────────────────────────

export function useDestacados(categoria?: string) {
  return useQuery<Product[]>({
    queryKey: ['destacados', categoria],
    queryFn: () => busquedaApi.destacados(categoria).then((res) => res.data),
  })
}

// ─── Relacionados ─────────────────────────────────────────────────────────────

export function useRelacionados(productoId: string | undefined) {
  return useQuery<Product[]>({
    queryKey: ['relacionados', productoId],
    queryFn: () => busquedaApi.relacionados(productoId as string).then((res) => res.data),
    // 🚨 EVITA: Llamadas si productoId es inválido
    enabled: !!productoId && productoId !== 'undefined',
  })
}

// ─── Mutaciones CRUD ─────────────────────────────────────────────────────────

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Product, '_id'>) => productApi.create(data).then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => {
      // 🚨 CRÍTICO: Bloqueo en la raíz de la mutación por si se cuela un ID corrupto
      if (!id || id === 'undefined') {
        return Promise.reject(new Error('❌ El ID proporcionado para actualizar no es válido.'))
      }
      return productApi.update(id, data).then((res) => res.data)
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', id] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => {
      // 🚨 CRÍTICO: Bloqueo preventivo antes de disparar el DELETE en el servidor
      if (!id || id === 'undefined') {
        return Promise.reject(new Error('❌ El ID proporcionado para eliminar no es válido.'))
      }
      return productApi.delete(id)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}