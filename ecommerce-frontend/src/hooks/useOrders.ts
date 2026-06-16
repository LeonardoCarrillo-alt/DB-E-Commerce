import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderService } from '../services/orderService'
import type { OrderStatus } from '../utils/constants'
import { useAuth } from '../store/hooks/useAuth'
import type { CheckoutFormValues } from '../schemas'

export function useMyOrders() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['orders', 'my', user?.id],
    queryFn: () => orderService.getMyOrders(user!.id),
    enabled: !!user?.id,
  })
}

export function useAllOrders() {
  return useQuery({
    queryKey: ['orders', 'all'],
    queryFn: () => orderService.getAll(),
  })
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getById(id as string),
    enabled: !!id,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { reservaId: string; carritoId: string; checkoutData: CheckoutFormValues; usuarioId: string }) =>
      orderService.create(data.reservaId, data.carritoId, data.checkoutData, data.usuarioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: OrderStatus }) =>
      orderService.updateStatus(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
