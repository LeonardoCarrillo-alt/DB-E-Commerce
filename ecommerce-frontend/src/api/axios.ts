import axios from 'axios'
import { API_MONGO_BASE_URL, API_POSTGRES_BASE_URL, STORAGE_KEYS } from '../utils/constants'
import { clearSession, getSessionId } from '../utils/helpers'

// Axios instance for Mongo-backed services (auth, products, cart, promotions, inventario)
const axiosMongo = axios.create({
  baseURL: API_MONGO_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Axios instance for Postgres-backed services (usuarios, pedidos, tiendas)
const axiosPostgres = axios.create({
  baseURL: API_POSTGRES_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Request Interceptor: axiosMongo (auth/session + guest headers) ───────────
axiosMongo.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

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

// ─── Request Interceptor: axiosPostgres (Authorization + session) ────────────
axiosPostgres.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    const sessionId = getSessionId()
    if (sessionId) {
      config.headers['X-Session-Id'] = sessionId
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor: axiosMongo (refresh flow) ──────────────────────────
axiosMongo.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)

      if (refreshToken) {
        try {
          // Use full URL to ensure refresh hits the correct backend
          const { data } = await axios.post(`${API_MONGO_BASE_URL}/auth/refresh`, { refreshToken })
          localStorage.setItem(STORAGE_KEYS.TOKEN, data.token)
          originalRequest.headers.Authorization = `Bearer ${data.token}`
          return axiosMongo(originalRequest)
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

export { axiosMongo, axiosPostgres }
export default axiosMongo
