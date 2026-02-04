import api from './api';

export interface Category {
  _id: string;
  userId: string;
  name: string;
  type: 'expense' | 'income';
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryResponse {
  success: boolean;
  data: Category[];
}

export const categoryService = {
  async getCategories(type?: 'expense' | 'income'): Promise<CategoryResponse> {
    const response = await api.get<CategoryResponse>('/categories', { 
      params: type ? { type } : undefined 
    });
    return response.data;
  },

  async getCategoryById(id: string): Promise<Category> {
    const response = await api.get<{ success: boolean; data: Category }>(`/categories/${id}`);
    return response.data.data;
  },

  async createCategory(data: { name: string; type: 'expense' | 'income' }): Promise<Category> {
    const response = await api.post<{ success: boolean; data: Category }>('/categories', data);
    return response.data.data;
  },

  async updateCategory(id: string, data: { name: string }): Promise<Category> {
    const response = await api.put<{ success: boolean; data: Category }>(`/categories/${id}`, data);
    return response.data.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};

