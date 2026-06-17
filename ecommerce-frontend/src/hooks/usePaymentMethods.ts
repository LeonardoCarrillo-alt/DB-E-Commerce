import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentApi, type CreateMetodoPagoPayload } from '../api/paymentApi'

export function usePaymentMethods(usuarioId: string | undefined) {
  return useQuery({
    queryKey: ['payment-methods', usuarioId],
    queryFn: () => paymentApi.getByUsuario(usuarioId as string).then((res) => res.data),
    enabled: !!usuarioId,
  })
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateMetodoPagoPayload) => paymentApi.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] })
    },
  })
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => paymentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] })
    },
  })
}
