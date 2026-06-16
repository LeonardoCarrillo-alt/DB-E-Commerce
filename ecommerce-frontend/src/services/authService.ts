import { authApi, type LoginPayload, type RegisterPayload } from '../api/authApi'
import { STORAGE_KEYS } from '../utils/constants'
import { clearSession, getSessionId, clearSessionId } from '../utils/helpers'
import { cartApi } from '../api/cartApi'

/**
 * Servicio de autenticación.
 * 
 * Flujo:
 * 1. POST /auth/login → retorna { token, refreshToken, user }
 * 2. JWT se almacena en localStorage y se envía en Authorization: Bearer
 * 3. Interceptor de Axios detecta 401 y automáticamente llama POST /auth/refresh
 * 4. El refresh token se envía en el body al endpoint /auth/refresh
 */
export const authService = {
  /**
   * Inicia sesión del usuario.
   * 
   * Retorno del backend (AuthResponse):
   * - token: JWT de corta duración para acceder a recursos protegidos
   * - refreshToken: Token de larga duración para renovar el JWT
   * - user: Datos del usuario (id, email, nombre, rol)
   */
  async login(payload: LoginPayload) {
    try {
      const { data } = await authApi.login(payload)
      
      // Persistir tokens y datos del usuario
      this.persistSession(data.token, data.refreshToken, data.user)
      console.log('✅ Login exitoso:', data.user.email)

      // Migrar carrito de invitado al usuario autenticado (si existe)
      const sessionId = getSessionId()
      if (sessionId) {
        try {
          await cartApi.migrarCarrito(sessionId)
          clearSessionId()
          console.log('✅ Carrito de invitado migrado a usuario autenticado')
        } catch (err) {
          // No bloqueamos el login si la migración falla
          console.warn('⚠️ No se pudo migrar el carrito de invitado:', err)
        }
      }

      return data
    } catch (err) {
      console.error('❌ Error en login:', err)
      throw err
    }
  },

  /**
   * Registra un nuevo usuario.
   * 
   * Retorno del backend (AuthResponse):
   * - Mismo formato que login: { token, refreshToken, user }
   */
  async register(payload: RegisterPayload) {
    try {
      const { data } = await authApi.register(payload)
      
      // Auto-persistir sesión tras registro exitoso
      this.persistSession(data.token, data.refreshToken, data.user)
      console.log('✅ Registro exitoso:', data.user.email)

      return data
    } catch (err) {
      console.error('❌ Error en registro:', err)
      throw err
    }
  },

  /**
   * Cierra la sesión del usuario.
   * Limpia tokens y datos almacenados localmente.
   */
  async logout() {
    try {
      // Notificar al backend que se está cerrando sesión
      await authApi.logout()
      console.log('✅ Logout notificado al servidor')
    } catch (err) {
      console.warn('⚠️ Error al notificar logout:', err)
      // No bloqueamos la limpieza local si el backend falla
    } finally {
      // Siempre limpiar la sesión localmente
      clearSession()
      console.log('✅ Sesión local eliminada')
    }
  },

  /**
   * Obtiene los datos del usuario actual desde el servidor.
   * Valida que el JWT siga siendo válido.
   */
  async getMe() {
    try {
      const { data } = await authApi.getMe()
      return data
    } catch (err) {
      console.error('❌ Error al obtener usuario actual:', err)
      throw err
    }
  },

  /**
   * Persiste el token, refreshToken y datos del usuario en localStorage.
   * 
   * ⚠️ CRÍTICO: El interceptor de Axios depende de estas claves exactas.
   */
  persistSession(token: string, refreshToken: string, user: unknown) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
    console.log('✅ Sesión persistida en localStorage')
  },

  /**
   * Obtiene el usuario actual desde localStorage.
   */
  getCurrentUser(): unknown {
    const stored = localStorage.getItem(STORAGE_KEYS.USER)
    return stored ? JSON.parse(stored) : null
  },

  /**
   * Verifica si el usuario está autenticado (JWT presente).
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
    return !!token
  },

  /**
   * Verifica si el usuario tiene un rol específico.
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser() as { rol?: string } | null
    return user?.rol === role
  },

  /**
   * Verifica si el usuario es administrador (SUPER_ADMIN o ADMIN_TIENDA).
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser() as { rol?: string } | null
    return user?.rol === 'SUPER_ADMIN' || user?.rol === 'ADMIN_TIENDA'
  },

  /**
   * Obtiene el token actual desde localStorage.
   * Usado internamente para debug.
   */
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN)
  },

  /**
   * Obtiene el refresh token desde localStorage.
   * Usado por el interceptor de Axios para renovar el JWT.
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  },

  /**
   * Verifica si el JWT está próximo a expirar (método opcional para preemptive refresh).
   * Útil si el JWT contiene el payload decodificado (ej: exp claim).
   */
  isTokenExpiringSoon(expirationBuffer: number = 300000): boolean {
    // expirationBuffer: 5 minutos por defecto
    const token = this.getToken()
    if (!token) return true

    try {
      // Intentar decodificar JWT (naive, no valida firma)
      const parts = token.split('.')
      if (parts.length !== 3) return true

      const decoded = JSON.parse(atob(parts[1]))
      const expiresAt = (decoded.exp ?? 0) * 1000
      const now = Date.now()

      return now + expirationBuffer > expiresAt
    } catch (err) {
      console.warn('⚠️ No se pudo decodificar JWT:', err)
      return false
    }
  },
}

export default authService
