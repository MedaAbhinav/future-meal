import api from './api';
import { Address } from '../types';

export const addressService = {
  async getAddresses(): Promise<Address[]> {
    const response = await api.get('/users/addresses');
    return response.data.data as Address[];
  },

  async addAddress(data: Omit<Address, 'id'>): Promise<Address> {
    const response = await api.post('/users/addresses', data);
    return response.data.data as Address;
  },

  async updateAddress(id: number, data: Partial<Address>): Promise<Address> {
    const response = await api.put(`/users/addresses/${id}`, data);
    return response.data.data as Address;
  },

  async deleteAddress(id: number): Promise<void> {
    await api.delete(`/users/addresses/${id}`);
  },

  async setDefaultAddress(id: number): Promise<Address> {
    const response = await api.patch(`/users/addresses/${id}/default`);
    return response.data.data as Address;
  }
};
