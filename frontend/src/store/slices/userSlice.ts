import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '../../api/userApi'

interface UserState {
  items: User[]
  selectedUser: User | null
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  items: [],
  selectedUser: null,
  loading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<User[]>) {
      state.items = action.payload
    },
    setSelectedUser(state, action: PayloadAction<User | null>) {
      state.selectedUser = action.payload
    },
    updateUser(state, action: PayloadAction<User>) {
      const idx = state.items.findIndex((u) => u.id === action.payload.id)
      if (idx !== -1) state.items[idx] = action.payload
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
    },
  },
})

export const { setUsers, setSelectedUser, updateUser, setLoading, setError } = userSlice.actions
export default userSlice.reducer
