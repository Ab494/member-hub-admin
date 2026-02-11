// User & Authentication
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'STAFF';
  avatar?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Member
export interface Member {
  id: string;
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'active' | 'expired' | 'expiring';
  enrollmentDate: string;
  expiryDate: string;
  packageId: string;
  package?: Package;
  lastPayment?: Payment;
  avatar?: string;
  // AxTraxNG sync fields
  axtraxId?: string;
  axtraxSyncStatus?: 'synced' | 'pending' | 'failed';
  axtraxLastSync?: string;
}

export interface MemberFilters {
  search?: string;
  status?: 'active' | 'expired' | 'expiring' | 'all';
  page?: number;
  limit?: number;
}

// Package
export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in days
  features?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PackageFormData {
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
  isActive: boolean;
}

// Payment
export interface Payment {
  id: string;
  memberId: string;
  member?: Member;
  packageId: string;
  package?: Package;
  amount: number;
  method: 'mpesa' | 'cash' | 'card' | 'bank';
  mpesaPhone?: string;
  mpesaReference?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export interface PaymentFilters {
  memberId?: string;
  startDate?: string;
  endDate?: string;
  status?: 'pending' | 'completed' | 'failed' | 'all';
  page?: number;
  limit?: number;
}

// Renewal
export interface RenewalRequest {
  memberId: string;
  packageId: string;
  mpesaPhone: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  expiringMembers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  recentRenewals: Renewal[];
}

export interface Renewal {
  id: string;
  member: {
    id: string;
    name: string;
    avatar?: string;
  };
  package: {
    id: string;
    name: string;
  };
  amount: number;
  date: string;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
