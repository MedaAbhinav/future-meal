import api from './api';
import { User } from '../types';

export const userService = {
  async getProfile(): Promise<User> {
    const response = await api.get('/users/profile');
    return response.data.data as User;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put('/users/profile', data);
    return response.data.data as User;
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.put('/users/password', { oldPassword, newPassword });
  },
};
