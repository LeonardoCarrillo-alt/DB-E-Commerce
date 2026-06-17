import axios, { type AxiosError } from 'axios'
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants'
import { clearSession, getSessionId } from '../utils/helpers'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Flag para evitar múltiples refresh simultáneos
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: string) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error?: unknown, token: string = '') => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  isRefreshing = false
  failedQueue = []
}

// ─── Request Interceptor ─────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Headers para carrito de invitado
    const sessionId = getSessionId()
    if (sessionId) {
      config.headers['X-Session-Id'] = sessionId
    }

    // const isGuest = !token
    // if (isGuest) {
    //   config.headers['X-Invitado'] = isGuest?'true':'false'
    // }
    const isGuest = !token

    // Enviar explícitamente 'true' o 'false' en formato string para que Java lo parsee limpiamente
    config.headers['X-Invitado'] = isGuest ? 'true' : 'false'

    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor ────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    // Si no es 401 o ya reintentó, rechaza
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Si ya está refrescando, encola la petición
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(axiosInstance(originalRequest))
          },
          reject: (err: unknown) => reject(err),
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)

    if (!refreshToken) {
      processQueue(new Error('No refresh token available'), '')
      clearSession()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    try {
      // Usar instancia sin interceptores para evitar loops infinitos
      const { data } = await axios.post<{ token: string; refreshToken: string }>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken }
      )

      // Actualizar tokens en localStorage
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token)
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken)

      // Procesar cola y reintentar original
      processQueue(undefined, data.token)
      originalRequest.headers.Authorization = `Bearer ${data.token}`
      return axiosInstance(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, '')
      clearSession()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    }
  }
)

export default axiosInstance
