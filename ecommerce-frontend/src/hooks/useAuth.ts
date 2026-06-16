import { useQuery } from '@tanstack/react-query'
import { authService } from '../services/authService'
import { useAuth as useAuthState } from '../store/hooks/useAuth'

export function useAuth() {
  const authState = useAuthState()

  const profileQuery = useQuery({
    queryKey: ['me'],
    queryFn: () => authService.getMe(),
    enabled: authState.isAuthenticated,
    staleTime: 1000 * 60 * 10,
  })

  return {
    ...authState,
    profile: profileQuery.data,
    profileLoading: profileQuery.isLoading,
  }
}

export default useAuth
