import api from './api';

export interface Income {
  _id: string;
  userId: string;
  amount: number;
  currency: string;
  source: string;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncomeData {
  amount: number;
  currency?: string;
  source: string;
  date?: string;
  notes?: string;
}

export interface UpdateIncomeData {
  amount?: number;
  currency?: string;
  source?: string;
  date?: string;
  notes?: string;
}

export interface IncomeFilters {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface IncomeResponse {
  success: boolean;
  data: Income[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const incomeService = {
  async getIncomes(filters?: IncomeFilters): Promise<IncomeResponse> {
    const response = await api.get<IncomeResponse>('/incomes', { params: filters });
    return response.data;
  },

  async getIncomeById(id: string): Promise<Income> {
    const response = await api.get<{ success: boolean; data: Income }>(`/incomes/${id}`);
    return response.data.data;
  },

  async createIncome(data: CreateIncomeData): Promise<Income> {
    const response = await api.post<{ success: boolean; data: Income }>('/incomes', data);
    return response.data.data;
  },

  async updateIncome(id: string, data: UpdateIncomeData): Promise<Income> {
    const response = await api.put<{ success: boolean; data: Income }>(`/incomes/${id}`, data);
    return response.data.data;
  },

  async deleteIncome(id: string): Promise<void> {
    await api.delete(`/incomes/${id}`);
  },
};

