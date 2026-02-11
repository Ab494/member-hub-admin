import api from '@/lib/api';
import { Member, MemberFilters, PaginatedResponse, RenewalRequest } from '@/types';

export const membersService = {
  getMembers: async (filters: MemberFilters = {}): Promise<PaginatedResponse<Member>> => {
    const response = await api.get<{ success: boolean; data: PaginatedResponse<Member> }>('/members', { params: filters });
    return response.data.data;
  },

  getMember: async (id: string): Promise<Member> => {
    const response = await api.get<{ success: boolean; data: Member }>(`/members/${id}`);
    return response.data.data;
  },

  createMember: async (data: Partial<Member>): Promise<Member> => {
    const response = await api.post<{ success: boolean; data: Member }>('/members', data);
    return response.data.data;
  },

  updateMember: async (id: string, data: Partial<Member>): Promise<Member> => {
    const response = await api.patch<{ success: boolean; data: Member }>(`/members/${id}`, data);
    return response.data.data;
  },

  deleteMember: async (id: string): Promise<void> => {
    await api.delete(`/members/${id}`);
  },

  renewMembership: async (data: RenewalRequest): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; data: { success: boolean; message: string } }>('/renewals', data);
    return response.data.data;
  },
};

export default membersService;
