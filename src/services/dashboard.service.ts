import api from '@/lib/api';
import { DashboardStats } from '@/types';

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<{ success: boolean; data: DashboardStats }>('/dashboard/stats');
    return response.data.data;
  },

  /**
   * Get revenue chart data
   */
  getRevenueChart: async (period: 'week' | 'month' | 'year' = 'month'): Promise<{
    labels: string[];
    data: number[];
  }> => {
    const response = await api.get('/dashboard/revenue', { params: { period } });
    return response.data.data;
  },

  /**
   * Get membership growth data
   */
  getMembershipGrowth: async (): Promise<{
    labels: string[];
    active: number[];
    total: number[];
  }> => {
    const response = await api.get('/dashboard/membership-growth');
    return response.data.data;
  },
};

export default dashboardService;
