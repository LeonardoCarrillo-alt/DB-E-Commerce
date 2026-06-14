import { useQuery } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import { useAuth as useAuthState } from '../store/hooks/useAuth'

export function useAuth() {
  const authState = useAuthState()

  // GET /auth/me para datos frescos del servidor
  const profileQuery = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.getMe().then((res) => res.data),
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
