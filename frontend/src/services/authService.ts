import { authApi, type LoginPayload, type RegisterPayload } from '../api/authApi'
import { STORAGE_KEYS } from '../utils/constants'
import { clearSession } from '../utils/helpers'

/**
 * Capa de servicio para autenticación.
 * Encapsula lógica de negocio adicional sobre la API cruda.
 */
export const authService = {
  async login(payload: LoginPayload) {
    const { data } = await authApi.login(payload)
    this.persistSession(data.token, data.refreshToken, data.user)
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
}

export default authService
