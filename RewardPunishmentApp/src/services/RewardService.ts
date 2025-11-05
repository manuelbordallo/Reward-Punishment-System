import { apiService } from './api';
import { Reward, ApiResponse } from '../types';

export interface CreateRewardRequest {
  name: string;
  value: number; // Must be positive
}

export interface UpdateRewardRequest {
  name: string;
  value: number; // Must be positive
}

class RewardService {
  private readonly endpoint = '/rewards';

  async getAll(): Promise<ApiResponse<Reward[]>> {
    return apiService.get<Reward[]>(this.endpoint);
  }

  async getById(id: number): Promise<ApiResponse<Reward>> {
    return apiService.get<Reward>(`${this.endpoint}/${id}`);
  }

  async create(data: CreateRewardRequest): Promise<ApiResponse<Reward>> {
    // Validate that value is positive
    if (data.value <= 0) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Reward value must be positive',
        },
      };
    }

    return apiService.post<Reward>(this.endpoint, data);
  }

  async update(id: number, data: UpdateRewardRequest): Promise<ApiResponse<Reward>> {
    // Validate that value is positive
    if (data.value <= 0) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Reward value must be positive',
        },
      };
    }

    return apiService.put<Reward>(`${this.endpoint}/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.endpoint}/${id}`);
  }
}

export const rewardService = new RewardService();