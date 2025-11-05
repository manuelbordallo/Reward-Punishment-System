import axios from 'axios';
import { Person, Reward, Punishment, Assignment, Score, WeeklyScore } from '../types';

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

// Score API
export const scoreApi = {
    getTotal: () => api.get<ApiResponse<Score[]>>('/scores/total'),
    getWeekly: () => api.get<ApiResponse<WeeklyScore[]>>('/scores/weekly'),
};