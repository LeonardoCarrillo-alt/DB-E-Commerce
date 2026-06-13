import { useQuery } from '@tanstack/react-query'
import { authApi } from '../api/authApi'
import { useAuth as useAuthState } from '../store/hooks/useAuth'

/**
 * Hook combinado: estado de Redux + datos frescos del perfil desde el servidor.
 */
export function useAuth() {
  const authState = useAuthState()

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile().then((res) => res.data),
    enabled: authState.isAuthenticated,
    staleTime: 1000 * 60 * 10, // 10 minutos
  })

  return {
    ...authState,
    profile: profileQuery.data,
    profileLoading: profileQuery.isLoading,
  }
}

export default useAuth
