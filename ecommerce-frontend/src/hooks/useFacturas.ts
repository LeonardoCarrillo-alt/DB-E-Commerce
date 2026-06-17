import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { facturaApi, type CreateFacturaPayload, type GenerarFacturaPayload } from '../api/facturaApi'

export function useFacturaByPedido(pedidoId: string | undefined) {
  return useQuery({
    queryKey: ['factura', pedidoId],
    queryFn: () => facturaApi.getByPedido(pedidoId as string).then((res) => res.data),
    enabled: !!pedidoId,
    select: (data) => data.length > 0 ? data[0] : null,
  })
}

export function useCreateFactura() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateFacturaPayload) => facturaApi.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factura'] })
    },
  })
}

export function useUpdateFactura() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateFacturaPayload> }) =>
      facturaApi.update(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factura'] })
    },
  })
}

export function useGenerarFactura() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: GenerarFacturaPayload) => facturaApi.generar(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factura'] })
    },
  })
}

export function useDeleteFactura() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => facturaApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factura'] })
    },
  })
}
