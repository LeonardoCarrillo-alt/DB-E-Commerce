import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { productApi, type ProductFilters, type Product, type ProductsResponse } from '../api/productApi'

export function useProducts(filters: ProductFilters = {}) {
  return useQuery<ProductsResponse>({
    queryKey: ['products', filters],
    queryFn: () => productApi.getAll(filters).then((res) => res.data),
    placeholderData: keepPreviousData,
  })
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getById(id as string).then((res) => res.data),
    enabled: !!id,
  })
}

export function useProductSearch(query: string, filters: Omit<ProductFilters, 'busqueda'> = {}) {
  return useQuery({
    queryKey: ['products', 'search', query, filters],
    queryFn: () => productApi.search(query, filters).then((res) => res.data),
    enabled: query.length > 0,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Product>) => productApi.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      productApi.update(id, data).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
