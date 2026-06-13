import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../store/hooks/useAuth'
import type { UserRole } from '../../utils/constants'

interface Props {
  roles?: UserRole[]
}

export default function ProtectedRoute({ roles }: Props) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && user && !roles.includes(user.rol as UserRole)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
