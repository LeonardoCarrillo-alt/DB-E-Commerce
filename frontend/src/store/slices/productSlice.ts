import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Product, ProductFilters } from '../../api/productApi'

interface ProductState {
  items: Product[]
  selectedProduct: Product | null
  filters: ProductFilters
  total: number
  page: number
  loading: boolean
  error: string | null
}

const initialState: ProductState = {
  items: [],
  selectedProduct: null,
  filters: { page: 1, limit: 12 },
  total: 0,
  page: 1,
  loading: false,
  error: null,
}

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts(state, action: PayloadAction<{ products: Product[]; total: number; page: number }>) {
      state.items = action.payload.products
      state.total = action.payload.total
      state.page = action.payload.page
    },
    setSelectedProduct(state, action: PayloadAction<Product | null>) {
      state.selectedProduct = action.payload
    },
    setFilters(state, action: PayloadAction<Partial<ProductFilters>>) {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters(state) {
      state.filters = { page: 1, limit: 12 }
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
    },
  },
})

export const { setProducts, setSelectedProduct, setFilters, resetFilters, setLoading, setError } =
  productSlice.actions
export default productSlice.reducer
