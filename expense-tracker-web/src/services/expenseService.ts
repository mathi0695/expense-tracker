import api from './api';

export interface Expense {
  _id: string;
  userId: string;
  amount: number;
  currency: string;
  categoryId: {
    _id: string;
    name: string;
  };
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseData {
  amount: number;
  currency?: string;
  categoryId: string;
  date?: string;
  notes?: string;
}

export interface UpdateExpenseData {
  amount?: number;
  currency?: string;
  categoryId?: string;
  date?: string;
  notes?: string;
}

export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}

export interface ExpenseResponse {
  success: boolean;
  data: Expense[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const expenseService = {
  async getExpenses(filters?: ExpenseFilters): Promise<ExpenseResponse> {
    const response = await api.get<ExpenseResponse>('/expenses', { params: filters });
    return response.data;
  },

  async getExpenseById(id: string): Promise<Expense> {
    const response = await api.get<{ success: boolean; data: Expense }>(`/expenses/${id}`);
    return response.data.data;
  },

  async createExpense(data: CreateExpenseData): Promise<Expense> {
    const response = await api.post<{ success: boolean; data: Expense }>('/expenses', data);
    return response.data.data;
  },

  async updateExpense(id: string, data: UpdateExpenseData): Promise<Expense> {
    const response = await api.put<{ success: boolean; data: Expense }>(`/expenses/${id}`, data);
    return response.data.data;
  },

  async deleteExpense(id: string): Promise<void> {
    await api.delete(`/expenses/${id}`);
  },
};

