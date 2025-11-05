import { apiService } from './api';
import { Person, ApiResponse } from '../types';

export interface CreatePersonRequest {
    name: string;
}

export interface UpdatePersonRequest {
    name: string;
}

class PersonService {
    private readonly endpoint = '/persons';

    async getAll(): Promise<ApiResponse<Person[]>> {
        return apiService.get<Person[]>(this.endpoint);
    }

    async getById(id: number): Promise<ApiResponse<Person>> {
        return apiService.get<Person>(`${this.endpoint}/${id}`);
    }

    async create(data: CreatePersonRequest): Promise<ApiResponse<Person>> {
        return apiService.post<Person>(this.endpoint, data);
    }

    async update(id: number, data: UpdatePersonRequest): Promise<ApiResponse<Person>> {
        return apiService.put<Person>(`${this.endpoint}/${id}`, data);
    }

    async delete(id: number): Promise<ApiResponse<void>> {
        return apiService.delete<void>(`${this.endpoint}/${id}`);
    }
}

export const personService = new PersonService();