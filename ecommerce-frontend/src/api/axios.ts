import axios from 'axios'
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants'
import { clearSession, getSessionId } from '../utils/helpers'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

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
    const isGuest = !token
    if (isGuest) {
      config.headers['X-Invitado'] = 'true'
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor ────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
          localStorage.setItem(STORAGE_KEYS.TOKEN, data.token)
          originalRequest.headers.Authorization = `Bearer ${data.token}`
          return axiosInstance(originalRequest)
        } catch {
          clearSession()
          window.location.href = '/login'
        }
      } else {
        clearSession()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
