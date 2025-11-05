import axios from 'axios';
import { Person, Reward, Punishment, Action, Assignment, Score, WeeklyScore } from '../types';

// For single service deployment, use relative URLs
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// API Response wrapper type
interface ApiResponse<T> {
    success: boolean;
    data: T;
}

// Person API
export const personApi = {
    getAll: () => api.get<ApiResponse<Person[]>>('/persons'),
    create: (data: { name: string }) => api.post<ApiResponse<Person>>('/persons', data),
    update: (id: number, data: { name: string }) => api.put<ApiResponse<Person>>(`/persons/${id}`, data),
    delete: (id: number) => api.delete(`/persons/${id}`),
};

// Reward API
export const rewardApi = {
    getAll: () => api.get<ApiResponse<Reward[]>>('/rewards'),
    create: (data: { name: string; value: number }) => api.post<ApiResponse<Reward>>('/rewards', data),
    update: (id: number, data: { name: string; value: number }) => api.put<ApiResponse<Reward>>(`/rewards/${id}`, data),
    delete: (id: number) => api.delete(`/rewards/${id}`),
};

// Punishment API
export const punishmentApi = {
    getAll: () => api.get<ApiResponse<Punishment[]>>('/punishments'),
    create: (data: { name: string; value: number }) => api.post<ApiResponse<Punishment>>('/punishments', data),
    update: (id: number, data: { name: string; value: number }) => api.put<ApiResponse<Punishment>>(`/punishments/${id}`, data),
    delete: (id: number) => api.delete(`/punishments/${id}`),
};

// Assignment API
export const assignmentApi = {
    getAll: () => api.get<ApiResponse<Assignment[]>>('/assignments'),
    create: (data: { personIds: number[]; itemType: 'reward' | 'punishment'; itemId: number }) =>
        api.post<ApiResponse<Assignment>>('/assignments', data),
    delete: (id: number) => api.delete(`/assignments/${id}`),
};

// Action API (unified rewards and punishments)
export const actionApi = {
    getAll: (filters?: { type?: 'positive' | 'negative'; minValue?: number; maxValue?: number }) => {
        const params = new URLSearchParams();
        if (filters?.type) params.append('type', filters.type);
        if (filters?.minValue !== undefined) params.append('minValue', filters.minValue.toString());
        if (filters?.maxValue !== undefined) params.append('maxValue', filters.maxValue.toString());
        
        const queryString = params.toString();
        return api.get<ApiResponse<Action[]>>(`/actions${queryString ? `?${queryString}` : ''}`);
    },
    getPositive: () => api.get<ApiResponse<Action[]>>('/actions/positive'),
    getNegative: () => api.get<ApiResponse<Action[]>>('/actions/negative'),
    getById: (id: number) => api.get<ApiResponse<Action>>(`/actions/${id}`),
    create: (data: { name: string; value: number; type: 'positive' | 'negative' }) => 
        api.post<ApiResponse<Action>>('/actions', data),
    update: (id: number, data: { name?: string; value?: number; type?: 'positive' | 'negative' }) => 
        api.put<ApiResponse<Action>>(`/actions/${id}`, data),
    delete: (id: number) => api.delete(`/actions/${id}`),
    search: (query: string) => api.get<ApiResponse<Action[]>>(`/actions/search?q=${encodeURIComponent(query)}`),
    getStatistics: () => api.get<ApiResponse<any>>('/actions/statistics'),
};

// Score API
export const scoreApi = {
    getTotal: () => api.get<ApiResponse<Score[]>>('/scores/total'),
    getWeekly: () => api.get<ApiResponse<WeeklyScore[]>>('/scores/weekly'),
};
