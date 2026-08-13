import api from './api';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    return response.data.data as AuthResponse;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data.data as AuthResponse;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('futuremeal_token');
      localStorage.removeItem('futuremeal_refresh_token');
      localStorage.removeItem('futuremeal_user');
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data.data as User;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put('/users/profile', data);
    return response.data.data as User;
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.put('/users/password', { oldPassword, newPassword });
  },

  saveAuthData(authResponse: AuthResponse): void {
    localStorage.setItem('futuremeal_token', authResponse.token);
    if (authResponse.refreshToken) {
      localStorage.setItem('futuremeal_refresh_token', authResponse.refreshToken);
    }
    localStorage.setItem('futuremeal_user', JSON.stringify(authResponse.user));
  },

  getStoredUser(): User | null {
    const userData = localStorage.getItem('futuremeal_user');
    if (!userData) return null;
    try {
      return JSON.parse(userData) as User;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem('futuremeal_token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getStoredUser();
  }
};
