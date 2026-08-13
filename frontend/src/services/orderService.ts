import api from './api';
import { Order, PaymentMethod, PaginatedResponse } from '../types';

export interface PlaceOrderRequest {
  addressId: number;
  paymentMethod: PaymentMethod;
  specialInstructions?: string;
  couponCode?: string;
}

export const orderService = {
  async placeOrder(data: PlaceOrderRequest): Promise<Order> {
    const response = await api.post('/orders', data);
    return response.data.data as Order;
  },

  async getMyOrders(page = 0, size = 10): Promise<PaginatedResponse<Order>> {
    const response = await api.get('/orders', { params: { page, size } });
    return response.data.data as PaginatedResponse<Order>;
  },

  async getOrderById(id: number): Promise<Order> {
    const response = await api.get(`/orders/${id}`);
    return response.data.data as Order;
  },

  async getOrderByNumber(orderNumber: string): Promise<Order> {
    const response = await api.get(`/orders/track/${orderNumber}`);
    return response.data.data as Order;
  },

  async cancelOrder(id: number, reason: string): Promise<Order> {
    const response = await api.patch(`/orders/${id}/cancel`, { reason });
    return response.data.data as Order;
  },

  async reorder(orderId: number): Promise<void> {
    await api.post(`/orders/${orderId}/reorder`);
  },

  async rateOrder(orderId: number, rating: number, comment: string): Promise<void> {
    await api.post(`/orders/${orderId}/review`, { rating, comment });
  },

  async getRestaurantOrders(status?: string): Promise<Order[]> {
    const response = await api.get('/owner/orders', { params: { status } });
    return response.data.data as Order[];
  },

  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    const response = await api.patch(`/owner/orders/${orderId}/status`, { status });
    return response.data.data as Order;
  },

  async getAvailableDeliveries(): Promise<Order[]> {
    const response = await api.get('/delivery/available');
    return response.data.data as Order[];
  },

  async acceptDelivery(orderId: number): Promise<Order> {
    const response = await api.post(`/delivery/orders/${orderId}/accept`);
    return response.data.data as Order;
  },

  async updateDeliveryStatus(orderId: number, status: string): Promise<Order> {
    const response = await api.patch(`/delivery/orders/${orderId}/status`, { status });
    return response.data.data as Order;
  }
};
