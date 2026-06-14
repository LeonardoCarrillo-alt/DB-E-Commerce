import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Order } from '../../api/orderApi'

interface OrderState {
  items: Order[]
  selectedOrder: Order | null
  loading: boolean
  error: string | null
}

const initialState: OrderState = {
  items: [],
  selectedOrder: null,
  loading: false,
  error: null,
}

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders(state, action: PayloadAction<Order[]>) {
      state.items = action.payload
    },
    setSelectedOrder(state, action: PayloadAction<Order | null>) {
      state.selectedOrder = action.payload
    },
    updateOrderStatus(state, action: PayloadAction<{ id: number; estado: Order['estado'] }>) {
      const order = state.items.find((o) => o.id === action.payload.id)
      if (order) order.estado = action.payload.estado
    },
    addOrder(state, action: PayloadAction<Order>) {
      state.items.unshift(action.payload)
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
    },
  },
})

export const { setOrders, setSelectedOrder, updateOrderStatus, addOrder, setLoading, setError } =
  orderSlice.actions
export default orderSlice.reducer
