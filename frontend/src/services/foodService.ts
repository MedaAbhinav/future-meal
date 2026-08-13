import api from './api';
import { FoodItem, PaginatedResponse } from '../types';

export const foodService = {
  async getFoods(params?: Record<string, unknown>): Promise<PaginatedResponse<FoodItem>> {
    const response = await api.get('/foods', { params });
    return response.data.data as PaginatedResponse<FoodItem>;
  },

  async getFoodById(id: number): Promise<FoodItem> {
    const response = await api.get(`/foods/${id}`);
    return response.data.data as FoodItem;
  },

  async searchFoods(query: string): Promise<FoodItem[]> {
    const response = await api.get('/foods/search', { params: { query } });
    return response.data.data as FoodItem[];
  },

  async getPopularFoods(): Promise<FoodItem[]> {
    const response = await api.get('/foods/popular');
    return response.data.data as FoodItem[];
  },

  async getFoodsByCategory(cuisine: string): Promise<FoodItem[]> {
    const response = await api.get('/foods/cuisine', { params: { cuisine } });
    return response.data.data as FoodItem[];
  },

  async createFood(data: Partial<FoodItem>): Promise<FoodItem> {
    const response = await api.post('/owner/foods', data);
    return response.data.data as FoodItem;
  },

  async updateFood(id: number, data: Partial<FoodItem>): Promise<FoodItem> {
    const response = await api.put(`/owner/foods/${id}`, data);
    return response.data.data as FoodItem;
  },

  async deleteFood(id: number): Promise<void> {
    await api.delete(`/owner/foods/${id}`);
  },

  async toggleFoodAvailability(id: number, isAvailable: boolean): Promise<FoodItem> {
    const response = await api.patch(`/owner/foods/${id}/availability`, { isAvailable });
    return response.data.data as FoodItem;
  }
};
