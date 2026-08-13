import api from './api';
import { FutureMeal, FutureMealRequest } from '../types';

export const futureMealService = {
  async createFutureMeal(data: FutureMealRequest): Promise<FutureMeal> {
    const response = await api.post('/future-meals', data);
    return response.data.data as FutureMeal;
  },

  async getMyFutureMeals(): Promise<FutureMeal[]> {
    const response = await api.get('/future-meals');
    return response.data.data as FutureMeal[];
  },

  async getFutureMealById(id: number): Promise<FutureMeal> {
    const response = await api.get(`/future-meals/${id}`);
    return response.data.data as FutureMeal;
  },

  async updateFutureMeal(id: number, data: Partial<FutureMealRequest>): Promise<FutureMeal> {
    const response = await api.put(`/future-meals/${id}`, data);
    return response.data.data as FutureMeal;
  },

  async cancelFutureMeal(id: number): Promise<FutureMeal> {
    const response = await api.patch(`/future-meals/${id}/cancel`);
    return response.data.data as FutureMeal;
  },

  async postponeFutureMeal(id: number, newDate: string, newTime: string): Promise<FutureMeal> {
    const response = await api.patch(`/future-meals/${id}/postpone`, { newDate, newTime });
    return response.data.data as FutureMeal;
  },

  async evaluateFutureMeal(id: number): Promise<FutureMeal> {
    const response = await api.post(`/future-meals/${id}/evaluate`);
    return response.data.data as FutureMeal;
  },

  async orderFutureMeal(id: number, paymentMethod: string): Promise<{ orderId: number; orderNumber: string }> {
    const response = await api.post(`/future-meals/${id}/order`, { paymentMethod });
    return response.data.data as { orderId: number; orderNumber: string };
  },

  async deleteFutureMeal(id: number): Promise<void> {
    await api.delete(`/future-meals/${id}`);
  },

  async getAllFutureMeals(): Promise<FutureMeal[]> {
    const response = await api.get('/admin/future-meals');
    return response.data.data as FutureMeal[];
  }
};
