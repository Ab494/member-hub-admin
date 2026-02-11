import api from '@/lib/api';
import { Payment, PaymentFilters, PaginatedResponse } from '@/types';

export const paymentsService = {
  getPayments: async (filters: PaymentFilters = {}): Promise<PaginatedResponse<Payment>> => {
    const response = await api.get<{ success: boolean; data: PaginatedResponse<Payment> }>('/payments', { params: filters });
    return response.data.data;
  },

  getPayment: async (id: string): Promise<Payment> => {
    const response = await api.get<{ success: boolean; data: Payment }>(`/payments/${id}`);
    return response.data.data;
  },

  getPaymentStats: async (period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    total: number;
    count: number;
    completed: number;
    pending: number;
    failed: number;
  }> => {
    const response = await api.get<{ success: boolean; data: { total: number; count: number; completed: number; pending: number; failed: number } }>('/payments/stats', { params: { period } });
    return response.data.data;
  },

  exportPayments: async (filters: PaymentFilters): Promise<Blob> => {
    const response = await api.get('/payments/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};

export default paymentsService;
