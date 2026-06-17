import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { direccionApi, type CreateDireccionPayload } from '../api/direccionApi'

export function useDirecciones(usuarioId: string | undefined) {
  return useQuery({
    queryKey: ['direcciones', usuarioId],
    queryFn: () => direccionApi.getByUsuario(usuarioId as string).then((res) => res.data),
    enabled: !!usuarioId,
  })
}

export function useCreateDireccion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateDireccionPayload) => direccionApi.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['direcciones'] })
    },
  })
}

export function useUpdateDireccion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDireccionPayload> }) =>
      direccionApi.update(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['direcciones'] })
    },
  })
}

export function useDeleteDireccion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => direccionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['direcciones'] })
    },
  })
}
