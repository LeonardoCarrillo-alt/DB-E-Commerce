import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '../services/userService'
import type { User } from '../api/userApi'

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
  })
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => userService.updateProfile(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ id, currentPassword, newPassword }: { id: string; currentPassword: string; newPassword: string }) =>
      userService.changePassword(id, currentPassword, newPassword),
  })
}
