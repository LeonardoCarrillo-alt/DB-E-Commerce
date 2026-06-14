import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from '../index'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const useAuth = () => useAppSelector((state) => state.auth)

export const useIsAdmin = () =>
  useAppSelector((state) => {
    const rol = state.auth.user?.rol
    return rol === 'SUPER_ADMIN' || rol === 'ADMIN_TIENDA'
  })

export const useIsSuperAdmin = () =>
  useAppSelector((state) => state.auth.user?.rol === 'SUPER_ADMIN')

export const useCart = () => useAppSelector((state) => state.cart)

export const useCartItemCount = () =>
  useAppSelector((state) => state.cart.items.reduce((sum, i) => sum + i.cantidad, 0))
