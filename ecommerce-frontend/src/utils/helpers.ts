import { STORAGE_KEYS } from './constants'

/** Obtiene el token JWT almacenado */
export const getToken = (): string | null =>
  localStorage.getItem(STORAGE_KEYS.TOKEN)

/** Limpia toda la sesión del localStorage */
export const clearSession = (): void => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER)
}

/** Obtiene o genera un session ID para carrito de invitado */
export const getSessionId = (): string => {
  let sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID)
  if (!sessionId) {
    sessionId = 'session-' + crypto.randomUUID()
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId)
  }
  return sessionId
}

/** Elimina el session ID de invitado (tras login y migración) */
export const clearSessionId = (): void => {
  localStorage.removeItem(STORAGE_KEYS.SESSION_ID)
}

/** Trunca texto largo con puntos suspensivos */
export const truncateText = (text: string, maxLength: number): string =>
  text.length > maxLength ? `${text.slice(0, maxLength)}...` : text

/** Genera iniciales desde un nombre completo */
export const getInitials = (name: string): string =>
  name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')

/** Convierte un objeto a query string */
export const toQueryString = (params: Record<string, unknown>): string => {
  const filtered = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  )
  return filtered.length ? '?' + new URLSearchParams(filtered as [string, string][]).toString() : ''
}

/** Capitaliza la primera letra */
export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()

/** Genera un color de avatar basado en el nombre */
export const stringToColor = (string: string): string => {
  let hash = 0
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash)
  }
  let color = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    color += ('00' + value.toString(16)).slice(-2)
  }
  return color
}
