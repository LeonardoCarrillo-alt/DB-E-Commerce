import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { authApi, type LoginPayload, type RegisterPayload } from '../../api/authApi'
import { STORAGE_KEYS } from '../../utils/constants'
import { clearSession } from '../../utils/helpers'

interface AuthUser {
  id: string
  uuid: string
  nombre: string
  email: string
  rol: 'ADMIN' | 'CLIENTE'
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

// Hidrata desde localStorage al arrancar
const storedUser = localStorage.getItem(STORAGE_KEYS.USER)
const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,
  isAuthenticated: !!storedToken,
  loading: false,
  error: null,
}

// ─── Thunks ───────────────────────────────────────────────────────────────────
export const login = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const { data } = await authApi.login(payload)
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token)
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user))
      return data
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message ?? 'Error al iniciar sesión')
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const { data } = await authApi.register(payload)
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token)
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user))
      return data
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message ?? 'Error al registrarse')
    }
  }
)

// ─── Slice ────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      clearSession()
    },
    clearError(state) {
      state.error = null
    },
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload
      state.isAuthenticated = true
    },
  },
  extraReducers: (builder) => {
    // LOGIN
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
    // REGISTER
    builder
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { logout, clearError, setUser } = authSlice.actions
export default authSlice.reducer
