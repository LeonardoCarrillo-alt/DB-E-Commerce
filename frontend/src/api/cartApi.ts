import axiosInstance from './axios'

export interface CartItem {
  productId: string
  nombre: string
  precio: number
  cantidad: number
  imagen?: string
}

export interface Cart {
  userId: string   // UUID del cliente (vincula PostgreSQL ↔ MongoDB)
  items: CartItem[]
  total: number
  updatedAt: string
}

export const cartApi = {
  getCart: (userId: string) =>
    axiosInstance.get<Cart>(`/cart/${userId}`),

  addItem: (userId: string, item: Omit<CartItem, 'nombre' | 'precio' | 'imagen'> & { productId: string; cantidad: number }) =>
    axiosInstance.post<Cart>(`/cart/${userId}/items`, item),

  updateItem: (userId: string, productId: string, cantidad: number) =>
    axiosInstance.put<Cart>(`/cart/${userId}/items/${productId}`, { cantidad }),

  removeItem: (userId: string, productId: string) =>
    axiosInstance.delete<Cart>(`/cart/${userId}/items/${productId}`),

  clearCart: (userId: string) =>
    axiosInstance.delete<Cart>(`/cart/${userId}`),
}
