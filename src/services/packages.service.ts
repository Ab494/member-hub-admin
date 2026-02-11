import api from '@/lib/api';
import { Package, PackageFormData, PaginatedResponse } from '@/types';

export const packagesService = {
  getPackages: async (): Promise<Package[]> => {
    const response = await api.get<{ success: boolean; data: Package[] }>('/packages');
    return response.data.data;
  },

  getPackagesPaginated: async (page = 1, limit = 10): Promise<PaginatedResponse<Package>> => {
    const response = await api.get<{ success: boolean; data: PaginatedResponse<Package> }>('/packages', { params: { page, limit } });
    return response.data.data;
  },

  getPackage: async (id: string): Promise<Package> => {
    const response = await api.get<{ success: boolean; data: Package }>(`/packages/${id}`);
    return response.data.data;
  },

  createPackage: async (data: PackageFormData): Promise<Package> => {
    const response = await api.post<{ success: boolean; data: Package }>('/packages', data);
    return response.data.data;
  },

  updatePackage: async (id: string, data: Partial<PackageFormData>): Promise<Package> => {
    const response = await api.patch<{ success: boolean; data: Package }>(`/packages/${id}`, data);
    return response.data.data;
  },

  deletePackage: async (id: string): Promise<void> => {
    await api.delete(`/packages/${id}`);
  },

  toggleActive: async (id: string): Promise<Package> => {
    const response = await api.post<{ success: boolean; data: Package }>(`/packages/${id}/toggle-active`);
    return response.data.data;
  },
};

export default packagesService;
