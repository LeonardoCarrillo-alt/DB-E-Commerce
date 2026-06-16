import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderApi, type CreateOrderPayload } from '../api/orderApi'
import type { OrderStatus } from '../utils/constants'

export function useMyOrders() {
  return useQuery({
    queryKey: ['orders', 'my'],
    queryFn: () => orderApi.getMyOrders().then((res) => res.data),
  })
}

export function useAllOrders() {
  return useQuery({
    queryKey: ['orders', 'all'],
    queryFn: () => orderApi.getAll().then((res) => res.data),
  })
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getById(id as string).then((res) => res.data),
    enabled: !!id,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateOrderPayload) => orderApi.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: OrderStatus }) =>
      orderApi.updateStatus(id, estado).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
