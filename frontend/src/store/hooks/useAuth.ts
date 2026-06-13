import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from '../index'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// ─── Auth selectors ────────────────────────────────────────────────────────────
export const useAuth = () => useAppSelector((state) => state.auth)
export const useIsAdmin = () =>
  useAppSelector((state) => state.auth.user?.rol === 'ADMIN')

// ─── Cart selectors ────────────────────────────────────────────────────────────
export const useCart = () => useAppSelector((state) => state.cart)
export const useCartItemCount = () =>
  useAppSelector((state) => state.cart.items.reduce((sum, i) => sum + i.cantidad, 0))
