import { apiService } from './api';
import { Assignment, ApiResponse } from '../types';

export interface CreateAssignmentRequest {
    personIds: number[]; // Multiple persons can be assigned
    itemType: 'reward' | 'punishment';
    itemId: number;
}

export interface AssignmentWithDetails extends Assignment {
    personName: string;
}

class AssignmentService {
    private readonly endpoint = '/assignments';

    async getAll(): Promise<ApiResponse<AssignmentWithDetails[]>> {
        return apiService.get<AssignmentWithDetails[]>(this.endpoint);
    }

    async getById(id: number): Promise<ApiResponse<Assignment>> {
        return apiService.get<Assignment>(`${this.endpoint}/${id}`);
    }

    async getByPersonId(personId: number): Promise<ApiResponse<Assignment[]>> {
        return apiService.get<Assignment[]>(`${this.endpoint}/person/${personId}`);
    }

    async create(data: CreateAssignmentRequest): Promise<ApiResponse<Assignment[]>> {
        // Validate that at least one person is selected
        if (!data.personIds || data.personIds.length === 0) {
            return {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'At least one person must be selected',
                },
            };
        }

        // Validate item type
        if (!['reward', 'punishment'].includes(data.itemType)) {
            return {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Item type must be either reward or punishment',
                },
            };
        }

        return apiService.post<Assignment[]>(this.endpoint, data);
    }

    async delete(id: number): Promise<ApiResponse<void>> {
        return apiService.delete<void>(`${this.endpoint}/${id}`);
    }

    async deleteByPersonId(personId: number): Promise<ApiResponse<void>> {
        return apiService.delete<void>(`${this.endpoint}/person/${personId}`);
    }
}

export const assignmentService = new AssignmentService();