import { apiService } from './api';
import { Punishment, ApiResponse } from '../types';

export interface CreatePunishmentRequest {
  name: string;
  value: number; // Must be negative
}

export interface UpdatePunishmentRequest {
  name: string;
  value: number; // Must be negative
}

class PunishmentService {
  private readonly endpoint = '/punishments';

  async getAll(): Promise<ApiResponse<Punishment[]>> {
    return apiService.get<Punishment[]>(this.endpoint);
  }

  async getById(id: number): Promise<ApiResponse<Punishment>> {
    return apiService.get<Punishment>(`${this.endpoint}/${id}`);
  }

  async create(data: CreatePunishmentRequest): Promise<ApiResponse<Punishment>> {
    // Validate that value is negative
    if (data.value >= 0) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Punishment value must be negative',
        },
      };
    }

    return apiService.post<Punishment>(this.endpoint, data);
  }

  async update(id: number, data: UpdatePunishmentRequest): Promise<ApiResponse<Punishment>> {
    // Validate that value is negative
    if (data.value >= 0) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Punishment value must be negative',
        },
      };
    }

    return apiService.put<Punishment>(`${this.endpoint}/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.endpoint}/${id}`);
  }
}

export const punishmentService = new PunishmentService();