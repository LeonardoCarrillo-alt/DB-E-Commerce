import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface CartItem {
  productId: string
  nombre: string
  precio: number
  cantidad: number
  imagen?: string
}

interface CartState {
  items: CartItem[]
  total: number
  isOpen: boolean   // controla el drawer del carrito
}

const initialState: CartState = {
  items: JSON.parse(localStorage.getItem('cart_items') ?? '[]'),
  total: 0,
  isOpen: false,
}

const calcTotal = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + item.precio * item.cantidad, 0)

initialState.total = calcTotal(initialState.items)

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find((i) => i.productId === action.payload.productId)
      if (existing) {
        existing.cantidad += action.payload.cantidad
      } else {
        state.items.push(action.payload)
      }
      state.total = calcTotal(state.items)
      localStorage.setItem('cart_items', JSON.stringify(state.items))
    },

    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.productId !== action.payload)
      state.total = calcTotal(state.items)
      localStorage.setItem('cart_items', JSON.stringify(state.items))
    },

    updateQuantity(state, action: PayloadAction<{ productId: string; cantidad: number }>) {
      const item = state.items.find((i) => i.productId === action.payload.productId)
      if (item) {
        item.cantidad = Math.max(1, action.payload.cantidad)
      }
      state.total = calcTotal(state.items)
      localStorage.setItem('cart_items', JSON.stringify(state.items))
    },

    clearCart(state) {
      state.items = []
      state.total = 0
      localStorage.removeItem('cart_items')
    },

    toggleCart(state) {
      state.isOpen = !state.isOpen
    },

    openCart(state) {
      state.isOpen = true
    },

    closeCart(state) {
      state.isOpen = false
    },
  },
})

export const { addItem, removeItem, updateQuantity, clearCart, toggleCart, openCart, closeCart } =
  cartSlice.actions
export default cartSlice.reducer
