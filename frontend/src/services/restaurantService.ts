import api from './api';
import { Restaurant, FoodItem, PaginatedResponse, Review, RestaurantStats } from '../types';

export const restaurantService = {
  async getRestaurants(filters?: Record<string, unknown>): Promise<PaginatedResponse<Restaurant>> {
    const response = await api.get('/restaurants', { params: filters });
    const raw = response.data.data;
    // Backend returns a plain List (array), not a paginated object.
    // Normalise to PaginatedResponse shape so consumers work uniformly.
    if (Array.isArray(raw)) {
      return {
        content: raw as Restaurant[],
        page: 0,
        size: raw.length,
        totalElements: raw.length,
        totalPages: 1,
        last: true,
      };
    }
    return raw as PaginatedResponse<Restaurant>;
  },

  async getRestaurantById(id: number): Promise<Restaurant> {
    const response = await api.get(`/restaurants/${id}`);
    return response.data.data as Restaurant;
  },

  async getFeaturedRestaurants(): Promise<Restaurant[]> {
    const response = await api.get('/restaurants/featured');
    return response.data.data as Restaurant[];
  },

  async getNearbyRestaurants(city: string): Promise<Restaurant[]> {
    const response = await api.get('/restaurants/nearby', { params: { city } });
    return response.data.data as Restaurant[];
  },

  async getRestaurantFoods(id: number): Promise<FoodItem[]> {
    const response = await api.get(`/restaurants/${id}/foods`);
    return response.data.data as FoodItem[];
  },

  async getRestaurantReviews(id: number): Promise<Review[]> {
    const response = await api.get(`/restaurants/${id}/reviews`);
    return response.data.data as Review[];
  },

  async searchRestaurants(query: string, city?: string): Promise<Restaurant[]> {
    const response = await api.get('/restaurants/search', { params: { query, city } });
    return response.data.data as Restaurant[];
  },

  async getMyRestaurant(): Promise<Restaurant> {
    const response = await api.get('/owner/restaurant');
    return response.data.data as Restaurant;
  },

  async createRestaurant(data: Partial<Restaurant>): Promise<Restaurant> {
    const response = await api.post('/owner/restaurant', data);
    return response.data.data as Restaurant;
  },

  async updateRestaurant(id: number, data: Partial<Restaurant>): Promise<Restaurant> {
    const response = await api.put(`/owner/restaurant/${id}`, data);
    return response.data.data as Restaurant;
  },

  async getRestaurantStats(): Promise<RestaurantStats> {
    const response = await api.get('/owner/restaurant/stats');
    return response.data.data as RestaurantStats;
  },

  async toggleRestaurantStatus(id: number, isOpen: boolean): Promise<Restaurant> {
    const response = await api.patch(`/owner/restaurant/${id}/status`, { isOpen });
    return response.data.data as Restaurant;
  }
};
