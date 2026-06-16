import { authApi, type LoginPayload, type RegisterPayload } from '../api/authApi'
import { STORAGE_KEYS } from '../utils/constants'
import { clearSession, getSessionId, clearSessionId } from '../utils/helpers'
import { cartApi } from '../api/cartApi'

export const authService = {
  async login(payload: LoginPayload) {
    const { data } = await authApi.login(payload)
    this.persistSession(data.token, data.refreshToken, data.user)

    // Migrar carrito de invitado al usuario autenticado
    const sessionId = getSessionId()
    if (sessionId) {
      try {
        await cartApi.migrarCarrito(sessionId)
        clearSessionId()
      } catch {
        // Si falla la migración no bloqueamos el login
        console.warn('No se pudo migrar el carrito de invitado')
      }
    }

    return data
  },

  async register(payload: RegisterPayload) {
    const { data } = await authApi.register(payload)
    this.persistSession(data.token, data.refreshToken, data.user)
    return data
  },

  async logout() {
    try {
      await authApi.logout()
    } finally {
      clearSession()
    }
  },

  async getMe() {
    const { data } = await authApi.getMe()
    return data
  },

  persistSession(token: string, refreshToken: string, user: unknown) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  },

  getCurrentUser() {
    const stored = localStorage.getItem(STORAGE_KEYS.USER)
    return stored ? JSON.parse(stored) : null
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.TOKEN)
  },

  hasRole(role: string): boolean {
    const user = this.getCurrentUser()
    return user?.rol === role
  },

  isAdmin(): boolean {
    const user = this.getCurrentUser()
    return user?.rol === 'SUPER_ADMIN' || user?.rol === 'ADMIN_TIENDA'
  },
}

export default authService
