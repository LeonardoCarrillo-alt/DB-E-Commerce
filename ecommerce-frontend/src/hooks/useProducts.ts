import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { productService } from '../services/productService'
import type { ProductFilters, Product, ProductSearchBody, AdvancedSearchBody, ProductsResponse } from '../api/productApi'
import type { ProductFormValues } from '../schemas'

// ─── Listado básico ───────────────────────────────────────────────────────────

export function useProducts(filters: ProductFilters = {}) {
  return useQuery<Product[]>({
    queryKey: ['products', filters],
    queryFn: () => productService.getAll(filters),
  })
}

export function useProduct(id: string | undefined) {
  return useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => productService.getById(id as string),
    enabled: !!id,
  })
}

// ─── Búsqueda POST /productos/buscar ─────────────────────────────────────────

export function useProductSearch(body: ProductSearchBody, enabled = true) {
  return useQuery<ProductsResponse>({
    queryKey: ['products', 'buscar', body],
    queryFn: () => productService.buscar(body),
    enabled,
    placeholderData: keepPreviousData,
  })
}

// ─── Búsqueda avanzada POST /busqueda/productos ───────────────────────────────

export function useAdvancedSearch(body: AdvancedSearchBody, enabled = true) {
  return useQuery<ProductsResponse>({
    queryKey: ['products', 'advanced', body],
    queryFn: () => productService.busquedaAvanzada(body),
    enabled,
    placeholderData: keepPreviousData,
  })
}

// ─── Autocompletado ───────────────────────────────────────────────────────────

export function useAutocompletar(q: string) {
  return useQuery<string[]>({
    queryKey: ['autocompletar', q],
    queryFn: () => productService.autocompletar(q),
    enabled: q.length >= 2,
    staleTime: 1000 * 30,
  })
}

// ─── Destacados ───────────────────────────────────────────────────────────────

export function useDestacados(categoria?: string) {
  return useQuery<Product[]>({
    queryKey: ['destacados', categoria],
    queryFn: () => productService.getDestacados(categoria),
  })
}

// ─── Relacionados ─────────────────────────────────────────────────────────────

export function useRelacionados(productoId: string | undefined) {
  return useQuery<Product[]>({
    queryKey: ['relacionados', productoId],
    queryFn: () => productService.getRelacionados(productoId as string),
    enabled: !!productoId,
  })
}

// ─── Mutaciones CRUD ─────────────────────────────────────────────────────────

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { values: ProductFormValues; extraAttrs: Record<string, unknown>; tiendaId: string }) =>
      productService.create(data.values, data.extraAttrs, data.tiendaId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { id: string; values: ProductFormValues; extraAttrs: Record<string, unknown>; tiendaId: string }) =>
      productService.update(data.id, data.values, data.extraAttrs, data.tiendaId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', id] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}
