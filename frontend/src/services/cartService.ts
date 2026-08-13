import api from './api';
import { Cart } from '../types';

export const cartService = {
  async getCart(): Promise<Cart> {
    const response = await api.get('/cart');
    return response.data.data as Cart;
  },

  async addToCart(foodItemId: number, quantity: number, specialInstructions?: string): Promise<Cart> {
    const response = await api.post('/cart/items', { foodItemId, quantity, specialInstructions });
    return response.data.data as Cart;
  },

  async updateCartItem(itemId: number, quantity: number, specialInstructions?: string): Promise<Cart> {
    const response = await api.put(`/cart/items/${itemId}`, { quantity, specialInstructions });
    return response.data.data as Cart;
  },

  async removeCartItem(itemId: number): Promise<Cart> {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data.data as Cart;
  },

  async clearCart(): Promise<void> {
    await api.delete('/cart');
  },

  async applyCoupon(couponCode: string): Promise<Cart> {
    const response = await api.post('/cart/coupon', { couponCode });
    return response.data.data as Cart;
  },

  async removeCoupon(): Promise<Cart> {
    const response = await api.delete('/cart/coupon');
    return response.data.data as Cart;
  }
};

export interface LocalCartItem {
  foodItemId: number;
  foodItemName: string;
  foodItemImage: string;
  price: number;
  quantity: number;
  restaurantId: number;
  restaurantName: string;
  specialInstructions?: string;
  dietaryType: string;
}

const CART_KEY = 'futuremeal_local_cart';

export const localCartService = {
  getCart(): LocalCartItem[] {
    const cartData = localStorage.getItem(CART_KEY);
    if (!cartData) return [];
    try {
      return JSON.parse(cartData) as LocalCartItem[];
    } catch {
      return [];
    }
  },

  addItem(item: LocalCartItem): LocalCartItem[] {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(i => i.foodItemId === item.foodItemId);
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += item.quantity;
    } else {
      cart.push(item);
    }
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    return cart;
  },

  updateQuantity(foodItemId: number, quantity: number): LocalCartItem[] {
    const cart = this.getCart();
    const index = cart.findIndex(i => i.foodItemId === foodItemId);
    if (index >= 0) {
      if (quantity <= 0) {
        cart.splice(index, 1);
      } else {
        cart[index].quantity = quantity;
      }
    }
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    return cart;
  },

  removeItem(foodItemId: number): LocalCartItem[] {
    const cart = this.getCart().filter(i => i.foodItemId !== foodItemId);
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    return cart;
  },

  clear(): void {
    localStorage.removeItem(CART_KEY);
  },

  getTotal(): number {
    return this.getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getItemCount(): number {
    return this.getCart().reduce((sum, item) => sum + item.quantity, 0);
  }
};
