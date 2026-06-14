import axiosInstance from './axios'

export interface CartItem {
  productId: string
  nombre: string
  precio: number
  cantidad: number
  imagen?: string
}

export interface Cart {
  userId: string   
  items: CartItem[]
  total: number
  updatedAt: string
}

// CAMBIO: Rutas cambiadas de '/cart' a '/carrito' y sufijos en español según CarritoResource
export const cartApi = {
  getCart: (userId: string) =>
    axiosInstance.get<Cart>(`/carrito/${userId}`),

  addItem: (userId: string, item: Omit<CartItem, 'nombre' | 'precio' | 'imagen'> & { productId: string; cantidad: number }) =>
    axiosInstance.post<Cart>(`/carrito/${userId}/agregar`, item),

  updateItem: (userId: string, productId: string, cantidad: number) =>
    axiosInstance.put<Cart>(`/carrito/${userId}/items/${productId}`, { cantidad }),

  removeItem: (userId: string, productId: string) =>
    axiosInstance.delete<Cart>(`/carrito/${userId}/items/${productId}`),

  clearCart: (userId: string) =>
    axiosInstance.delete<Cart>(`/carrito/${userId}/vaciar`),
}