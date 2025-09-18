import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  StandardsRegister, 
  Statistics, 
  RecentActivity, 
  RegisterStandardForm,
  ChangeStatusForm,
  IDMaster,
  StatusLog 
} from '@/types';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_URL || '';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Generic GET request
  private async get<T>(action: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get('/exec', {
        params: { action, ...params }
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Unknown error'
      };
    }
  }

  // Generic POST request
  private async post<T>(action: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post('/exec', data, {
        params: { action }
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Unknown error'
      };
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.get('health');
  }

  // Statistics
  async getStatistics(): Promise<ApiResponse<Statistics>> {
    return this.get<Statistics>('getStats');
  }

  // Standards
  async getStandards(): Promise<ApiResponse<StandardsRegister[]>> {
    return this.get<StandardsRegister[]>('getStandards');
  }

  async getStandardById(id: string): Promise<ApiResponse<StandardsRegister>> {
    return this.get<StandardsRegister>('getStandardById', { id });
  }

  async registerStandard(data: RegisterStandardForm): Promise<ApiResponse<StandardsRegister>> {
    return this.post<StandardsRegister>('registerStandard', data);
  }

  async updateStandard(id: string, data: Partial<StandardsRegister>): Promise<ApiResponse<StandardsRegister>> {
    return this.post<StandardsRegister>('updateStandard', { id, data });
  }

  // Status Management
  async changeStatus(data: ChangeStatusForm): Promise<ApiResponse> {
    return this.post('changeStatus', data);
  }

  async getStatusLog(id?: string): Promise<ApiResponse<StatusLog[]>> {
    return this.get<StatusLog[]>('getStatusLog', id ? { id } : {});
  }

  // ID Master
  async getIDMaster(): Promise<ApiResponse<IDMaster[]>> {
    return this.get<IDMaster[]>('getIDMaster');
  }

  async addToIDMaster(data: Partial<IDMaster>): Promise<ApiResponse<IDMaster>> {
    return this.post<IDMaster>('addToIDMaster', data);
  }

  // Recent Activity
  async getRecentActivity(limit?: number): Promise<ApiResponse<RecentActivity[]>> {
    return this.get<RecentActivity[]>('getRecentActivity', limit ? { limit } : {});
  }

  // Similar Names (Fuzzy Search)
  async findSimilarNames(name: string): Promise<ApiResponse<{name: string, similarity: number}[]>> {
    return this.get<{name: string, similarity: number}[]>('findSimilarNames', { name });
  }

  // CAS Lookup
  async lookupCAS(name: string): Promise<ApiResponse<{cas: string, source: string}>> {
    return this.get<{cas: string, source: string}>('lookupCAS', { name });
  }

  // Export
  async exportData(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    try {
      const response = await this.client.get('/exec', {
        params: { action: 'exportData', format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Export failed');
    }
  }

  // Configuration
  async getConfig(): Promise<ApiResponse<Record<string, string>>> {
    return this.get<Record<string, string>>('getConfig');
  }

  async updateConfig(key: string, value: string): Promise<ApiResponse> {
    return this.post('updateConfig', { key, value });
  }

  // Holidays
  async getHolidays(): Promise<ApiResponse<{date: string, name: string, type: string}[]>> {
    return this.get<{date: string, name: string, type: string}[]>('getHolidays');
  }

  // LINE Notifications
  async sendLineNotification(message: string, type?: string): Promise<ApiResponse> {
    return this.post('sendLineNotification', { message, type });
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.healthCheck();
      return response.success;
    } catch {
      return false;
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export individual methods for convenience
export const {
  healthCheck,
  getStatistics,
  getStandards,
  getStandardById,
  registerStandard,
  updateStandard,
  changeStatus,
  getStatusLog,
  getIDMaster,
  addToIDMaster,
  getRecentActivity,
  findSimilarNames,
  lookupCAS,
  exportData,
  getConfig,
  updateConfig,
  getHolidays,
  sendLineNotification,
  testConnection
} = apiClient;
