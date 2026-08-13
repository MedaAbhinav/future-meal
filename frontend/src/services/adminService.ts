import api from './api';
import { AdminStats, User, Restaurant, PaginatedResponse } from '../types';

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const response = await api.get('/admin/stats');
    return response.data.data as AdminStats;
  },

  async getUsers(params?: { role?: string; page?: number; size?: number }): Promise<PaginatedResponse<User>> {
    const response = await api.get('/admin/users', { params });
    return response.data.data as PaginatedResponse<User>;
  },

  async getUserById(id: number): Promise<User> {
    const response = await api.get(`/admin/users/${id}`);
    return response.data.data as User;
  },

  async updateUserRole(id: number, role: string): Promise<User> {
    const response = await api.patch(`/admin/users/${id}/role`, { role });
    return response.data.data as User;
  },

  async deactivateUser(id: number): Promise<void> {
    await api.patch(`/admin/users/${id}/deactivate`);
  },

  async getRestaurants(params?: { status?: string; page?: number; size?: number }): Promise<PaginatedResponse<Restaurant>> {
    const response = await api.get('/admin/restaurants', { params });
    return response.data.data as PaginatedResponse<Restaurant>;
  },

  async approveRestaurant(id: number): Promise<Restaurant> {
    const response = await api.patch(`/admin/restaurants/${id}/approve`);
    return response.data.data as Restaurant;
  },

  async suspendRestaurant(id: number, reason: string): Promise<Restaurant> {
    const response = await api.patch(`/admin/restaurants/${id}/suspend`, { reason });
    return response.data.data as Restaurant;
  }
};
