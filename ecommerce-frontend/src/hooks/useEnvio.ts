import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { envioApi, type CreateEnvioPayload } from '../api/envioApi'

export function useEnvioByPedido(pedidoId: string | undefined) {
  return useQuery({
    queryKey: ['envio', pedidoId],
    queryFn: () => envioApi.getByPedido(pedidoId as string).then((res) => res.data),
    enabled: !!pedidoId,
    select: (data) => data.length > 0 ? data[0] : null,
  })
}

export function useCreateEnvio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateEnvioPayload) => envioApi.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['envio'] })
    },
  })
}

export function useUpdateEnvio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEnvioPayload> }) =>
      envioApi.update(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['envio'] })
    },
  })
}
